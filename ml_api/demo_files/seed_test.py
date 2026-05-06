from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from bson import ObjectId
import os

load_dotenv(override=True)
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client["EasyLiving"]

test_user_id = ObjectId("69e3e3f4f7925774adc9fe1b")

# Step 1: Delete existing logs for this user
db["moodlogs"].delete_many({"userId": test_user_id})
db["expenselogs"].delete_many({"userId": test_user_id})
db["activitylogs"].delete_many({"userId": test_user_id})
print("✅ Deleted existing logs")

# Step 2: Seed 7 days of normal data
normal_days = [
    (7.0, 4.0, 30.0, 100.0, 200.0, 50.0, 0.0,  80.0),
    (6.5, 3.5, 25.0, 90.0,  180.0, 45.0, 10.0, 90.0),
    (7.5, 4.5, 35.0, 110.0, 220.0, 55.0, 0.0,  95.0),
    (6.8, 4.0, 28.0, 95.0,  195.0, 50.0, 15.0, 85.0),
    (7.2, 3.8, 32.0, 100.0, 210.0, 48.0, 0.0,  100.0),
    (6.0, 4.2, 20.0, 80.0,  175.0, 52.0, 5.0,  90.0),
    (7.0, 3.5, 30.0, 105.0, 200.0, 50.0, 0.0,  88.0),
]
# (sleep, screen, exercise, caffeine, food, transport, medical, personal)

for i, (sleep, screen, exercise, caffeine, food, transport, medical, personal) in enumerate(normal_days):
    date = datetime.now(timezone.utc) - timedelta(days=7 - i)
    db["moodlogs"].insert_one({
        "userId": test_user_id,
        "sleepHours": sleep,
        "screenTimeHours": screen,
        "exerciseMinutes": exercise,
        "caffeineMg": caffeine,
        "date": date
    })
    db["expenselogs"].insert_one({
        "userId": test_user_id,
        "food": food,
        "transport": transport,
        "medical": medical,
        "personal": personal,
        "date": date
    })

print("✅ Seeded 7 days of normal data")

# Step 3: Insert today's extreme expense
today = datetime.now(timezone.utc)
db["expenselogs"].insert_one({
    "userId": test_user_id,
    "food": 8000.0,      # normally ~200
    "transport": 3500.0, # normally ~50
    "medical": 2000.0,   # normally ~5
    "personal": 5000.0,  # normally ~90
    "date": today
})

print("✅ Inserted extreme expense for today")
print("🚀 Ready! Hit /detect/anomaly with:")
print(f'   user_id: 69e3e3f4f7925774adc9fe1b')
print(f'   date: {today.strftime("%Y-%m-%d")}')