import logging
import sys


def setup_logging(level: str = "INFO") -> None:
    """Configure structured key=value logging for the Ginny backend.

    Uses only the standard library — no extra dependencies.
    Call once at application startup before the app processes any requests.
    """
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s level=%(levelname)s logger=%(name)s %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
        stream=sys.stdout,
        force=True,  # replace any handlers already attached by uvicorn
    )

    # Suppress high-volume debug output from third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
