---
title: "How to Build a Simple Format Generator from Scratch using Django and Python"
description: "Step-by-step tutorial for building a Markdown format generator web app using Django and Python—covering models, forms, views, templates, and URL routing from scratch."
date: 2023-10-19T13:29:13-04:00
tags: ["code", "python", "django", "project"]
categories: ["code", "python", "django", "project"]
draft: false
slug: "build_a_format_generator_using_django-and-python"
seoKeywords:
  - Django Python web app tutorial
  - Markdown generator Django
  - Django beginner project
  - build format generator Django
  - Python Django views templates
  - Django models forms tutorial
featuredImage: "/posts/images/django.PNG"
canonicalUrl: "https://missquibble.com/posts/build_a_format_generator_using_django-and-python/"
---

![django](/../posts/images/django.PNG#center)

In today's digital age, content creation is a significant part of our daily lives, whether it's for a blog, a website, or even a school assignment. Often, we need to format our content to make it more visually appealing or structured. Creating a format generator can be a handy tool for this purpose. In this tutorial, we'll guide you through the process of building a simple format generator using Django and Python that will generate content in Markdown format. Markdown is a lightweight markup language that is easy to learn and widely used for formatting text on the web.

## Prerequisites

Before we start, make sure you have the following tools and knowledge:

1\. **Python**: You should have Python installed on your system. You can download it from [python.org](https://www.python.org/downloads/).

2\. **Django**: Install Django using pip:

```bash
pip install Django
```

3\. **Text Editor/IDE**: Choose your preferred code editor or integrated development environment (IDE) for writing code. Examples include Visual Studio Code, PyCharm, and Sublime Text.

## Project Setup

Let's create a new Django project and a Markdown format generator app.

1\. **Create a Django Project:**

   Open your terminal and run the following command to create a new Django project:

```bash
django-admin startproject format_generator
```

2\. **Create a Markdown Generator App:**

   Inside your project directory, create a new app for our format generator:

```bash

   cd format_generator

   python manage.py startapp generator

```

3\. **Add the App to Settings:**

   Open the `format_generator/settings.py` file and add the 'generator' app to the `INSTALLED_APPS` list.

```python

   INSTALLED_APPS = [

       # ...

       'generator',

   ]

```

## Creating the Model

In our format generator, we'll create a simple model to store the content that users want to format. Open the `generator/models.py` file and define the model as follows:


```python


from django.db import models

class Content(models.Model):

    title = models.CharField(max_length=100)

    text = models.TextField()

    def __str__(self):

        return self.title

```

Don't forget to run the migrations to create the database table for the `Content` model:

```bash

python manage.py makemigrations

python manage.py migrate

```

## Building Views and Templates

Now, let's create the views and templates for our format generator.

1\. **Create a Form:**

   In the `generator` app, create a `forms.py` file to define a form for the content. We'll use a simple form that contains a title and the text to be formatted.

```python

   from django import forms

   from .models import Content

   class ContentForm(forms.ModelForm):

       class Meta:

           model = Content

           fields = ['title', 'text']

```

2\. **Create a View:**

   Create a view in `generator/views.py` that will handle the form submission and render the results.

```python

   from django.shortcuts import render

   from .forms import ContentForm

   import mistune  # A Markdown parser

   def format_generator(request):

       if request.method == 'POST':

           form = ContentForm(request.POST)

           if form.is_valid():

               content = form.save()

               formatted_text = mistune.markdown(content.text)

               return render(request, 'generator/formatted_content.html', {'formatted_text': formatted_text})

       else:

           form = ContentForm()

       return render(request, 'generator/format_generator.html', {'form': form})

```

3\. **Create Templates:**

   Create two HTML templates: `format_generator.html` and `formatted_content.html` in the `generator/templates/generator` directory.

   - `format_generator.html`:

```html

     {% extends "base.html" %}

     {% block content %}

     <h1>Markdown Format Generator</h1>

     <form method="post">

         {% csrf_token %}

         {{ form.as_p }}

         <button type="submit">Generate Markdown</button>

     </form>

     {% endblock %}

```

   - `formatted_content.html`:

```html

     {% extends "base.html" %}

     {% block content %}

     <h1>Formatted Content</h1>

     <div>{{ formatted_text|safe }}</div>

     <a href="{% url 'format_generator' %}">Generate More</a>

     {% endblock %}

```

4\. **URL Configuration:**

   Define the URL patterns for your app in `generator/urls.py`:

```python

   from django.urls import path

   from . import views

   urlpatterns = [

       path('', views.format_generator, name='format_generator'),

   ]

```

   Include these URLs in the project's `urls.py`:

```python

   from django.contrib import admin

   from django.urls import path, include

   urlpatterns = [

       path('admin/', admin.site.urls),

       path('generator/', include('generator.urls')),

   ]

```

## Running the Application

Now that we have set up our project, you can run it using the following command:

```bash

python manage.py runserver

```

Visit `http://127.0.0.1:8000/generator/` in your web browser, and you'll see the Markdown Format Generator form. You can enter a title and some text, click the "Generate Markdown" button, and the formatted content will be displayed on a new page.

That's it! You've successfully created a simple format generator using Django and Python, which converts plain text into Markdown format. You can extend this project by adding more formatting options or saving the formatted content to a file.

Happy formatting!