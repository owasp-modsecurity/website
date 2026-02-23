---
title: 'About body limitations'
date: '2026-02-22T00:00:00+02:00'
author: airween
---

Have you ever wondered what exactly the request body limits mean in ModSecurity and how they work?

<!--more-->

As you probably know, ModSecurity has two limits on the size of the request body: [SecRequestBodyLimit](https://github.com/owasp-modsecurity/ModSecurity/wiki/Reference-Manual-(v2.x) and [SecRequestBodyNoFilesLimit](https://github.com/owasp-modsecurity/ModSecurity/wiki/Reference-Manual-(v2.x)#secrequestbodynofileslimit).

There is also a handler for a special case, what to do if the body size is larger than expected - [SecRequestBodyLimitAction](https://github.com/owasp-modsecurity/ModSecurity/wiki/Reference-Manual-(v2.x)#secrequestbodylimitaction).

Two new PRs (for [v3](https://github.com/owasp-modsecurity/ModSecurity/pull/3476) and for [v2](https://github.com/owasp-modsecurity/ModSecurity/pull/3483)) have recently appeared on GH, from Hiroaki Nakamura ([@hnakamur](https://github.com/hnakamur)), where he tried to improve the behavior of these limits.


Under the PR [3483](https://github.com/owasp-modsecurity/ModSecurity/pull/3483) we discussed a lot about how could he make that better, and we are a bit stuck.

I think it would be good to know what the community's expectations are for this feature, but first, let me explain how these restrictions work in reality.

#### A really simple example

I changed the engine a little to demonstrate the behavior - it always shows the size that exceeds the limit, and the limit itself.

I think the first question is which constraint is "stronger", what the engine checks first.

Consider we have a simple JSON file with length of 120 bytes:
```
$ cat payloadmin4.json 
[1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456]

$ ls -l payloadmin4.json 
-rw-rw-r-- 1 airween airween 120 febr  15 19.45 payloadmin4.json
```

Now let's set the restrictions to extremely low to see what happens if I send the above file:
```
SecRequestBodyLimit 115
SecRequestBodyNoFilesLimit 110
```

The `NoFiles` limit usually lower than the "single" one, and this is very important to understand why. We can see this later.

Now let's send the request:
```
$ curl -v -H "Content-Type: application/json" -X POST --data @payloadmin4.json http://localhost
...
> POST / HTTP/1.1
> Host: localhost
> User-Agent: curl/8.18.0
> Accept: */*
> Content-Type: application/json
> Content-Length: 120
```
and check the log:
```
ModSecurity: Request body (Content-Length (120)) is larger than the configured limit (115).
```

As you can see the first limitation that engine checks is the `SecRequestBodyLimit`. If it's bigger than the value has set, the engine will blocks the request immediatelly.

Now increase the `SecRequestBodyLimit` higher than the body size, and check it again:

```
SecRequestBodyLimit 130
SecRequestBodyNoFilesLimit 110
```
Send the request again and check the log:
```
ModSecurity: Request body no files data length (120) is larger than the configured limit (110).
```
Now the no files limitation was exceeded - the value we set is 110, but the payload size is 120.

**Conclusion**: The first variable that the engine checks is the `SecRequestBodyLimit`, and the second one is the `SecRequestBodyNoFilesLimit`.

#### What's the difference between the two limitations?

The `SecRequestBodyLimit` controls the **entire request body size**, no matter what's the request's `Content-Type`.

The `SecRequestBodyNoFilesLimit` as the documentation [says](https://github.com/owasp-modsecurity/ModSecurity/wiki/Reference-Manual-(v2.x)#secrequestbodynofileslimit):
>_"Configures the maximum request body size ModSecurity will accept for buffering, excluding the size of any files being transported in the request."_

In other words: anything that is not a file to be uploaded.

We have now come to understand why the limit on the NoFiles is lower than the total limit. If a user wants to upload a file, it can usually be much, much larger than a "simple" form request.

#### Understanding the excluded size

Okay, but what is the term _"excluding the size of any files being transported"_?

If we send a JSON request, then it's not a file, the entire JSON payload is subject to the assessment of this directive - see where we set the `SecRequestBodyLimit` to 130, and the no files limit blocked the request.

If we create a smaller file and try to send it, it works as we expect:

```
$ cat payloadmin2.json 
[1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456]

$ ls -la payloadmin2.json 
-rw-rw-r-- 1 airween airween 103 febr  15 19.58 payloadmin2.json
```
Now we have a JSON file with 103 bytes. Send it:
```
$ curl -v -H "Content-Type: application/json" -X POST --data @payloadmin2.json http://localhost
...
> POST / HTTP/1.1
> Host: localhost
> User-Agent: curl/8.18.0
> Accept: */*
> Content-Type: application/json
> Content-Length: 103
```

Got 200, no issue, hooray.

Note, that the behavior is the same if you send an XML or URL encoded requests.

And now try to send the same file but as a file upload - for this we can use the multipart request, and the `-F` switch for `curl`:
```
$ curl -v -F "upload=@payloadmin2.json" http://localhost
...
> POST / HTTP/1.1
> Host: localhost
> User-Agent: curl/8.18.0
> Accept: */*
> Content-Length: 325
> Content-Type: multipart/form-data; boundary=------------------------yR5iNnu9lY48kNvLTbqOiH
```

The request size is 325 bytes, and we got:
```
Request body no files data length (118) is larger than the configured limit (110)
```

Hmmm... what's 325 bytes, and what's 118 bytes there? The JSON file's size is 103 bytes.

The 325 bytes is the size of the multipart request. In this type, the client splits the files into multiple parts and adds boundaries. This additional content increases the request size from 103 to 325 bytes, like this:
```
--------------------------yR5iNnu9lY48kNvLTbqOiH
Content-Disposition: form-data; name="upload"; filename="payloadmin2.json"
Content-Type: application/octet-stream

[1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456]
--------------------------yR5iNnu9lY48kNvLTbqOiH--

```
The length of this request (with EOL characters (CRLF!)) is 325 bytes in total. Without boundaries, we got this part:
```
Content-Disposition: form-data; name="upload"; filename="payloadmin2.json"
Content-Type: application/octet-stream

[1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456]
```
Also, here we need to count CRLF's in. The total size of this part is 221 bytes. It's still not 103 and not 108 bytes... But let's count the "additional" parts of the request:
```
Content-Disposition: form-data; name="upload"; filename="payloadmin2.json"\r\n
```
This is a 76 bytes long string.
```
Content-Type: application/octet-stream\r\n
```
Here the lengt is 40. And finally an empty line:
```
\r\n
```
where the length is 2.

76 + 40 + 2 = 118.

This is the "magic" part that the engine _excludes_ from the payload. If there are multiple files to upload, each file will have a section like this, and these additional sections will produce the content that the engine compares to the `SecRequestBodyNoFilesLimit` value.

With the default settings, ModSecurity allows 12.5MB for `SecRequestBodyLimit` and 128kB for `SecRequestBodyNoFilesLimit` - see the [recommended](https://github.com/owasp-modsecurity/ModSecurity/blob/v2/master/modsecurity.conf-recommended#L45-L46) config file. This means:
* if the content type of the request is JSON, XML or URL encoded, then the `SecRequestBodyNoFilesLimit` (the lower) will be applied (even if the payload is extreme high, because this is much lower)
* if the content type is multipart, then the total size will be compared with `SecRequestBodyLimit` **AND** the excluded part with the `SecRequestBodyNoFilesLimit` values.

**A very important note**: both configuration directives have a hard-coded limit in v2 engine, which is 1GB (see the documentation above). In v3, there is no hard-coded limit, and I think that's the normal. We will remove this limit from v2 soon.

#### A misterious SecRequestBodyLimitAction directive

As I mentioned above, ModSecurity has a directive to handle a special case, the `SecRequestBodyLimitAction`. The possible values are `Reject` (this is the default) or `ProcessPartial`. This describe the behavior, what the engine needs to do if the size is bigger than the configured one - in case of default values, what does it need to do if the payload size is greater than 12.5 MB.

`Reject` is clear: it terminates the connection with status 413.

`ProcessPartial` is a bit more sophisticated, because it processes the part which is under the limit, but does not care about the rest.

Wait... the rest don't care? So does this mean that if someone sends a multipart request that is larger than allowed and the admin has set the engine to `ProcessPartial`, the rest of the checks will be skipped?

Yes, yes.

Let's see how does this work.

I have three files:
```
$ cat file1.json
[1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456]

$ cat file2.json
{"array.array_1": "1234567890123456", "array.array_2": "1234567890123456", "array.array_3": "1234567890123456", "array.array_4": "1234567890123456"}

$ cat file3.json
["attack"]

$ ls -la file1.json file2.json file3.json 
-rw-rw-r-- 1 airween airween 148 febr  15 19.45 file1.json
-rw-rw-r-- 1 airween airween 120 febr  15 19.45 file2.json
-rw-rw-r-- 1 airween airween  11 febr  15 19.45 file3.json
```

Create a rule that checks the files' content:
```
SecRule FILES_TMP_CONTENT "@rx attack" "id:192372,log,deny"
```
and just for sure, increase the extreme lower value to a bit higher:
```
SecRequestBodyLimit 400
SecRequestBodyNoFilesLimit 350
```

Now send the multipart request, but be sure that the file with content "attack" is the first (this means the file is under the limit):
```
$ curl -v -F "upload1=@file3.json" -F "upload2=@file2.json" -F "upload3=file1.json" http://localhost
```
Check the log:
```
ModSecurity: Request body (Content-Length (671)) is larger than the configured limit (400).
...
ModSecurity: Warning. Pattern match "attack" at FILES_TMP_CONTENT:upload1.
```
What we see here is that the engine warns us that the size is higher than the configured limit, but no worries, the admin set the limit actio to `ProjectPartial`, so it continues the investigation. Then it checks the first file (which contains the pattern "attack") and the rule is triggered.

Let's change the order of the files:
```
$ curl -v -F "upload1=@file1.json" -F "upload2=@file2.json" -F "upload3=file3.json" http://localhost
```
and check the log:
```
ModSecurity: Request body (Content-Length (780)) is larger than the configured limit (400).
```
Ops... there is no triggered rule.

This is what the `ProcessPartial` does.

#### Why was this feature added?

To understand the situation, please read the [documentation](https://github.com/owasp-modsecurity/ModSecurity/wiki/Reference-Manual-(v2.x)#secrequestbodylimitaction):

>_By default, ModSecurity will reject a request body that is longer than specified. This is problematic especially when ModSecurity is being run in DetectionOnly mode and the intent is to be totally passive and not take any disruptive actions against the transaction. With the ability to choose what happens once a limit is reached, site administrators can choose to inspect only the first part of the request, the part that can fit into the desired limit, and let the rest through. This is not ideal from a possible evasion issue perspective, however it may be acceptable under certain circumstances._

#### Extend this behavior

Back to PRs. The main concept is to extend this behavior to other payloads, such as JSON, XML, and URL-encoded data. The proposed directive is `SecRequestBodyNoFilesLimitAction` and would follow the behavior of `SecRequestBodyLimitAction`, but there is another option to extend the behavior of the existing directive to XML/JSON and URL-encoded requests.

There is no similar feature to avoid the 413 error for JSON/XML or URL-encoded requests. Even in `DetectionOnly` mode, if the engine reaches the `SecRequestBodyNoFilesLimit` limit, the client will receive a 413 error.

This feature allowed clients to send larger payloads than allowed during the test period, and the administrator could collect logs.







