class DuplicateEntryException(Exception):
    """Raised when a duplicate entry is detected."""

    pass


class InvalidIDException(Exception):
    """Raised when an ID is not found in the database."""

    pass


class IntegrityConstraintException(Exception):
    """Raised when a database action would cause an integrity issue."""

    pass


class ListFilesException(Exception):
    """Raised when we cannot list the files in a directory for any reason."""

    pass


class PathException(Exception):
    """Raised when any file operation fails."""

    pass
