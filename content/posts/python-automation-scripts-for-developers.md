---
title: "10 Python Automation Scripts Every Developer Should Have in 2026"
description: "Save hours every week with these 10 practical Python automation scripts covering file management, web scraping, API calls, email sending, PDF generation, and more."
date: 2026-05-08T11:00:00-04:00
tags: ["python", "automation", "programming", "productivity", "scripting"]
categories: ["Programming"]
draft: false
slug: "python-automation-scripts-for-developers"
seoKeywords:
  - Python automation scripts 2026
  - Python scripts for developers
  - automate tasks with Python
  - Python productivity scripts
  - useful Python scripts
  - Python file automation
  - Python web scraping script
  - Python email automation
canonicalUrl: "https://missquibble.com/posts/python-automation-scripts-for-developers/"
---

## Table of Contents
- [Why Automate With Python?](#why-automate-with-python)
- [1. Bulk File Organiser](#1-bulk-file-organiser)
- [2. Website Uptime Monitor](#2-website-uptime-monitor)
- [3. Duplicate File Finder](#3-duplicate-file-finder)
- [4. Automated Email Sender](#4-automated-email-sender)
- [5. Web Scraper with Rotating Headers](#5-web-scraper-with-rotating-headers)
- [6. PDF Report Generator](#6-pdf-report-generator)
- [7. Environment Variable Auditor](#7-environment-variable-auditor)
- [8. Directory Tree Snapshot](#8-directory-tree-snapshot)
- [9. REST API Batch Requester](#9-rest-api-batch-requester)
- [10. Log File Analyser](#10-log-file-analyser)
- [Making Scripts Production-Ready](#making-scripts-production-ready)

## Why Automate With Python?

Every developer has a list of tedious manual tasks: cleaning up downloads folders, checking if a website is still up, sending the same email with slightly different data, parsing a log file to find errors. These tasks are not hard — they are just repetitive. And repetitive tasks are exactly what Python is built for.

Python's standard library covers file I/O, HTTP requests, email, CSV parsing, and JSON handling without installing a single package. Add a few popular libraries and you can generate PDFs, scrape websites, schedule tasks, and automate cloud APIs — all in less code than you would expect.

These ten scripts are practical, immediately useful, and written to be readable and modifiable rather than clever and opaque. Copy them, adapt them, and make them your own.

---

## 1. Bulk File Organiser

Downloads folders become chaos over time. This script sorts files into subdirectories by extension automatically.

```python
#!/usr/bin/env python3
"""Organise files in a directory by extension."""
import shutil
from pathlib import Path

RULES = {
    "Images":     [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
    "Documents":  [".pdf", ".docx", ".doc", ".txt", ".xlsx", ".csv"],
    "Videos":     [".mp4", ".mov", ".avi", ".mkv"],
    "Audio":      [".mp3", ".wav", ".flac", ".aac"],
    "Archives":   [".zip", ".tar", ".gz", ".rar", ".7z"],
    "Code":       [".py", ".js", ".ts", ".html", ".css", ".json"],
}

def organise(source_dir: str) -> None:
    source = Path(source_dir)
    ext_map = {ext: folder for folder, exts in RULES.items() for ext in exts}

    for item in source.iterdir():
        if not item.is_file():
            continue
        ext = item.suffix.lower()
        folder_name = ext_map.get(ext, "Other")
        dest = source / folder_name
        dest.mkdir(exist_ok=True)
        shutil.move(str(item), dest / item.name)
        print(f"  Moved {item.name} → {folder_name}/")

if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else str(Path.home() / "Downloads")
    print(f"Organising: {target}")
    organise(target)
    print("Done.")
```

**Run it:**
```bash
python organise.py ~/Downloads
```

---

## 2. Website Uptime Monitor

Get notified when a site goes down. This script checks a list of URLs on an interval and prints (or emails) an alert on failure.

```python
#!/usr/bin/env python3
"""Monitor website uptime and alert on failure."""
import time
import requests
from datetime import datetime

SITES = [
    "https://missquibble.com",
    "https://github.com",
    "https://your-api.example.com/health",
]

CHECK_INTERVAL = 60   # seconds
TIMEOUT        = 10   # request timeout

def check_site(url: str) -> tuple[bool, int | None, float]:
    try:
        start    = time.time()
        resp     = requests.get(url, timeout=TIMEOUT)
        elapsed  = round((time.time() - start) * 1000)
        return resp.status_code < 400, resp.status_code, elapsed
    except requests.RequestException:
        return False, None, 0

def monitor() -> None:
    print(f"Monitoring {len(SITES)} sites. Ctrl+C to stop.\n")
    while True:
        ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        for url in SITES:
            ok, code, ms = check_site(url)
            status = "✓ UP  " if ok else "✗ DOWN"
            code_str = str(code) if code else "TIMEOUT"
            print(f"[{ts}] {status} | {code_str} | {ms:>5}ms | {url}")
        print()
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    monitor()
```

**Install dependency:** `pip install requests`

Extend this by sending an email (see script 4) or a Slack webhook when `ok` is `False`.

---

## 3. Duplicate File Finder

Hard drives fill up with duplicate photos, downloaded files, and copied documents. This script finds them by comparing SHA-256 hashes — not just filenames.

```python
#!/usr/bin/env python3
"""Find duplicate files by content hash."""
import hashlib
from pathlib import Path
from collections import defaultdict

def sha256(path: Path, chunk: int = 65536) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while data := f.read(chunk):
            h.update(data)
    return h.hexdigest()

def find_duplicates(root: str) -> dict[str, list[Path]]:
    hashes: dict[str, list[Path]] = defaultdict(list)
    for path in Path(root).rglob("*"):
        if path.is_file():
            try:
                hashes[sha256(path)].append(path)
            except (PermissionError, OSError):
                pass
    return {h: paths for h, paths in hashes.items() if len(paths) > 1}

if __name__ == "__main__":
    import sys
    root = sys.argv[1] if len(sys.argv) > 1 else "."
    dupes = find_duplicates(root)

    if not dupes:
        print("No duplicates found.")
    else:
        total = sum(len(v) - 1 for v in dupes.values())
        print(f"Found {len(dupes)} duplicate groups ({total} redundant files):\n")
        for h, paths in dupes.items():
            print(f"  Hash: {h[:16]}…")
            for p in paths:
                print(f"    {p}")
            print()
```

---

## 4. Automated Email Sender

Send personalised emails from a CSV list — useful for newsletters, invoices, or notifications.

```python
#!/usr/bin/env python3
"""Send personalised emails from a CSV list."""
import csv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
FROM_ADDR = os.environ["EMAIL_ADDRESS"]
FROM_PASS = os.environ["EMAIL_PASSWORD"]   # use an app password, not your real password

def send_email(to: str, subject: str, body: str) -> bool:
    msg = MIMEMultipart("alternative")
    msg["From"]    = FROM_ADDR
    msg["To"]      = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(FROM_ADDR, FROM_PASS)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"  Failed to send to {to}: {e}")
        return False

def send_campaign(csv_path: str) -> None:
    with open(csv_path, newline="") as f:
        for row in csv.DictReader(f):
            subject = f"Hello {row['name']}!"
            body    = f"<p>Hi {row['name']},</p><p>Your message here.</p>"
            ok      = send_email(row["email"], subject, body)
            print(f"  {'✓' if ok else '✗'} {row['email']}")

if __name__ == "__main__":
    import sys
    csv_path = sys.argv[1] if len(sys.argv) > 1 else "contacts.csv"
    send_campaign(csv_path)
```

**CSV format (`contacts.csv`):**
```
name,email
Alice,alice@example.com
Bob,bob@example.com
```

> Set `EMAIL_ADDRESS` and `EMAIL_PASSWORD` as environment variables — never hardcode credentials.

---

## 5. Web Scraper with Rotating Headers

A resilient scraper that rotates user-agent strings and handles pagination.

```python
#!/usr/bin/env python3
"""Scrape a paginated website with rotating headers."""
import random
import time
import requests
from bs4 import BeautifulSoup

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
]

def get_page(url: str) -> BeautifulSoup | None:
    headers = {"User-Agent": random.choice(USER_AGENTS)}
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")
    except requests.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None

def scrape(base_url: str, pages: int = 5) -> list[dict]:
    results = []
    for page in range(1, pages + 1):
        url  = f"{base_url}?page={page}"
        soup = get_page(url)
        if not soup:
            break

        # Adapt these selectors to your target site
        for article in soup.select("article.post"):
            results.append({
                "title": article.select_one("h2").get_text(strip=True),
                "url":   article.select_one("a")["href"],
                "date":  article.select_one("time").get("datetime", ""),
            })

        print(f"  Page {page}: {len(results)} items so far")
        time.sleep(random.uniform(1.5, 3.5))   # be polite — don't hammer the server

    return results

if __name__ == "__main__":
    data = scrape("https://example.com/blog", pages=3)
    print(f"\nScraped {len(data)} items:")
    for item in data[:5]:
        print(f"  {item['title'][:60]} — {item['url']}")
```

**Install:** `pip install requests beautifulsoup4`

> Only scrape sites that permit it in their `robots.txt` and terms of service.

---

## 6. PDF Report Generator

Generate a formatted PDF report programmatically — useful for invoices, summaries, or automated reports.

```python
#!/usr/bin/env python3
"""Generate a PDF report from data."""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from datetime import date

def generate_report(filename: str, title: str, rows: list[list]) -> None:
    doc    = SimpleDocTemplate(filename, pagesize=A4)
    styles = getSampleStyleSheet()
    story  = []

    # Title
    story.append(Paragraph(title, styles["Title"]))
    story.append(Paragraph(f"Generated: {date.today()}", styles["Normal"]))
    story.append(Spacer(1, 20))

    # Table
    headers = [["#", "Item", "Status", "Value"]]
    data    = headers + rows
    table   = Table(data, colWidths=[30, 250, 100, 80])
    table.setStyle(TableStyle([
        ("BACKGROUND",  (0, 0), (-1, 0),  colors.HexColor("#0d1117")),
        ("TEXTCOLOR",   (0, 0), (-1, 0),  colors.HexColor("#00ff88")),
        ("FONTNAME",    (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",    (0, 0), (-1, 0),  11),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9f9f9")]),
        ("GRID",        (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("TOPPADDING",  (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(table)
    doc.build(story)
    print(f"Report saved: {filename}")

if __name__ == "__main__":
    sample_data = [
        [1, "SSL Certificate Check", "PASS", "A+"],
        [2, "Security Headers",      "WARN", "B"],
        [3, "Open Ports Scan",       "PASS", "Clean"],
        [4, "Dependency Audit",      "FAIL", "3 CVEs"],
    ]
    generate_report("security_report.pdf", "Security Audit Report", sample_data)
```

**Install:** `pip install reportlab`

---

## 7. Environment Variable Auditor

Check a project's `.env` file for common security mistakes before pushing to version control.

```python
#!/usr/bin/env python3
"""Audit .env files for common security issues."""
import re
from pathlib import Path

WEAK_VALUES   = {"changeme", "password", "secret", "12345", "test", "example", "your_key_here", ""}
SENSITIVE_KEYS = re.compile(r"(password|secret|key|token|api|auth|cred|private)", re.I)

def audit(env_path: str = ".env") -> None:
    path = Path(env_path)
    if not path.exists():
        print(f"No .env file found at {env_path}")
        return

    issues = []
    for i, line in enumerate(path.read_text().splitlines(), 1):
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key   = key.strip()
        value = value.strip().strip('"').strip("'")

        if value.lower() in WEAK_VALUES:
            issues.append((i, key, "⚠ Weak or empty value"))
        if len(value) < 16 and SENSITIVE_KEYS.search(key):
            issues.append((i, key, "⚠ Sensitive key with short value"))
        if value.startswith("http://") and "localhost" not in value:
            issues.append((i, key, "⚠ Non-HTTPS URL"))

    if issues:
        print(f"Found {len(issues)} issue(s) in {env_path}:\n")
        for lineno, key, msg in issues:
            print(f"  Line {lineno:>3} | {key:<30} | {msg}")
    else:
        print(f"✓ No obvious issues found in {env_path}")

if __name__ == "__main__":
    import sys
    audit(sys.argv[1] if len(sys.argv) > 1 else ".env")
```

---

## 8. Directory Tree Snapshot

Capture a snapshot of a directory structure to a text file — useful for documentation and change tracking.

```python
#!/usr/bin/env python3
"""Capture a directory tree snapshot."""
from pathlib import Path

IGNORE = {".git", "__pycache__", "node_modules", ".venv", ".DS_Store"}

def tree(path: Path, prefix: str = "", output: list | None = None) -> list[str]:
    if output is None:
        output = [str(path)]
    children = sorted(
        [p for p in path.iterdir() if p.name not in IGNORE],
        key=lambda p: (p.is_file(), p.name.lower())
    )
    for i, child in enumerate(children):
        connector = "└── " if i == len(children) - 1 else "├── "
        output.append(prefix + connector + child.name)
        if child.is_dir():
            extension = "    " if i == len(children) - 1 else "│   "
            tree(child, prefix + extension, output)
    return output

if __name__ == "__main__":
    import sys
    from datetime import datetime
    root    = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    lines   = tree(root)
    out     = "\n".join(lines)
    outfile = f"tree_{root.name}_{datetime.now():%Y%m%d_%H%M%S}.txt"
    Path(outfile).write_text(out)
    print(out)
    print(f"\nSaved to {outfile}")
```

---

## 9. REST API Batch Requester

Process a list of IDs or items through a REST API with error handling, retries, and rate limit awareness.

```python
#!/usr/bin/env python3
"""Batch process items through a REST API."""
import time
import requests
from typing import Any

API_BASE  = "https://jsonplaceholder.typicode.com"
DELAY     = 0.2    # seconds between requests
MAX_RETRY = 3

def fetch(endpoint: str, session: requests.Session) -> dict | None:
    for attempt in range(1, MAX_RETRY + 1):
        try:
            resp = session.get(f"{API_BASE}{endpoint}", timeout=10)
            if resp.status_code == 429:
                wait = int(resp.headers.get("Retry-After", 5))
                print(f"  Rate limited — waiting {wait}s")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            return resp.json()
        except requests.RequestException as e:
            print(f"  Attempt {attempt}/{MAX_RETRY} failed: {e}")
            if attempt < MAX_RETRY:
                time.sleep(2 ** attempt)   # exponential backoff
    return None

def batch_fetch(ids: list[int]) -> list[dict[str, Any]]:
    results = []
    with requests.Session() as session:
        session.headers.update({"Accept": "application/json"})
        for item_id in ids:
            data = fetch(f"/posts/{item_id}", session)
            if data:
                results.append(data)
                print(f"  ✓ Fetched post {item_id}: {data.get('title', '')[:50]}")
            else:
                print(f"  ✗ Failed post {item_id}")
            time.sleep(DELAY)
    return results

if __name__ == "__main__":
    results = batch_fetch(list(range(1, 11)))
    print(f"\nFetched {len(results)} items successfully.")
```

---

## 10. Log File Analyser

Parse application or server logs to extract error frequencies, top IPs, and slow requests.

```python
#!/usr/bin/env python3
"""Analyse a web server access log."""
import re
from pathlib import Path
from collections import Counter

# Common Log Format regex
LOG_PATTERN = re.compile(
    r'(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] '
    r'"(?P<method>\S+) (?P<path>\S+) \S+" '
    r'(?P<status>\d{3}) (?P<size>\S+)'
)

def analyse(log_path: str, top_n: int = 10) -> None:
    lines    = Path(log_path).read_text(errors="ignore").splitlines()
    ips      = Counter()
    statuses = Counter()
    paths    = Counter()
    errors   = []

    for line in lines:
        m = LOG_PATTERN.match(line)
        if not m:
            continue
        d = m.groupdict()
        ips[d["ip"]]         += 1
        statuses[d["status"]] += 1
        paths[d["path"]]     += 1
        if d["status"].startswith(("4", "5")):
            errors.append(f'{d["status"]} {d["method"]} {d["path"]}')

    print(f"=== Log Analysis: {log_path} ===\n")
    print(f"Total requests: {len(lines)}\n")

    print(f"Top {top_n} IPs:")
    for ip, count in ips.most_common(top_n):
        print(f"  {count:>6}  {ip}")

    print(f"\nStatus code breakdown:")
    for code, count in sorted(statuses.items()):
        print(f"  {code}  {count:>6}")

    print(f"\nTop {top_n} paths:")
    for path, count in paths.most_common(top_n):
        print(f"  {count:>6}  {path}")

    print(f"\nLast 10 errors:")
    for err in errors[-10:]:
        print(f"  {err}")

if __name__ == "__main__":
    import sys
    analyse(sys.argv[1] if len(sys.argv) > 1 else "access.log")
```

---

## Making Scripts Production-Ready

The scripts above work as-is, but a few additions make them production-quality:

**Add argument parsing:**
```python
import argparse
parser = argparse.ArgumentParser(description="My script")
parser.add_argument("path", help="Target path")
parser.add_argument("--dry-run", action="store_true")
args = parser.parse_args()
```

**Add logging instead of print:**
```python
import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)
logger.info("Starting process")
```

**Schedule with cron (Linux) or Task Scheduler (Windows):**
```bash
# Run uptime monitor every 5 minutes
*/5 * * * * /usr/bin/python3 /home/user/monitor.py >> /var/log/monitor.log 2>&1
```

**Package dependencies:**
```bash
pip freeze > requirements.txt
pip install -r requirements.txt
```

The best automation is the automation you actually run. Start with one script that solves a real problem you have today. Once it works, you will start seeing automation opportunities everywhere.
