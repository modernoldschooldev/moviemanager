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

## TODO List

### Frontend Automated Test Suite

- render categories
  - do we get the category checkboxes?
- render main page
  - can we select a movie?
    - does movie selection fill out movie data form?
    - does movie selection fill out selected actors?
    - does movie data select our categories?
  - does remove button bring up confirm?
  - does selecting update trigger a status message?
  - does adding/removing an actor?
  - does adding/removing a category?
- render full app
  - can we switch to admin page?
  - can we switch back?
- render admin page
  - change action to update
    - does the select box appear?
    - does it have the actors in it?
    - can we update an actor's name?
    - can we change it to one that already exists?
  - change action to remove
    - does the text box disappear?
    - can we remove a None selection?
    - can we remove anything else?
    - can we remove a property associated with a movie?
    - does remove trigger a confirm?
  - change action to add
    - does text box reappear?
    - does select box disappear?
  - repeat tests for category, series, studio
  - does import movies button work?

### Backend Automated Test Suite

- TBD

## License

Copyright (C) 2021 Modern Old School Developer

Released under GPLv3
