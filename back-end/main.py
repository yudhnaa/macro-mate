from typing import Union
import logging

from fastapi import FastAPI

from utils.logger import setup_logger


logger = setup_logger(__name__, level=logging.DEBUG)
app = FastAPI()


@app.get("/")
def read_root():
    logger.debug("Root endpoint called")
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    logger.debug(f"Item endpoint called with item_id: {item_id} and query: {q}")
    return {"item_id": item_id, "q": q}