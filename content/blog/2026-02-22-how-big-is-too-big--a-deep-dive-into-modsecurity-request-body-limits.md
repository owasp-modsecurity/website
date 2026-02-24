---
title: 'How Big Is Too Big? A Deep Dive into ModSecurity Request Body Limits'
date: '2026-02-22T00:00:00+02:00'
author: airween
---

Have you ever wondered what exactly the request body limits mean in ModSecurity and how they work?

<!--more-->

As you probably know, ModSecurity has two limits on the size of the request body: [SecRequestBodyLimit](https://github.com/owasp-modsecurity/ModSecurity/wiki/Reference-Manual-(v2.x)#secrequestbodylimit) and [SecRequestBodyNoFilesLimit](https://github.com/owasp-modsecurity/ModSecurity/wiki/Reference-Manual-(v2.x)#secrequestbodynofileslimit).

There is also a handler for the case, when the request body size is larger than expected - [SecRequestBodyLimitAction](https://github.com/owasp-modsecurity/ModSecurity/wiki/Reference-Manual-(v2.x)#secrequestbodylimitaction).

Two new PRs (for [v3](https://github.com/owasp-modsecurity/ModSecurity/pull/3476) and for [v2](https://github.com/owasp-modsecurity/ModSecurity/pull/3483)) have recently appeared on GH, from Hiroaki Nakamura ([@hnakamur](https://github.com/hnakamur)), where he tried to improve the behavior of these limits.


We've had a long discussion ([3483](https://github.com/owasp-modsecurity/ModSecurity/pull/3483)) about how the current behaviour can be improved, and we are a bit stuck.

I think it would be good to know what the community's expectations are for this feature, but first, let me explain how these restrictions work in reality.

#### A really simple example

For the following, I've modified the engine a little to demonstrate the behaviour - it always shows the amount by which a limit has been exceeded, and the limit itself.

I think the first question to examine is which constraint is "stronger", i.e., which limit does the engine check first.

Consider a simple JSON file with a length of 120 bytes:
```bash
$ cat payloadmin4.json 
[1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456]

$ ls -l payloadmin4.json 
-rw-rw-r-- 1 airween airween 120 febr  15 19.45 payloadmin4.json
```

Now let's set the limits to very low values to see what happens when I send the above file:
```apache
SecRequestBodyLimit 115
SecRequestBodyNoFilesLimit 110
```

`SecRequestBodyNoFilesLimit` limit is usually lower than `SecRequestBodyLimit` — we'll see why below.

Now let's send the request:
```bash
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
```bash
ModSecurity: Request body (Content-Length (120)) is larger than the configured limit (115).
```

As you can see, the first limit the engine checks is `SecRequestBodyLimit`. If the body is bigger than the configured value, the engine blocks the request immediately.

Now we'll set `SecRequestBodyLimit` higher than `SecRequestBodyNoFilesLimit` and check again:

```apache
SecRequestBodyLimit 130
SecRequestBodyNoFilesLimit 110
```
Send the request again and check the log:
```bash
ModSecurity: Request body no files data length (120) is larger than the configured limit (110).
```
Now the no-files limitation was exceeded — we set the limit to 110, but the payload is 120 bytes.

**Conclusion**: The first variable that the engine checks is the `SecRequestBodyLimit`, and the second one is the `SecRequestBodyNoFilesLimit`.

#### What's the difference between the two limits on the request body size?

The `SecRequestBodyLimit` controls the **entire request body size**, no matter what's the request's `Content-Type`.

The `SecRequestBodyNoFilesLimit` as the documentation [says](https://github.com/owasp-modsecurity/ModSecurity/wiki/Reference-Manual-(v2.x)#secrequestbodynofileslimit):
>_"Configures the maximum request body size ModSecurity will accept for buffering, excluding the size of any files being transported in the request."_

In other words: anything that is not a file to be uploaded.

Now we can see why the NoFiles limit is lower than the total limit. File uploads are typically much larger than simple form submissions.

#### Understanding the excluded size

Okay, but what is the term _"excluding the size of any files being transported"_?

If we send a JSON request, it's not a file upload, so the entire JSON payload counts against this directive — recall when we set `SecRequestBodyLimit` to 130 and the no-files limit blocked the request.

If we create a smaller file and try to send it, it works as we expect:

```bash
$ cat payloadmin2.json 
[1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456]

$ ls -la payloadmin2.json 
-rw-rw-r-- 1 airween airween 103 febr  15 19.58 payloadmin2.json
```
Now we have a JSON file with 103 bytes. Send it:
```bash
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

Note that the behavior is the same if you send XML or URL-encoded requests.

And now try to send the same file but as a file upload - for this we can use the multipart request, and the `-F` switch for `curl`:
```bash
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
```apache
Request body no files data length (118) is larger than the configured limit (110)
```

Hmmm... where do the 325 bytes and 118 bytes come from? The JSON file is only 103 bytes.

The 325 bytes is the size of the multipart request. In this type, the client splits the files into multiple parts and adds boundaries. This additional content increases the request size from 103 to 325 bytes, like this:
```plain
--------------------------yR5iNnu9lY48kNvLTbqOiH
Content-Disposition: form-data; name="upload"; filename="payloadmin2.json"
Content-Type: application/octet-stream

[1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456]
--------------------------yR5iNnu9lY48kNvLTbqOiH--

```
The length of this request, including line endings (CRLF), is 325 bytes in total. Without boundaries, we have this part:
```plain
Content-Disposition: form-data; name="upload"; filename="payloadmin2.json"
Content-Type: application/octet-stream

[1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456,1234567890123456]
```
We also need to count the CRLFs. The total size of this part is 221 bytes — still not 103 or 118 bytes. Let's count the non-file parts of the request:
```plain
Content-Disposition: form-data; name="upload"; filename="payloadmin2.json"\r\n
```
This is a 76 bytes long string.
```plain
Content-Type: application/octet-stream\r\n
```
This is 40 bytes. And finally, an empty line:
```plain
\r\n
```
where the length is 2.

76 + 40 + 2 = 118.

This is the "magic" part that the engine _excludes_ from the payload. If there are multiple files to upload, each file will have a section like this, and these sections make up the overhead that the engine compares against the `SecRequestBodyNoFilesLimit` value.

With the default settings, ModSecurity allows 12.5MB for `SecRequestBodyLimit` and 128kB for `SecRequestBodyNoFilesLimit` - see the [recommended](https://github.com/owasp-modsecurity/ModSecurity/blob/v2/master/modsecurity.conf-recommended#L45-L46) config file. This means:
* if the content type of the request is JSON, XML, or URL-encoded, then `SecRequestBodyNoFilesLimit` (the lower value) will be applied (even if the payload is extremely large, because this limit is much lower)
* if the content type is multipart, then the total size is checked against `SecRequestBodyLimit` **and** the non-file portion against `SecRequestBodyNoFilesLimit`

**A very important note**: both configuration directives have a hard-coded limit in the v2 engine, which is 1GB (see the documentation above). In v3, there is no hard-coded limit, which is the expected behavior. We will remove this limit from v2 soon.

#### A mysterious SecRequestBodyLimitAction directive

As I mentioned above, ModSecurity has a directive to handle this case: `SecRequestBodyLimitAction`. The possible values are `Reject` (the default) or `ProcessPartial`. This describes what the engine should do when the body exceeds the configured limit — with default values, what to do if the payload is greater than 12.5 MB.

`Reject` is clear: it terminates the connection with status 413.

`ProcessPartial` is more sophisticated: it processes data up to the limit and ignores the rest.

Wait... the rest isn't inspected? So if someone sends a multipart request larger than allowed and the admin has set the engine to `ProcessPartial`, the remaining data won't be checked?

Yes, yes.

Let's see how this works.

I have three files:
```bash
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
```apache
SecRule FILES_TMP_CONTENT "@rx attack" "id:192372,log,deny"
```
and just in case, increase the extremely low limits a bit:
```apache
SecRequestBodyLimit 400
SecRequestBodyNoFilesLimit 350
```

Now send the multipart request, but be sure that the file with content "attack" is the first (this means the file is under the limit):
```bash
$ curl -v -F "upload1=@file3.json" -F "upload2=@file2.json" -F "upload3=@file1.json" http://localhost
```
Check the log:
```bash
ModSecurity: Request body (Content-Length (671)) is larger than the configured limit (400).
...
ModSecurity: Warning. Pattern match "attack" at FILES_TMP_CONTENT:upload1.
```
What we see here is that the engine warns us that the size exceeds the configured limit, but since the admin set the limit action to `ProcessPartial`, it continues processing. It then inspects the first file (which contains the pattern "attack") and the rule fires.

Let's change the order of the files:
```bash
$ curl -v -F "upload1=@file1.json" -F "upload2=@file2.json" -F "upload3=file3.json" http://localhost
```
and check the log:
```bash
ModSecurity: Request body (Content-Length (780)) is larger than the configured limit (400).
```
Oops — the rule didn't fire.

This is what the `ProcessPartial` does.

#### Why was this feature added?

The [documentation](https://github.com/owasp-modsecurity/ModSecurity/wiki/Reference-Manual-(v2.x)#secrequestbodylimitaction) explains why `ProcessPartial` was added to the engine:

>_By default, ModSecurity will reject a request body that is longer than specified. This is problematic especially when ModSecurity is being run in DetectionOnly mode and the intent is to be totally passive and not take any disruptive actions against the transaction. With the ability to choose what happens once a limit is reached, site administrators can choose to inspect only the first part of the request, the part that can fit into the desired limit, and let the rest through. This is not ideal from a possible evasion issue perspective, however it may be acceptable under certain circumstances._

#### Extend this behavior

Back to PRs. The main concept of the open PRs is to extend this behavior to other payloads, such as JSON, XML, and URL-encoded data. The proposed directive is `SecRequestBodyNoFilesLimitAction` and would follow the behavior of `SecRequestBodyLimitAction`, but another option is to extend the existing directive's behavior to cover JSON/XML and URL-encoded requests.

There is currently no way to avoid the 413 error for JSON/XML or URL-encoded requests. Even in `DetectionOnly` mode, if the engine reaches the `SecRequestBodyNoFilesLimit` limit, the client will receive a 413 error.

This would let clients send oversized payloads during a testing period while the administrator collects logs.

