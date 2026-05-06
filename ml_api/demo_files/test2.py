from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from bson import ObjectId
import os

load_dotenv()
client = MongoClient(os.getenv("MONGO_URL"))
db = client["EasyLiving"]

test_user_id = ObjectId("69e3e3f4f7925774adc9fe1b")

# Clean wipe
db["moodlogs"].delete_many({"userId": test_user_id})
db["expenselogs"].delete_many({"userId": test_user_id})
print("wiped")

# Verify
print("moodlogs after wipe:", db["moodlogs"].count_documents({"userId": test_user_id}))
print("expenselogs after wipe:", db["expenselogs"].count_documents({"userId": test_user_id}))