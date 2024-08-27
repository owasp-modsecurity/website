---
title: 'New versions - 2024 August'
date: '2024-08-27T10:00:00+02:00'
author: airween
---

OWASP ModSecurity team is pleased to announce the release of version [2.9.8](https://github.com/owasp-modsecurity/ModSecurity/releases/tag/v2.9.8) and [3.0.13](https://github.com/owasp-modsecurity/ModSecurity/releases/tag/v3.0.13). These versions both include a mixture of new features and bug fixes.

<!--more-->

For the complete list of changes, please take a look at the CHANGELOG in versions' repositories: [mod_security2](https://github.com/owasp-modsecurity/ModSecurity/blob/v2/master/CHANGES) and [libmodsecurity3](https://github.com/owasp-modsecurity/ModSecurity/blob/v3/master/CHANGES).


It's been a long time since the last releases, especially in case of v2.


#### Major changes in v2:

* added a CI workflow
* changed error log format - plase take a review to [PR](https://github.com/owasp-modsecurity/ModSecurity/pull/3192)
* added a new MULTIPART HEADER check - please take a review to [PR](https://github.com/owasp-modsecurity/ModSecurity/pull/3226)
* fixed many possible memory leaks and other possible memory handling problems


#### Major changes in v3:

* added Windows port - thanks to [@eduar-hte](https://github.com/owasp-modsecurity/ModSecurity/pull/3132)
* improved CI workflow - also @eduar-hte
* removed unnecessary string copies, improved engine speed - @eduar-hte
* fixed a bug in `@pm` operator - [@eduar-hte](https://github.com/owasp-modsecurity/ModSecurity/pull/3233) - please take a look, the operator's behavior has fixed!
* extended the C/C++ API - there are three new functions:
  * [setHostname() / msc_set_request_hostname()](https://github.com/owasp-modsecurity/ModSecurity/pull/3203)
  * [msc_rules_error_cleanup()](https://github.com/owasp-modsecurity/ModSecurity/pull/3209)
  * [msc_intervention_cleanup()](https://github.com/owasp-modsecurity/ModSecurity/pull/3209)


**We would like to thank the employers of the participating developers, especially [Approach Cyber](https://www.approach-cyber.com/index.html) and [Digitalwave](https://modsecurity.digitalwave.hu).**