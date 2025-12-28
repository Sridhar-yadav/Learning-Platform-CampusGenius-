from pymongo import MongoClient
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class MongoDBClient:
    _instance = None
    _client = None
    _db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBClient, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        try:
            # Set a low timeout so we don't hang if Mongo is down
            self._client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=2000)
            # Trigger a connection attempt
            self._client.server_info()
            self._db = self._client[settings.MONGO_DB_NAME]
            logger.info("Successfully connected to MongoDB")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            self._db = None # Fallback to no-db

    @property
    def db(self):
        if self._db is None and self._client is None:
            self._initialize()
        return self._db

def get_db():
    return MongoDBClient().db
