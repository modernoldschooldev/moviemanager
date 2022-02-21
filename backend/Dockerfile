FROM python:3.8-slim-bullseye

WORKDIR /app

COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY moviemanager ./moviemanager

EXPOSE 8000

CMD [ "uvicorn", "moviemanager.main:app", "--host", "0.0.0.0", "--log-config", "/var/db/moviemanager/logging.yaml" ]
