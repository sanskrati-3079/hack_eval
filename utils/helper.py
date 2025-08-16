from db import mongo

def insert_document(collection_name: str, model_obj):
    """Insert a Pydantic model into the MongoDB collection"""
    db[collection_name].insert_one(model_obj.dict())

def get_document(collection_name: str, query: dict, model_class):
    """Fetch a document from MongoDB and validate with Pydantic"""
    doc = db[collection_name].find_one(query)
    if doc:
        doc.pop("_id", None)
        return model_class(**doc)
    return None
