import argparse

import uvicorn

from moviemanager.config import get_log_config
from moviemanager.rebuild import rebuild_db
from moviemanager.relink import relink_property_files


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--run", action="store_true", required=False, help="Run uvicorn backend"
    )

    parser.add_argument(
        "--relink", action="store_true", required=False, help="Relink files"
    )

    parser.add_argument(
        "--rebuild", action="store_true", required=False, help="Rebuild DB from files"
    )

    args = parser.parse_args()

    if args.relink:
        relink_property_files()
    elif args.rebuild:
        rebuild_db()
    else:
        uvicorn.run("moviemanager.main:app", reload=True, log_config=get_log_config())


if __name__ == "__main__":
    main()
