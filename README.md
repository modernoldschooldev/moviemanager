# Movie Manager

Demo Movie Manager App using ReactJS and FastAPI.

The application will manage movie files on your hard drive.
You can import files into a database.
The backend will use these properties to name the file and add links in various property folders.

Watch the application be built from scratch on
[YouTube](https://www.youtube.com/playlist?list=PLRuA8IBw6y5WSh5Gc48xJ72YpK5kKA-oL).

## Technology Used in this Project

* TypeScript
* ReactJS
* Redux
* Redux Toolkit
* React Router
* Formik
* TailwindCSS
* Python
* FastAPI
* SQLAlchemy
* Sqlite

## How to run this application

### Docker

1. Install docker and docker-compose
1. Run `docker-compose -d up`

### Local Development

#### FastAPI Backend

**Requires python >= 3.7**

1. Add movie files to imports
1. Run with python poetry - **Requires poetry**

   1. Install environment

      ```bash
      poetry install
      ```

   1. Run backend

      ```bash
      poetry run python run.py
      ```

1. Using venv and pip - **Requires venv module and pip**

   1. Create venv

      ```bash
      # Linux, WSL, and macOS only
      # Windows native is quirky -- use WSL instead
      python3 -m venv venv
      source venv/bin/activate
      pip install --upgrade pip setuptools wheel
      pip install -r backend/requirements-dev.txt
      ```

   1. Start backend

      ```bash
      python run.py
      ```

#### React Frontend

**Requires Node >= 14**

1. Go to frontend folder in terminal
2. npm install
3. npm start

## TODO List

### Frontend

* add end-to-end tests with cypress

### Backend

* automated test suite with pytest
* SQLAlchemy 2.0 API
* async SQLAlchemy

## License

Copyright (C) 2021 Modern Old School Developer

Released under GPLv3
