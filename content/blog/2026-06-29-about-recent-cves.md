---
title: 'About CVE-2026-52747 and 2026-52761'
date: '2026-06-29T00:00:00+02:00'
author: airween
---

We would like to share our take on [CVE-2026-52747](https://nvd.nist.gov/vuln/detail/CVE-2026-52747) and [CVE-2026-52761](https://nvd.nist.gov/vuln/detail/CVE-2026-52761), which were published on June 29, 2026.

<!--more-->

Two new CVE's were released recently. In this blog post we will explain the mechanics and impact of these issues.

### CVEs

#### CVE-2026-52747

The first reported vulnerability (CVE-2026-52747) is a multipart parser error.

The multipart/form-data request body parser in `libmodsecurity` silently removes embedded line breaks from non-file form-field values before exporting them to `ARGS` and `ARGS_POST`. A valid multipart field containing `A\r\nB` or `A\nB` is exposed to ModSecurity rules as `AB`, and the built-in multipart strict-validation variables remain clear.

The security advisory for the vulnerability is available on [GitHub](https://github.com/owasp-modsecurity/ModSecurity/security/advisories/GHSA-rcw9-2f5r-7p88).

The issue was reported by [@sondt99](https://github.com/sondt99) and [@dungNHVhust](https://github.com/dungNHVhust). They also provided a fix for this issue.

The severity of this vulnerability is high, score is 8.6.

#### CVE-2026-52761

The second reported vulnerability (CVE-2026-52761) was a wrong behavior in `utf8toUnicode` on **i386** architecture. **The issue exists only on this architecture and can't be triggered other architectures.**

The security advisory is available on [GitHub](https://github.com/owasp-modsecurity/ModSecurity/security/advisories/GHSA-qjgm-7gp4-f8qq).

The original issue was reported by [Coreruleset](https://github.com/coreruleset) team when they tried to build a Docker image for i386 architecture. The problem was fixed by [@airween](https://github.com/airween).

The severity of this vulnerability is moderate, score is 5.8.

### Conclusion

We are greatful to all the reporters for their help in addressing these issues in ModSecurity.

To be safe from attacks caused by any of the discussed issues, you should upgrade your WAF to version 3.0.16.

Thanks to [@fzipi](https://github.com/fzipi) for all help.
