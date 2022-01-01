# Movie Manager

Demo Movie Manager App using ReactJS and FastAPI.

The application will manage movie files on your hard drive.
You can import files into a database.
The backend will use these properties to name the file and add links in various property folders.

Watch the application be built from scratch on
[YouTube](https://www.youtube.com/playlist?list=PLRuA8IBw6y5WSh5Gc48xJ72YpK5kKA-oL).

## Technology Used in this Project

- TypeScript
- ReactJS
- Redux
- Redux Toolkit
- React Router
- Formik
- TailwindCSS
- Python
- FastAPI
- SQLAlchemy
- Sqlite

## How to run this application

### FastAPI Backend

**Requires python >= 3.6, virtualenv, and pip**

1. Inside the backend/db folder, create a movies and imports directory
1. Add movie files to imports
1. Create venv

    ```bash
    # Linux/WSL and macOS only
    # Windows native is too quirky -- use WSL
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    ```

1. Start backend with `python run.py`

### React Frontend

**Requires Node >= 14**

1. Go to frontend folder in terminal
2. npm install
3. npm start

## License

Copyright (C) 2021 Modern Old School Developer

Released under GPLv3
