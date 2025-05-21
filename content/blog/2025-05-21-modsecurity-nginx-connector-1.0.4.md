---
title: 'ModSecurity-nginx connector - new release: v1.0.4'
date: '2025-05-21T00:00:00+02:00'
author: airween
---

The OWASP ModSecurity team is pleased to announce the release of ModSecurity-nginx connector version 1.0.4. This version includes a mixture of new features and bug fixes.

<!--more-->

The previous version has been released almost three years ago, and meanwhile some important features were added to the connector.

##### Contributors:

@brandonpayton, @theseion, @liudongmiao, @eduar-hte, @airween

#### Major changes:

* added a workflow for Github CI (@theseion, @airween)
* added Windows port (@eduar-hte)
* fix recovery context after internal redirect (@liudongmiao, @airween)
* set correct hostname in log produced by nginx (@airween)

#### Important change in the log format

Please note that there was an important change in log format.

Old behavior: if ModSecurity determines a positive rule match it (generally) produces log entries. The problem is that the `[hostname]` field contains the server's IP address - i.e., the address of the server ModSecurity is running on, which isn't helpful information:

```
ModSecurity: Warning. ... [hostname "18.19.20.21"] [uri "/xmlrpc.php"]...
```

At the end of the line, nginx (and not ModSecurity) puts other fields, like `[server]` and `[host]`, but unfortunately those can be truncated if the other parts of line are too long (e.g., the `[data]` field from ModSecurity, or the `[request]` field from nginx), because **nginx truncates the log line after 2048 bytes**.

Here is the new logformat:
```
ModSecurity: Warning. ... [hostname "foobar.com"] [uri "/"] ...
```

The `[hostname]` field now contains the `Host` field from the request, or if it does not exist, the virtual host's context name (`server`). This change ensures that the `[hostname]` field contains helpful information and that the host information will no longer be truncated from long log lines.

The other advantage of this patch that now the fields will be the same as in mod_security2, so parsing the lines will (hopefully) be easier. Remember to update your log parsers to accomodate for this change.

Ervin Hegedüs