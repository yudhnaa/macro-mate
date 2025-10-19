import logging
import sys


def setup_logger(
    name: str, log_file: str = None, level: int = logging.INFO
) -> logging.Logger:
    """Function to set up a logger with the specified name, log file, and level.

    Args:
        name (str): The name of the logger.
        log_file (str, optional): The file to log messages to.
            If None, logs to stdout. Defaults to None.
        level (int, optional): The logging level. Defaults to logging.INFO.

    Returns:
        logging.Logger: Configured logger instance.
    """

    logger = logging.getLogger(name)
    logger.setLevel(level)

    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    if log_file:
        handler = logging.FileHandler(log_file)
    else:
        handler = logging.StreamHandler(sys.stdout)

    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger
