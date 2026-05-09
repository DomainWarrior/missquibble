---
title: "Building a REST API with FastAPI and Python: A Complete Beginner's Guide"
description: "Build a fully functional REST API with FastAPI—covering routes, request/response models, data validation with Pydantic, database integration, and automatic interactive docs."
date: 2026-08-13T10:00:00-04:00
tags: ["python", "fastapi", "REST API", "web development", "tutorial"]
categories: ["Python", "Web Development"]
draft: false
featuredImage: "/posts/images/python.jpeg"
slug: "fastapi-rest-api-tutorial"
seoKeywords:
  - FastAPI tutorial beginner
  - build REST API Python
  - FastAPI CRUD example
  - FastAPI Pydantic models
  - Python web API tutorial
  - FastAPI vs Django Flask
canonicalUrl: "https://missquibble.com/posts/fastapi-rest-api-tutorial/"
---

#### ***Introduction***

FastAPI is one of the most exciting things to happen to Python web development in years. It is fast — comparable to Node.js and Go in benchmarks — it has built-in data validation, it generates interactive API documentation automatically, and it has a genuinely clean, intuitive design. If you need to build a REST API in Python, FastAPI is the modern choice. This guide takes you from installation to a working CRUD API in a single session.

# Why FastAPI?

Before writing any code, a quick comparison:

**Django REST Framework** is mature, batteries-included, and excellent for large projects with complex data models. Its learning curve is steeper.

**Flask** is minimal and flexible. You assemble your own stack, which is powerful but requires more decisions and boilerplate for API development.

**FastAPI** hits a sweet spot: it is minimal enough to start immediately, has automatic request validation via Pydantic, generates OpenAPI docs out of the box, and uses Python type hints throughout — which makes the code self-documenting and IDE-friendly.

# Installation

```bash
pip install fastapi uvicorn[standard]
```

`uvicorn` is the ASGI server that runs your FastAPI application. The `[standard]` extra includes performance dependencies.

# Your First API

Create `main.py`:

```python
from fastapi import FastAPI

app = FastAPI(
    title="My API",
    description="A simple FastAPI example",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "Hello, FastAPI!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

Run it:

```bash
uvicorn main:app --reload
```

The `--reload` flag restarts the server on every file change. Open `http://localhost:8000` — you will see your JSON response. Now open `http://localhost:8000/docs` — FastAPI has automatically generated interactive Swagger documentation for your API. Every endpoint, parameter, and response schema is there, and you can test them directly in the browser.

# Pydantic Models for Request and Response

FastAPI uses Pydantic for data validation. Define your data shapes as Python classes:

```python
from pydantic import BaseModel, Field
from typing import Optional

class BookCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    author: str
    year: int = Field(..., ge=1000, le=2100)
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)

class Book(BookCreate):
    id: int

    class Config:
        from_attributes = True
```

When you use these as parameter types in route functions, FastAPI automatically validates incoming data and returns a detailed error response if validation fails — no manual validation code required.

# Building a CRUD API

Here is a complete in-memory CRUD API for a book collection:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

app = FastAPI(title="Books API")

# In-memory store (replace with a real database)
books_db: dict[int, dict] = {}
counter = 0

class BookCreate(BaseModel):
    title: str = Field(..., min_length=1)
    author: str
    year: int

class Book(BookCreate):
    id: int

@app.get("/books", response_model=list[Book])
def list_books():
    return list(books_db.values())

@app.get("/books/{book_id}", response_model=Book)
def get_book(book_id: int):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Book not found")
    return books_db[book_id]

@app.post("/books", response_model=Book, status_code=201)
def create_book(book: BookCreate):
    global counter
    counter += 1
    new_book = {"id": counter, **book.model_dump()}
    books_db[counter] = new_book
    return new_book

@app.put("/books/{book_id}", response_model=Book)
def update_book(book_id: int, book: BookCreate):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Book not found")
    books_db[book_id] = {"id": book_id, **book.model_dump()}
    return books_db[book_id]

@app.delete("/books/{book_id}", status_code=204)
def delete_book(book_id: int):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Book not found")
    del books_db[book_id]
```

Every route declares its `response_model`, which FastAPI uses to serialize output and generate documentation. Path parameters like `{book_id}` are automatically cast to their declared type (`int` here) and validated.

# Adding a Real Database

Swap the in-memory dict for SQLite using `SQLAlchemy`:

```bash
pip install sqlalchemy
```

```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, Session

DATABASE_URL = "sqlite:///./books.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Base = declarative_base()

class BookModel(Base):
    __tablename__ = "books"
    id     = Column(Integer, primary_key=True, index=True)
    title  = Column(String, nullable=False)
    author = Column(String, nullable=False)
    year   = Column(Integer)

Base.metadata.create_all(bind=engine)

# Dependency injection for database sessions
from fastapi import Depends

def get_db():
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()

@app.get("/books", response_model=list[Book])
def list_books(db: Session = Depends(get_db)):
    return db.query(BookModel).all()
```

FastAPI's `Depends` system handles dependency injection cleanly — the database session is created per request and closed automatically.

# What to Learn Next

- **Authentication** — add JWT or OAuth2 with FastAPI's `OAuth2PasswordBearer`
- **Background Tasks** — `BackgroundTasks` for sending emails or processing uploads asynchronously
- **Testing** — FastAPI's `TestClient` makes API testing straightforward with pytest
- **Deployment** — containerize with Docker and deploy to any cloud provider

# Conclusion

FastAPI makes building a clean, well-documented, validated REST API one of the most enjoyable experiences in Python development. The combination of automatic docs, Pydantic validation, and type-hint-driven design means you write less boilerplate and catch more errors before they reach production. Build the books API above, swap the in-memory store for a real database, and you have a production-ready foundation you can extend into any project.
