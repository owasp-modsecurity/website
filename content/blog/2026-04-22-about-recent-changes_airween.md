---
title: 'About CVE 2026-30923 and 2026-XXXXX'
date: '2026-04-22T00:00:00+02:00'
author: airween
---

We would like to share our take on [CVE-2026-30923](https://nvd.nist.gov/vuln/detail/CVE-2026-30923) and [CVE-2026-XXXXX](https://nvd.nist.gov/vuln/detail/CVE-2026-XXXXX), which was published on April 22, 2026 and some other issues.

<!--more-->

Two new CVE's were released recently and several other security issues were fixed. This blog post tries to summarize them.

### CVE's

The first CVE was released about a stack-buffer-overflow (write via signed integer underflow in loop bound) in transformation `t:hexDecode`. The original reporter was [@EsadCetiner](https://github.com/EsadCetiner), but later another security team (from Cert.pl with leader [@fumfel](https://github.com/fumfel)) also reported this issue.

As the reporter descibed theproblem, if a rule uses the `t:hexDecode` transformation, the attacker can produce a segfault in the server. See the PoC - the rule is something like this:

```plain
SecRule ARGS "@contains test" \
    "id:1,\
    phase:1,\
    deny,\
    t:none,t:hexDecode,\
    log"
```
and the request:
```bash
curl "localhost/?test=a"
```

The security advisory can be read [here](https://github.com/owasp-modsecurity/ModSecurity/security/advisories/GHSA-qrjc-3jpc-3h2g) about this issue.

The other CVE was released about an unsigned integer underflow in `@verifySSN`,  `@verifyCPF` and `@verifySVNR` operators, which could cause also a remote DoS.

Consider the rule uses one of these mentioned operators, like this:
```plain
SecRule ARGS "@verifySSN ^\d{3}-?\d{2}-?\d{4}$" \
    "id:1,phase:2,pass,log"
```
and the request is like this:
```bash
curl "localhost/path?x="
```

The security advisory can be read [here](https://github.com/owasp-modsecurity/ModSecurity/security/advisories/GHSA-vwr3-7x7g-7p9w) about this issue.

**A very important note:** if you don't use neither the transformation `t:hexDecode` and `@verify*` operators above, none of the bugs can be exploited.

**A very important note:** if you do not use either the `t:hexDecode` transformation or `@verify*` operators above, none of the flaws can be exploited. CRS **does not use** any of them.

Also and important thing, these issues are only in libmodsecurity3, the Apache's mod_security2 does not affected.

A side note: both issues were reported (with suggested solutions) a few days later after the team above sent us the report by Dag Haavi Finstad from varnish-software.com - also a big thanks to him.

### Other fixed issues

The Cert.pl team discovered more issues, but we did not consider it necessary to assign a CVE in these cases, as they are generally not exploitable at all.

* **Heap buffer overflow in libinjection**
  * they found an issue in libinjection (not in libmodsecurity3), which is:
    * not part of libmodsecurity3
    * could be exploited only if the user built the code with ASAN flags (eg. with `-fsanitize=address`), which is very-very rarely (almost never used) in production environment
  * Meanwhile the libinjection project also fixed this issue and released the new version (libinjection4), so we updated the submodule in the library (thanks [@Easton97-Jens](https://github.com/Easton97-Jens/))
  * we also updated the libinjection code in mod_security2 (added as a submodule too)
* **Undefined behavior in msc_tree.h**
  * they found an issue in a macro which was used in msc_tree.h; the problem was that if a rule used the operator `@ipMatch` with an argument which contains a `\0` byte, then it leads to a crash
  * this macro was used also in mod_security2 so we fixed this issue there too
  * the team provided the fix too
* **Null pointer dereference and unhandled exception in config parser**
  * they discovered an issue in libmodsecurity3's config parser: in some cases if a config directive used tab instead of spaces
  * they also discovered another issue there: the parser could thrown an exeption in several different cases (eg. unknow token) which wasn't handled
  * the team provided the fix too for both issues
* **Heap buffer overflow (write) in ACMP (Aho-Corasick) pattern matching (`@pm`)**
  * they discovered an issue in `@pm` operator's behavior: if there was a `\0` byte in the patterns list, that could cause a segfault
  * in mod_security2 the same code was used, we fixed this there too
  * the team provided the fix too
* **Heap buffer overflow (read) in multipart body processor**
  * the team discovered an issue in multipart body processor; as in case of libinjection issue, this could be exploited only if the code was built with `-fsanitize=address` flag
  * the team provided the fix too

Important note: these latter issues cannot be exploited remotely, or it needs to built the code with ASAN flags.

Please upgrade your WAF to 3.0.15 or 2.9.13.


