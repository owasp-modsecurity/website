---
title: 'About CVE 2026-30923 and 2026-30923'
date: '2026-04-28T00:00:00+02:00'
author: airween
---

We would like to share our take on [CVE-2026-30923](https://nvd.nist.gov/vuln/detail/CVE-2026-30923) and [CVE-2026-30923](https://nvd.nist.gov/vuln/detail/CVE-2026-30923), which were published on April 28, 2026, as well as some additional issues that were fixed.

<!--more-->

Two new CVE's were released recently and several other security issues were fixed. In this blog post we will explain the mechanics and impact of these issues.

### CVEs

#### CVE-2026-30923

The first reported vulnerability (CVE-2026-30923) was a stack buffer overflow (write via signed integer underflow in loop bound) in the transformation `t:hexDecode` (in libmodsecurity3 only). The original reporter was [@EsadCetiner](https://github.com/EsadCetiner), but later another security team (from [Cert.pl](https://cert.pl/en/) with leader [@fumfel](https://github.com/fumfel)) also reported this issue.

The effect of the overflow was that an attacker could craft a request that would cause a segmentation fault in the server when a rule used the `t:hexDecode` transformation. An attacker could abuse this vulnerability to disrupt the service (DoS).

An affected rule would look something like this:

```apache
SecRule ARGS "@contains test" \
    "id:1,\
    phase:1,\
    deny,\
    t:none,t:hexDecode,\
    log"
```

The segmentation fault can then be triggered with a request as produced by the following `curl` command:

```bash
curl "localhost/?test=a"
```

The security advisory for the vulnerability is available on [GitHub](https://github.com/owasp-modsecurity/ModSecurity/security/advisories/GHSA-qrjc-3jpc-3h2g).

#### CVE-2026-30923

The second reported vulnerability was an unsigned integer underflow in the `@verifySSN`, `@verifyCPF` and `@verifySVNR` operators (in libmodsecurity3 only). As with the first vulnerability, the segmentation fault caused by the underflow could be abused by an attacker to disrupt the service (DoS).

The following rule would be vulnerable to the attack, as it uses `@verifySSN`:

```apache
SecRule ARGS "@verifySSN ^\d{3}-?\d{2}-?\d{4}$" \
    "id:1,phase:2,pass,log"
```

The segmentation fault can then be triggered with a request as produced by the following `curl` command:
```bash
curl "localhost/path?x="
```

The security advisory is available on [GitHub](https://github.com/owasp-modsecurity/ModSecurity/security/advisories/GHSA-vwr3-7x7g-7p9w).

#### Important Notes

- You are not affected if you use mod_security2. The vulnerabilities only affect libmodsecurity3.
- You are not affected by either vulnerability if you don't use any of the affected transformations (`t:hexDecode`) or operators (`@verifySSN`, `@verifyCPF`, `@verifySVNR`).
- You are not affected by either vulnerability if you use [CRS](https://coreruleset.org) rules exclusively in your setup, as CRS **does not use** any of the affected transformations or operators, neither in the 3.3.9 release nor the 4.x release line.

#### Further Attribution

Both vulnerabilities were reported (with suggested solutions) a few days after the original reports by Dag Haavi Finstad from [varnish-software.com](https://varnish-software.com) - also a big thanks to him.

### Other fixed issues

The [Cert.pl](https://cert.pl/en/) team discovered more issues, but we did not consider it necessary to assign CVEs in these cases, as they are generally not exploitable. The team provided fix proposals in all cases, which we very much appreciate.

Note that all of these issues could not be set up remotely, unless specific configuration issues existed, or the code was compiled with `ASAN` flags.

#### Heap Buffer Overflow in Libinjection

An issue was found in libinjection (not in libmodsecurity3). libinjection is a third-party library used by ModSecurity.

The discovered issue could be exploited only if the user built the code with `ASAN` flags (eg. with `-fsanitize=address`), which is uncommon in production environments

As of this writing, the libinjection project also fixed this issue and released the new version (libinjection4), so we updated the submodule in the library (thanks [@Easton97-Jens](https://github.com/Easton97-Jens/)).\
We also updated the libinjection code in mod_security2 (added as a submodule too).

#### Undefined Behavior in `msc_tree.h`

An issue was found in a macro which was used in `msc_tree.h`. ModSecurity would crash with a segmentation fault if a rule used the operator `@ipMatch` with an argument containing a null (`\0`) byte.

The affected macro is used also in `mod_security2` so we fixed this issue there too.

#### Null Pointer Dereference and Unhandled Exception in Config Parser

An issue was discovered in libmodsecurity3's config parser. ModSecurity could crash in some cases if a config directive used tabs instead of spaces.

A second issue in the config parser could cause an unhandled exception to be thrown in several different cases (e.g., unknow token).

#### Heap Buffer Overflow (write) in ACMP (Aho-Corasick) Pattern Matching (`@pm`)

An issue was discovered in  the `@pm` operator's behavior. If the pattern list contained a null (`\0`) byte a segmentation fault could be triggered.

The same issue existed in mod_security2 and has been fixed there as well.

#### Heap Buffer Overflow (read) in Multipart Body Processor

An issue was discovered in the multipart body processor. The issue could be exploited only if the code was built with the `-fsanitize=address` flag.


### Conclusion

We are greatful to all the reporters for their help in addressing these issues in ModSecurity.

To be safe from attacks caused by any of the discussed issues, you should upgrade your WAF to version 3.0.15 or 2.9.13.
