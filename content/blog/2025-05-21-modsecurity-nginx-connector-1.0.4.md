---
title: 'ModSecurity-nginx connector - new release: v1.0.4'
date: '2025-05-21T00:00:00+02:00'
author: airween
---

The OWASP ModSecurity team is pleased to announce the release of versions of ModSecurity-nginx connector, 1.0.4. This version includes a mixture of new features and bug fixes.

<!--more-->

The latest release was almost three years ago, meanwhile some relevant features were added to the connector.

##### Contributors:

@brandonpayton, @theseion, @liudongmiao, @eduar-hte, @airween

#### Major changes:

* added a workflow for Github CI (@theseion, @airween)
* added Windows port (@eduar-hte)
* fix recovery context after internal redirect (@liudongmiao, @airween)
* set correct hostname in log produced by Nginx (@airween)

#### Important change in log format

Please note that there was an important change in logformat. Here is the explanation what changed.
Old behavior: if ModSecurity catches an attack then it produces log entries. The problem is that the `[hostname]` field contains the server's IP address - which carries no information at all:

```
ModSecurity: Warning. ... [hostname "18.19.20.21"] [uri "/xmlrpc.php"]...
```

At the end of the line, Nginx (and not ModSecurity) puts other fields, like server and host, but unfortunately those can be truncated if the other parts of line are too long, eg. [data] field by ModSecurity, or request field by Nginx, because **Nginx truncates the log line after 2048 bytes**.

The other advantage of this patch that now the fields will be the same as in case of mod_security2, so parsing the lines (hopefully) will be easier.

Here is the new logformat:

```
ModSecurity: Warning. ... [hostname "foobar.com"] [uri "/"] ...
```

Please take a look at the `[hostname]` field, now it contains the `Hostname` field from the request, or if it does not exists then the virtual host's context name (`server`). Don't forget to align your log processor!

Ervin Hegedüs
