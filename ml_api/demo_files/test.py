from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from bson import ObjectId
import os

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]

test_user_id = ObjectId("69e3e3f4f7925774adc9fe1b")
start = datetime.now(timezone.utc) - timedelta(days=8)

# Try with date filter
result1 = list(db["moodlogs"].find({
    "userId": test_user_id,
    "date": {"$gte": start}
}))
print("with date filter:", len(result1))

# Try without date filter
result2 = list(db["moodlogs"].find({
    "userId": test_user_id
}))
print("without date filter:", len(result2))

# Print all dates
for doc in result2:
    print("doc date:", doc['date'], "tzinfo:", doc['date'].tzinfo)

##Extra test
from datetime import datetime, timedelta

start = datetime.now() - timedelta(days=8)
print("start:", start)

result = list(db["moodlogs"].find({
    "userId": test_user_id,
    "date": {"$gte": start}
}))
print("count:", len(result))

print("URI being used:", os.getenv("MONGO_URI"))
print("DB name:", os.getenv("DB_NAME"))
print("all databases:", client.list_database_names())
print("collections in EasyLiving:", db.list_collection_names())
docs = list(db["moodlogs"].find())
print("total moodlogs no filter:", len(docs))

docs = list(db["moodlogs"].find({"userId": ObjectId("69e3e3f4f7925774adc9fe1b")}))
print("seeded docs:", len(docs))
for d in docs:
    print(d['date'])