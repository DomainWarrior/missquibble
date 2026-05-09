---
title: "OWASP Top 10: The Developer's Web Security Checklist"
description: "A practical walkthrough of the OWASP Top 10 most critical web security risks—what each vulnerability is, how attackers exploit it, and exactly how to prevent it in your code."
date: 2026-09-10T10:00:00-04:00
tags: ["cybersecurity", "OWASP", "web development", "security checklist"]
categories: ["Cybersecurity", "Web Development"]
draft: false
slug: "owasp-top-10-checklist"
seoKeywords:
  - OWASP Top 10 explained
  - web security checklist for developers
  - OWASP vulnerabilities prevention
  - web application security risks
  - developer security guide
  - prevent web app attacks
canonicalUrl: "https://missquibble.com/posts/owasp-top-10-checklist/"
---

#### ***Introduction***

The OWASP Top 10 is the most referenced document in web application security. Published by the Open Web Application Security Project, it lists the ten most critical security risks facing web applications, updated every few years based on real-world data from security firms, bug bounty platforms, and penetration tests worldwide. If you build web applications and have not read it, you are operating without a map. This post turns each item into a practical, actionable checklist for developers.

# A01: Broken Access Control

**What it is:** Users can access resources or perform actions they are not authorized for — viewing another user's data, accessing admin functions, or escalating their own privileges.

**How attackers exploit it:** Modify a URL parameter (`/user/1234` → `/user/1235`), change a role value in a cookie or JWT, or directly access an admin endpoint with no authentication check.

**Prevention checklist:**
- Deny by default. Access should be explicitly granted, not implicitly allowed.
- Enforce ownership on every resource: verify that `user_id == resource.owner_id` server-side.
- Never trust client-supplied role or permission data.
- Log access control failures and alert on repeated violations.

# A02: Cryptographic Failures

**What it is:** Sensitive data (passwords, credit cards, health records) transmitted or stored without adequate encryption.

**Prevention checklist:**
- Use HTTPS everywhere. Redirect HTTP to HTTPS. Use HSTS.
- Hash passwords with `bcrypt`, `argon2`, or `scrypt` — never MD5, SHA-1, or plain SHA-256.
- Encrypt sensitive data at rest using AES-256.
- Never put secrets in source code or environment variables committed to git.

# A03: Injection

**What it is:** Untrusted data sent to an interpreter (SQL, OS shell, LDAP) causes unintended commands to execute. SQL injection is the most common form.

**Prevention checklist:**
- Use parameterized queries or prepared statements — always.
- Validate and sanitize all input at the boundary.
- Use an ORM with care — raw SQL calls bypass its protections.

# A04: Insecure Design

**What it is:** Security flaws baked in at the design level, before any code is written. No amount of implementation-level fixes can compensate for a fundamentally insecure design.

**Prevention checklist:**
- Perform threat modeling before development begins. Ask: what could an adversary do here?
- Design for defense in depth — multiple independent controls for critical operations.
- Implement rate limiting on authentication and sensitive endpoints at the design stage.

# A05: Security Misconfiguration

**What it is:** Default credentials left unchanged, debug mode enabled in production, unnecessary features turned on, overly permissive CORS, missing security headers.

**Prevention checklist:**
- Remove all default credentials, accounts, and sample applications.
- Disable debug mode and stack traces in production.
- Add security headers: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`.
- Run automated configuration scanners as part of CI.

# A06: Vulnerable and Outdated Components

**What it is:** Using libraries, frameworks, or dependencies with known vulnerabilities.

**Prevention checklist:**
- Run `pip audit`, `npm audit`, or `bundle audit` regularly.
- Enable Dependabot or Renovate in your repositories.
- Subscribe to security advisories for your major dependencies.
- Remove unused dependencies — they still expand your attack surface.

# A07: Identification and Authentication Failures

**What it is:** Weak authentication mechanisms, missing multi-factor authentication, credential stuffing vulnerabilities, insecure session management.

**Prevention checklist:**
- Implement MFA for all accounts, especially admin accounts.
- Use a reputable, battle-tested authentication library — do not roll your own.
- Enforce strong password policies. Check passwords against known breach databases (haveibeenpwned API).
- Invalidate sessions on logout. Set short session timeouts.

# A08: Software and Data Integrity Failures

**What it is:** Using unverified software updates, insecure deserialization, or CI/CD pipelines that can be injected with malicious code.

**Prevention checklist:**
- Verify package integrity with checksums and signed packages.
- Avoid deserializing untrusted data. If you must, use signed, type-restricted deserialization.
- Require code review and branch protection on your deployment pipeline.

# A09: Security Logging and Monitoring Failures

**What it is:** Insufficient logging means breaches go undetected. When detection eventually happens, the lack of logs makes investigation and recovery nearly impossible.

**Prevention checklist:**
- Log all authentication events (success and failure), access control failures, and input validation errors.
- Include enough context: timestamp, user ID, IP address, action.
- Store logs in a tamper-resistant system separate from the application.
- Set up alerts for anomalous patterns (multiple failed logins, unusual data access volumes).

# A10: Server-Side Request Forgery (SSRF)

**What it is:** An attacker tricks your server into making HTTP requests to arbitrary URLs — including internal services, cloud metadata endpoints, and localhost — that they could not access directly.

**Prevention checklist:**
- Validate and sanitize all user-supplied URLs before making server-side requests.
- Use an allowlist of permitted domains and schemes.
- Disable unused URL schemas (file, ftp, gopher).
- In cloud environments, protect the metadata endpoint (`169.254.169.254`) with firewall rules.

# Your Action Plan

You do not need to fix everything at once. Prioritize by risk:

1. **Immediate:** A01 (broken access control), A02 (cryptography), A03 (injection) — these are the most exploited and most damaging.
2. **This sprint:** A05 (misconfiguration), A06 (outdated components), A07 (authentication).
3. **Ongoing:** A09 (logging), threat modeling (A04), supply chain (A08), SSRF (A10).

Run your application through OWASP ZAP (a free automated scanner) for a quick baseline, then work through this list systematically. Security is not a feature you ship once — it is a practice you maintain continuously.
