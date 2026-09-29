# Security Policy

## What this repository is

This repository holds the source of the OWASP ModSecurity project website,
<https://modsecurity.org/>. It is a static site: there is no application server, no
database and no user accounts.

Vulnerabilities in **ModSecurity itself** — the engine, the connectors, or the rules —
do not belong here. Report those in the project they affect:

- [owasp-modsecurity/ModSecurity](https://github.com/owasp-modsecurity/ModSecurity)
- [coreruleset/coreruleset](https://github.com/coreruleset/coreruleset) for the OWASP
  Core Rule Set

## Reporting a vulnerability

For anything that needs to stay private — including a false negative or bypass under
active exploitation — email **<modsecurity@owasp.org>**.

If the report itself is sensitive, encrypt it to the project's GPG key:
<https://modsecurity.org/security.asc>.

Please include enough to reproduce the problem: the affected URL or component, the
version you are running where that applies, and the relevant portion of any log.

## Reporting something that is not sensitive

False positives, false negatives that are not under exploitation, broken pages, and
everything else are better off in public, where other people can find the answer:

- Site problems: [issues on this repository](https://github.com/owasp-modsecurity/website/issues)
- Engine problems: [issues on the ModSecurity repository](https://github.com/owasp-modsecurity/ModSecurity/issues)

Please do not use a public issue for an unpatched vulnerability.

## What to expect

The project is maintained by volunteers, so we do not promise a response time. Reports
sent to the address above reach the maintainers, and we will tell you what we find.
There is no bug bounty.
