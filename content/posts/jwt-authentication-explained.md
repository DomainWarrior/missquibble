---
title: "JWT Authentication Explained: How It Works and How to Use It Safely"
description: "A practical guide to JSON Web Tokens—how JWTs are structured, how authentication flows work, common security pitfalls, and how to implement them correctly in your apps."
date: 2026-07-16T10:00:00-04:00
tags: ["cybersecurity", "web development", "authentication", "JWT", "API"]
categories: ["Cybersecurity", "Web Development"]
draft: false
slug: "jwt-authentication-explained"
seoKeywords:
  - JWT authentication explained
  - JSON Web Tokens tutorial
  - how JWT works
  - JWT security best practices
  - implement JWT authentication
  - stateless authentication
canonicalUrl: "https://missquibble.com/posts/jwt-authentication-explained/"
---

#### ***Introduction***

JSON Web Tokens — JWTs — are everywhere in modern web development. If you have built or consumed a REST API in the last five years, you have almost certainly encountered them. They are the dominant mechanism for stateless authentication in single-page applications, mobile apps, and microservices. But despite their ubiquity, JWT is one of the most commonly misconfigured authentication mechanisms on the web. This guide explains exactly how JWTs work, how to use them correctly, and the specific mistakes that turn them into a security liability.

# What Is a JWT?

A JWT is a compact, URL-safe string that encodes a set of claims — assertions about a subject — that can be cryptographically verified. It looks like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQ4MDAwMDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

That string is three Base64Url-encoded sections separated by dots:

**Header** — algorithm and token type:
```json
{ "alg": "HS256", "typ": "JWT" }
```

**Payload** — the claims (your data):
```json
{ "sub": "user123", "role": "admin", "exp": 1748000000 }
```

**Signature** — cryptographic proof that the token has not been tampered with:
```
HMACSHA256(base64(header) + "." + base64(payload), secret)
```

# How JWT Authentication Works

1. User submits credentials (username and password) to your login endpoint
2. Server validates credentials against the database
3. Server creates a JWT signed with a secret key and returns it to the client
4. Client stores the token (more on where in a moment) and sends it in the `Authorization` header on subsequent requests: `Authorization: Bearer <token>`
5. Server receives the request, verifies the signature, checks expiration, and grants or denies access

No session state is stored on the server — the token itself contains all the information needed. This is what makes JWTs "stateless" and ideal for APIs and distributed systems.

# Implementing JWT in Python

```python
import jwt
from datetime import datetime, timedelta, timezone

SECRET_KEY = "your-256-bit-secret"
ALGORITHM  = "HS256"

def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise Exception("Token expired")
    except jwt.InvalidTokenError:
        raise Exception("Invalid token")
```

Always specify the `algorithms` parameter as a list in `jwt.decode`. Never use `algorithms=None`.

# Common Security Mistakes

**The `alg: none` vulnerability.** Early JWT libraries accepted tokens with `"alg": "none"` in the header, meaning no signature was required. An attacker could forge any token by simply setting the algorithm to none. Always explicitly specify accepted algorithms and never accept `none`.

**Storing tokens in localStorage.** localStorage is accessible to any JavaScript on the page, making tokens stored there vulnerable to XSS attacks. Store JWTs in `HttpOnly` cookies instead — JavaScript cannot read these.

**Weak secrets.** The security of HS256 depends entirely on the secrecy and strength of your signing key. A weak or predictable secret can be brute-forced. Use a randomly generated secret of at least 256 bits.

**Missing expiration.** JWTs without an `exp` claim are valid forever. If a token is compromised, you have no way to invalidate it. Always set short expiration times (15 minutes to 1 hour for access tokens).

**Putting sensitive data in the payload.** JWT payloads are Base64-encoded, not encrypted. Anyone who intercepts the token can read the payload. Never put passwords, payment card data, or other sensitive information in a JWT.

# Access Tokens and Refresh Tokens

Short-lived access tokens (15-60 minutes) minimize the damage from token theft. But you do not want users logging in every hour. The solution is a refresh token pair:

- **Access token** — short-lived (15-60 min), sent with every API request
- **Refresh token** — long-lived (7-30 days), stored securely, used only to get new access tokens

When the access token expires, the client sends the refresh token to a dedicated endpoint to receive a new access token — transparent to the user. Store refresh tokens in the database so you can revoke them on logout.

# When Not to Use JWT

JWTs are excellent for stateless API authentication. They are often overkill or inappropriate for:

- Traditional server-rendered applications (session cookies are simpler and more mature)
- Situations requiring immediate token revocation (you cannot invalidate a JWT before it expires without maintaining a denylist — which reintroduces state)
- Single-server applications where session storage is trivial

# Conclusion

JWT authentication is powerful, scalable, and production-proven — but only when implemented correctly. Use short expiration times, store tokens in HttpOnly cookies, validate signatures explicitly, and never put sensitive data in the payload. Understand the security implications before reaching for JWT, and you will have a robust authentication layer that serves your application well at any scale.
