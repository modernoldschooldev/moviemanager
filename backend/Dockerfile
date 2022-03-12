FROM python:3.7-slim-bullseye

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY moviemanager ./moviemanager

EXPOSE 8000
