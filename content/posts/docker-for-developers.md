---
title: "Docker for Developers: Containerize Your First App in 20 Minutes"
description: "Learn Docker from zero—understand containers vs VMs, write your first Dockerfile, run containers, and use Docker Compose to connect multiple services together."
date: 2026-06-18T10:00:00-04:00
tags: ["docker", "devops", "containers", "beginner", "web development"]
categories: ["DevOps", "Programming"]
draft: false
slug: "docker-for-developers"
seoKeywords:
  - Docker beginner tutorial
  - learn Docker containers
  - Dockerfile tutorial
  - Docker Compose example
  - containerize web app
  - Docker for developers
canonicalUrl: "https://missquibble.com/posts/docker-for-developers/"
---

## Table of Contents
- [Containers vs Virtual Machines](#containers-vs-virtual-machines)
- [Installing Docker](#installing-docker)
- [Your First Container](#your-first-container)
- [Writing a Dockerfile](#writing-a-dockerfile)
- [Building and Running Your Image](#building-and-running-your-image)
- [Docker Compose: Multi-Container Apps](#docker-compose-multi-container-apps)
- [Essential Docker Commands](#essential-docker-commands)

#### ***Introduction***

"It works on my machine" is one of the most infamous phrases in software development. Docker exists to eliminate it. By packaging your application and everything it needs — runtime, dependencies, configuration — into a portable container, Docker ensures your app runs identically everywhere: your laptop, a teammate's machine, a staging server, and production. This guide gets you from zero to a running containerized app in about twenty minutes.

# Containers vs Virtual Machines

Before writing any code, it helps to understand what Docker actually is.

A **virtual machine** runs a full operating system on top of your hardware via a hypervisor. Each VM has its own kernel, OS files, and allocated memory — heavy, slow to start, but completely isolated.

A **container** shares the host machine's OS kernel but runs in an isolated process with its own filesystem, network, and resources. Containers start in seconds, use a fraction of the resources of a VM, and a single machine can comfortably run dozens of them.

Docker is the most popular tool for building and running containers. An **image** is the blueprint (like a class in programming). A **container** is a running instance of an image (like an object).

# Installing Docker

Download **Docker Desktop** from docker.com/products/docker-desktop. It includes everything you need: the Docker engine, CLI, and Compose. On Windows, Docker Desktop uses WSL 2 under the hood.

After installation, confirm it works:

```bash
docker --version
docker run hello-world
```

If you see a friendly message from Docker, you are ready.

# Your First Container

The fastest way to run something useful:

```bash
docker run -p 8080:80 nginx
```

This pulls the official Nginx image from Docker Hub and runs it, forwarding your machine's port 8080 to the container's port 80. Open `http://localhost:8080` and you will see the Nginx welcome page.

Press `Ctrl+C` to stop it. The container is gone — nothing persists, nothing left behind.

# Writing a Dockerfile

A `Dockerfile` is a text file that defines how to build your image. Here is one for a simple Python Flask app:

**app.py:**
```python
from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "<h1>Hello from Docker!</h1>"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```

**requirements.txt:**
```
flask==3.0.0
```

**Dockerfile:**
```dockerfile
# Start from the official Python image
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy and install dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Tell Docker what port the app listens on
EXPOSE 5000

# Command to run when the container starts
CMD ["python", "app.py"]
```

Each line in a Dockerfile creates a **layer**. Docker caches layers, so putting dependencies before your code means rebuilds are fast — Docker only re-runs layers that changed.

# Building and Running Your Image

```bash
# Build the image and tag it "my-flask-app"
docker build -t my-flask-app .

# Run it, forwarding port 5000
docker run -p 5000:5000 my-flask-app
```

Visit `http://localhost:5000`. Your Flask app is running in a container.

To run it in the background (detached mode):

```bash
docker run -d -p 5000:5000 --name flask my-flask-app
docker logs flask        # see output
docker stop flask        # stop it
docker rm flask          # remove it
```

# Docker Compose: Multi-Container Apps

Real apps rarely have just one service. A typical web app needs a web server, a database, and maybe a cache. **Docker Compose** lets you define and run multi-container applications with a single file.

**docker-compose.yml:**
```yaml
version: "3.9"
services:
  web:
    build: .
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Start everything with one command:

```bash
docker-compose up          # foreground
docker-compose up -d       # background
docker-compose down        # stop and remove containers
docker-compose down -v     # also remove volumes
```

Docker handles the networking automatically — your `web` container can reach `db` simply by using the service name as the hostname.

# Essential Docker Commands

```bash
docker ps                  # list running containers
docker ps -a               # list all containers including stopped
docker images              # list local images
docker pull nginx          # pull an image from Docker Hub
docker exec -it <id> bash  # open a shell inside a running container
docker logs <id>           # view container output
docker rm $(docker ps -aq) # remove all stopped containers
docker rmi $(docker images -q) # remove all images
```

# Conclusion

Docker solves one of the most persistent problems in software development: environment consistency. Once you understand images, containers, Dockerfiles, and Compose, you will wonder how you shipped software without it. The next steps from here are exploring Docker volumes for persistent data, multi-stage builds for smaller production images, and container orchestration with Kubernetes — but the foundation you have built here carries you a long way.
