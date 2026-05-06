import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def preprocess_mood_input(data):
    """
    Convert the input dictionary to numpy array for model prediction.
    """
    return np.array([[
        data.sleepHours,
        data.screenTimeHours,
        data.exerciseMinutes,
        data.caffeineMg
    ]])
def prepare_expense_input(payload: dict):
    """
    Return DataFrame with column used by model: avg7_total
    payload may contain 'avg7_total' or 'recent_expenses' (list).
    """
    if payload.get("avg7_total") is not None:
        avg7 = float(payload["avg7_total"])
    else:
        rec = payload.get("recent_expenses", [])
        if not rec:
            raise ValueError("Provide recent_expenses (list) or avg7_total (float).")
        rec = [float(x) for x in rec]
        avg7 = float(np.mean(rec))
    return pd.DataFrame({"avg7_total": [avg7]})

def get_last_n_days_dates(n=7):
    """
    Returns a list of the last n date strings in "YYYY-MM-DD" format.
    Today inclusive.

    Args:
        n: Number of days to include (default: 7)

    Returns:
        List of date strings in YYYY-MM-DD format
    """
    dates = []
    today = datetime.now()
    for i in range(n):
        date = today - timedelta(days=i)
        dates.append(date.strftime("%Y-%m-%d"))
    return dates


def fetch_mood_logs(db, user_id, dates):
    """
    Query the mood_logs collection for a specific user and dates.

    Args:
        db: MongoDB database object
        user_id: User ID to filter by
        dates: List of date strings in YYYY-MM-DD format

    Returns:
        List of mood log documents
    """
    from bson import ObjectId
    start = datetime.now() - timedelta(days=8)
    query = {
        "userId": ObjectId(user_id),
        "date": {"$gte": start}
    }
    print("query:", query)
    result = list(db["moodlogs"].find(query))
    print("raw result count:", len(result))
    return result


def fetch_expense_logs(db, user_id, dates):
    """
    Query the expense_logs collection for a specific user and dates.

    Args:
        db: MongoDB database object
        user_id: User ID to filter by
        dates: List of date strings in YYYY-MM-DD format

    Returns:
        List of expense log documents
    """
    from bson import ObjectId
    start = datetime.now() - timedelta(days=8)
    return list(db["expenselogs"].find({
        "userId": ObjectId(user_id),
        "date": {"$gte": start}
    }))


def fetch_activity_logs(db, user_id, dates):
    """
    Query the activity_logs collection for a specific user and dates.

    Args:
        db: MongoDB database object
        user_id: User ID to filter by
        dates: List of date strings in YYYY-MM-DD format

    Returns:
        List of activity log documents
    """
    from bson import ObjectId
    start = datetime.now() - timedelta(days=8)
    return list(db["activitylogs"].find({
        "userId": ObjectId(user_id),
        "date": {"$gte": start}
    }))