---
title: 'New versions - 2024 August'
date: '2024-09-01T17:30:00+02:00'
author: airween
---

The OWASP ModSecurity team is pleased to announce the release of versions [2.9.8](https://github.com/owasp-modsecurity/ModSecurity/releases/tag/v2.9.8) and [3.0.13](https://github.com/owasp-modsecurity/ModSecurity/releases/tag/v3.0.13). These versions both include a mixture of new features and bug fixes.

<!--more-->

For the complete list of changes, please take a look at the respective CHANGELOGs: [mod_security2](https://github.com/owasp-modsecurity/ModSecurity/blob/v2.9.8/CHANGES) and [libmodsecurity3](https://github.com/owasp-modsecurity/ModSecurity/blob/v3.0.13/CHANGES).
For some of the more complex changes, you may want to read through the corresponding pull requests (linked below) to understand rationales and implementation details.


It's been a long time since the last releases, especially in case of v2.


#### Major changes in v2 (details below):

* added a CI workflow
* changed error log format - [#1](#v2-1---changed-error-log-format)
* added a new MULTIPART HEADER check - [#2](#v2-2---added-a-new-multipart-header-check)
* fixed many potential memory leaks and other potential memory handling problems

##### v2 #1 - changed error log format
See [PR #3192](https://github.com/owasp-modsecurity/ModSecurity/pull/3192). The old log format differs from the new one as follows:

old:
```
[Wed Aug 28 17:07:09.416861 2024] [security2:error] [pid 729352:tid 729355] [client ::1:55806] [client ::1] ModSecurity ...
```
new:
```
[Wed Aug 28 17:07:09.416861 2024] [security2:error] [pid 729352:tid 729355] [client ::1:55806] ModSecurity ...
```
As you can see the second `[client]` field was removed.

##### v2 #2 - added a new MULTIPART HEADER check
See [PR #3226](https://github.com/owasp-modsecurity/ModSecurity/pull/3226). For multipart requests, the engine checks that the header does not contain invalid characters. This is similar to CRS's [PR #3796](https://github.com/coreruleset/coreruleset/pull/3796) but on the engine's level. For more details, see the related [blog post](https://coreruleset.org/20240829/crs-versions-4.6.0-and-3.3.6-have-been-released/).

##### Contributors:

@3eka, @airween, @fzipi, @marcstern, @martinhsv, @Polynomial-C, @twouters, @zhaoshikui.

#### Major changes in v3:

* added Windows port - [#1](#v3-1---added-windows-port)
* improved CI workflow
* removed unnecessary string copy operations, improved engine speed - several PR's
* fixed a bug in `@pm` operator - [#2](#v3-2---fixed-a-bug-in-pm-operator)
* extended the C/C++ API - [#3](#v3-3---extended-the-cc-api)

##### v3 #1 - added Windows port
See [PR #3132](https://github.com/owasp-modsecurity/ModSecurity/pull/3132). Libmodsecurity3 builds on Windows now.

##### v3 #2 - fixed a bug in `@pm` operator
See [PR #3243](https://github.com/owasp-modsecurity/ModSecurity/pull/3243) and [PR #3233](https://github.com/owasp-modsecurity/ModSecurity/pull/3233). Fixed parsing of digits which were not quoted and thus not interpreted as ASCII characters (like the hexadecimal digits) but as binary values, eg `0` was interpreted as string terminator (`'\0'`) and not ASCII `'0'` (`chr(48)`).

##### v3 #3 - extended the C/C++ API
There are three new functions:
  * [setHostname() / msc_set_request_hostname()](https://github.com/owasp-modsecurity/ModSecurity/pull/3203)
  * [msc_rules_error_cleanup()](https://github.com/owasp-modsecurity/ModSecurity/pull/3209)
  * [msc_intervention_cleanup()](https://github.com/owasp-modsecurity/ModSecurity/pull/3209)

##### Contributors:

@airween, @bitbehz, @devzero2000, @eduar-hte, @frozenice, @fzipi, @gberkes, @M4tteoP, @MirkoDziadzka,
@rkrishn7.


#### Special thanks to:

@dune73, @fzipi, @theseion for their huge help in discussions, ideas, Github settings and workflow management.

**We would like to thank the employers of the participating developers, especially [Approach Cyber](https://www.approach-cyber.com/index.html) and [Digitalwave](https://modsecurity.digitalwave.hu).**

