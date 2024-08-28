---
title: 'New versions - 2024 August'
date: '2024-08-27T10:00:00+02:00'
author: airween
---

OWASP ModSecurity team is pleased to announce the release of versions [2.9.8](https://github.com/owasp-modsecurity/ModSecurity/releases/tag/v2.9.8) and [3.0.13](https://github.com/owasp-modsecurity/ModSecurity/releases/tag/v3.0.13). These versions both include a mixture of new features and bug fixes.

<!--more-->

For the complete list of changes, please take a look at the respective CHANGELOGs: [mod_security2](https://github.com/owasp-modsecurity/ModSecurity/blob/v2.9.8/CHANGES) and [libmodsecurity3](https://github.com/owasp-modsecurity/ModSecurity/blob/v3.0.13/CHANGES).
For some of the more complex changes, you may want to read through the corresponding pull requests (linked below) to understand rationals and implementation details.


It's been a long time since the last releases, especially in case of v2.


#### Major changes in v2:

* added a CI workflow
* changed error log format - [PR](https://github.com/owasp-modsecurity/ModSecurity/pull/3192)
* added a new MULTIPART HEADER check - [PR](https://github.com/owasp-modsecurity/ModSecurity/pull/3226)
* fixed many potential memory leaks and other potential memory handling problems


#### Major changes in v3:

* added Windows port - @eduar-hte [PR](https://github.com/owasp-modsecurity/ModSecurity/pull/3132)
* improved CI workflow - @eduar-hte
* removed unnecessary string copy operations, improved engine speed - @eduar-hte
* fixed a bug in `@pm` operator - @eduar-hte [PR](https://github.com/owasp-modsecurity/ModSecurity/pull/3233)
* extended the C/C++ API - there are three new functions:
  * [setHostname() / msc_set_request_hostname()](https://github.com/owasp-modsecurity/ModSecurity/pull/3203)
  * [msc_rules_error_cleanup()](https://github.com/owasp-modsecurity/ModSecurity/pull/3209)
  * [msc_intervention_cleanup()](https://github.com/owasp-modsecurity/ModSecurity/pull/3209)


**We would like to thank the employers of the participating developers, especially [Approach Cyber](https://www.approach-cyber.com/index.html) and [Digitalwave](https://modsecurity.digitalwave.hu).**
