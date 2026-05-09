---
title: "Python Web Scraping with BeautifulSoup and Requests"
description: "Learn to extract data from websites using Python, BeautifulSoup, and Requests—covering HTTP requests, HTML parsing, data extraction, and best practices for ethical scraping."
date: 2026-07-02T10:00:00-04:00
tags: ["python", "web scraping", "beautifulsoup", "automation", "tutorial"]
categories: ["Python", "Programming"]
draft: false
slug: "python-web-scraping-beautifulsoup"
seoKeywords:
  - Python web scraping tutorial
  - BeautifulSoup beginner guide
  - web scraping with Requests Python
  - scrape website Python
  - HTML parsing Python
  - ethical web scraping
canonicalUrl: "https://missquibble.com/posts/python-web-scraping-beautifulsoup/"
---

## Table of Contents
- [What Is Web Scraping?](#what-is-web-scraping)
- [Installing the Tools](#installing-the-tools)
- [Fetching a Page with Requests](#fetching-a-page-with-requests)
- [Parsing HTML with BeautifulSoup](#parsing-html-with-beautifulsoup)
- [Extracting Specific Data](#extracting-specific-data)
- [Saving Your Data](#saving-your-data)
- [Handling Pagination](#handling-pagination)
- [Ethical Scraping Guidelines](#ethical-scraping-guidelines)

#### ***Introduction***

Data is everywhere on the web — but it is not always in a convenient, downloadable format. Web scraping is the technique of programmatically extracting information from websites. Python makes this remarkably straightforward with two libraries: `requests` for fetching web pages and `BeautifulSoup` for parsing and navigating the HTML. This tutorial takes you from a blank file to a working scraper that extracts, structures, and saves real data.

# What Is Web Scraping?

A web scraper is essentially an automated browser. It sends HTTP requests to a server, receives HTML in response, and then parses that HTML to pull out the specific pieces of information you need — product prices, article titles, contact information, job listings, weather data, or anything else that lives on a public web page.

The applications are enormous: price comparison tools, research data collection, content aggregation, monitoring services, and more. Python is the most popular language for web scraping by a wide margin.

# Installing the Tools

```bash
pip install requests beautifulsoup4 lxml
```

`lxml` is a fast HTML/XML parser that BeautifulSoup can use as its backend. Install it alongside BeautifulSoup for best performance.

# Fetching a Page with Requests

```python
import requests

url = "https://books.toscrape.com/"
response = requests.get(url)

print(response.status_code)  # 200 = success
print(response.text[:500])   # first 500 characters of HTML
```

Always check the status code. `200` means success. `403` means forbidden (the server is blocking you). `429` means too many requests (you are being rate-limited).

Add headers to make your scraper look like a real browser:

```python
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
response = requests.get(url, headers=headers)
```

# Parsing HTML with BeautifulSoup

```python
from bs4 import BeautifulSoup

soup = BeautifulSoup(response.text, "lxml")

# Find elements by tag
title = soup.find("title")
print(title.text)

# Find all elements of a type
all_links = soup.find_all("a")
print(len(all_links))  # how many links on the page
```

BeautifulSoup turns the raw HTML string into a navigable tree. You can search it by tag name, CSS class, ID, attributes, or any combination.

# Extracting Specific Data

`books.toscrape.com` is a sandbox site built for scraping practice. Let's extract book titles and prices:

```python
books = soup.find_all("article", class_="product_pod")

for book in books:
    title = book.find("h3").find("a")["title"]
    price = book.find("p", class_="price_color").text.strip()
    rating = book.find("p", class_="star-rating")["class"][1]
    
    print(f"{title} | {price} | {rating} stars")
```

The `find_all` method accepts a tag name and a dictionary of attributes. `class_` (with underscore) is used instead of `class` because `class` is a reserved Python keyword.

To navigate the HTML tree by relationship:

```python
parent = element.parent          # go up one level
children = list(element.children) # direct children
siblings = element.next_siblings  # elements at the same level
```

# Saving Your Data

Once you have extracted your data, save it somewhere useful:

```python
import csv

books_data = []
for book in books:
    books_data.append({
        "title": book.find("h3").find("a")["title"],
        "price": book.find("p", class_="price_color").text.strip(),
    })

with open("books.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["title", "price"])
    writer.writeheader()
    writer.writerows(books_data)

print(f"Saved {len(books_data)} books to books.csv")
```

For structured data that needs querying later, consider saving to a SQLite database using Python's built-in `sqlite3` module.

# Handling Pagination

Most real-world scraping involves multiple pages. Here is how to handle simple numbered pagination:

```python
import time

all_books = []
base_url = "https://books.toscrape.com/catalogue/page-{}.html"

for page_num in range(1, 6):  # pages 1 through 5
    url = base_url.format(page_num)
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "lxml")
    
    books = soup.find_all("article", class_="product_pod")
    for book in books:
        all_books.append(book.find("h3").find("a")["title"])
    
    time.sleep(1)  # be polite — wait 1 second between requests

print(f"Collected {len(all_books)} books across 5 pages")
```

The `time.sleep(1)` call is important — it prevents hammering the server with rapid requests.

# Ethical Scraping Guidelines

Web scraping lives in a legal and ethical gray area. Follow these principles to stay on the right side of both:

**Check `robots.txt` first.** Navigate to `example.com/robots.txt` to see what paths the site owner has asked scrapers not to access. Respect these rules.

**Rate-limit your requests.** Add `time.sleep()` between requests. A good default is 1-2 seconds. Hitting a server hundreds of times per second is effectively a DoS attack.

**Do not scrape personal data.** Extracting names, emails, or other identifying information about individuals raises serious privacy and legal concerns.

**Read the Terms of Service.** Some sites explicitly prohibit scraping in their ToS. Violating ToS has led to legal action in some cases.

**Use official APIs when available.** If a site offers an API for the data you need, use it. APIs are faster, more stable, and explicitly intended for programmatic access.

# Conclusion

BeautifulSoup and Requests are a powerful, beginner-friendly combination for web scraping. Once you are comfortable with the basics, the natural next steps are Selenium or Playwright for JavaScript-heavy sites that require a full browser, and Scrapy for large-scale scraping projects that need concurrency, pipelines, and middleware. But for most data extraction tasks, what you learned here is everything you need.
