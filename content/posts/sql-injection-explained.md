---
title: "SQL Injection Explained: How It Works and How to Stop It"
description: "A practical breakdown of SQL injection attacks—how they work, real examples of the damage they cause, and the concrete steps developers can take to prevent them."
date: 2026-06-04T10:00:00-04:00
tags: ["cybersecurity", "web development", "SQL", "OWASP"]
categories: ["Cybersecurity", "Web Development"]
draft: false
slug: "sql-injection-explained"
seoKeywords:
  - SQL injection explained
  - how SQL injection works
  - prevent SQL injection
  - SQL injection examples
  - parameterized queries
  - web security for developers
canonicalUrl: "https://missquibble.com/posts/sql-injection-explained/"
---

## Table of Contents
- [What Is SQL Injection?](#what-is-sql-injection)
- [How It Works: A Real Example](#how-it-works-a-real-example)
- [Types of SQL Injection](#types-of-sql-injection)
- [What Attackers Can Do With It](#what-attackers-can-do-with-it)
- [How to Prevent SQL Injection](#how-to-prevent-sql-injection)
- [Testing Your Own Code](#testing-your-own-code)

#### ***Introduction***

SQL injection has been on the OWASP Top 10 list of critical web security risks for over fifteen years. Despite being one of the most well-documented vulnerabilities in existence, it remains one of the most commonly exploited. Breaches involving SQL injection have exposed hundreds of millions of records, brought down major companies, and cost billions of dollars in damages. If you write code that talks to a database, understanding SQL injection is not optional — it is fundamental.

# What Is SQL Injection?

SQL injection is a code injection attack where an attacker inserts malicious SQL code into an input field that gets executed by the database. It happens when an application builds database queries by directly concatenating user-supplied input into a SQL string without proper validation or escaping.

In plain terms: your application trusts user input and passes it directly to the database. The attacker sends SQL code instead of a normal value, and the database runs it.

# How It Works: A Real Example

Suppose a login form takes a username and password and runs this query:

```sql
SELECT * FROM users WHERE username = 'admin' AND password = 'secretpass';
```

A vulnerable application builds this query like so in Python:

```python
# NEVER do this
query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"
```

Now an attacker enters `' OR '1'='1` as the password. The query becomes:

```sql
SELECT * FROM users WHERE username = 'admin' AND password = '' OR '1'='1';
```

Since `'1'='1'` is always true, this query returns all users and the attacker is logged in as admin — no valid password needed.

# Types of SQL Injection

**In-band SQLi** is the most common form. Results are returned directly in the HTTP response. Classic and error-based variations both fall here.

**Blind SQLi** occurs when the application does not return query results but the attacker can infer information based on how the application responds — different responses for true vs. false conditions, or time delays introduced by `SLEEP()` statements.

**Out-of-band SQLi** uses separate channels (like DNS or HTTP requests) to exfiltrate data. Less common but extremely dangerous on misconfigured servers.

# What Attackers Can Do With It

The damage potential ranges from bad to catastrophic depending on database privileges:

- **Extract data** — usernames, passwords (even hashed), email addresses, credit card numbers, private messages
- **Bypass authentication** — log in as any user including administrators
- **Modify or delete data** — update prices, delete records, corrupt entire tables
- **Read/write server files** — if the database user has `FILE` privileges, attackers can read `/etc/passwd` or write web shells
- **Execute OS commands** — on SQL Server, `xp_cmdshell` can run arbitrary system commands

# How to Prevent SQL Injection

**1. Use parameterized queries (prepared statements).** This is the primary defense and should be used everywhere.

```python
# Safe — parameter is separate from the query
cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
```

```javascript
// Safe in Node.js with MySQL
connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
```

The database treats the parameter as data, never as SQL code. Even if the input contains SQL syntax, it cannot alter the query structure.

**2. Use an ORM.** Django's ORM, SQLAlchemy, Hibernate, and Sequelize all use parameterized queries by default. If you are using a mature ORM and not writing raw SQL, you are largely protected — but understand what you are using.

**3. Validate and sanitize input.** If a field expects an integer, enforce that it is an integer before it touches any query. Whitelist expected formats for usernames, emails, and other fields.

**4. Least privilege.** Your application's database user should only have the permissions it actually needs. A web app that reads product listings does not need `DROP TABLE` access. Limiting privileges limits blast radius.

**5. Error handling.** Never display raw database error messages to users. They reveal table names, column names, and database types that help attackers craft targeted injections. Log errors server-side; show generic messages to users.

# Testing Your Own Code

**sqlmap** is an open-source tool that automates SQL injection detection and exploitation. Run it against your own applications in a test environment:

```bash
sqlmap -u "http://localhost/login?user=test" --forms --batch
```

**PortSwigger Web Security Academy** has free, excellent SQL injection labs ranging from beginner to advanced. Working through them is the fastest way to understand the attacker's perspective.

# Conclusion

SQL injection is old, well-understood, and completely preventable — yet it keeps appearing in breach reports year after year. The fix is simple: never concatenate user input into SQL strings. Use parameterized queries, always. That one habit eliminates the entire vulnerability class. Write it into your code review checklist, add it to your team's standards, and never build a login form without it.
