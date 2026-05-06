import numpy as np
from sklearn.ensemble import IsolationForest


def aggregate_daily_features(mood_logs, expense_logs, activity_logs, date_str):
    """
    Aggregate daily features from mood, expense, and activity logs for a specific date.

    Args:
        mood_logs: List of MongoDB documents for mood logs
        expense_logs: List of MongoDB documents for expense logs
        activity_logs: List of MongoDB documents for activity logs
        date_str: Date string in YYYY-MM-DD format

    Returns:
        List of 11 floats representing the feature vector for that day
    """
    # Filter logs for the specific date
    day_mood_logs = [log for log in mood_logs 
                 if log.get('date').strftime('%Y-%m-%d') == date_str]
    day_expense_logs = [log for log in expense_logs 
                    if log.get('date').strftime('%Y-%m-%d') == date_str]
    day_activity_logs = [log for log in activity_logs 
                     if log.get('date').strftime('%Y-%m-%d') == date_str]

    # Initialize features with 0 (missing values)
    sleep_hours = 0.0
    screen_time = 0.0
    exercise_duration = 0.0
    caffeine_intake = 0
    total_expense = 0.0
    food_expense = 0.0
    transport_expense = 0.0
    medical_expense = 0.0
    personal_expense = 0.0
    total_activity_duration = 0.0
    avg_mood_score = 0.0

    # Extract mood log features
    if day_mood_logs:
        mood_log = day_mood_logs[0]
        sleep_hours = float(mood_log.get('sleepHours', 0))
        screen_time = float(mood_log.get('screenTimeHours', 0))
        exercise_duration = float(mood_log.get('exerciseMinutes', 0))
        caffeine_intake = float(mood_log.get('caffeineMg', 0))

    # Extract expense log features
    if day_expense_logs:
        expense = day_expense_logs[0]
        food_expense = float(expense.get('foodExpense', 0))
        transport_expense = float(expense.get('transportExpense', 0))
        medical_expense = float(expense.get('medicalExpense', 0))
        personal_expense = float(expense.get('personalExpense', 0))
        total_expense = food_expense + transport_expense + medical_expense + personal_expense

    # Extract activity log features
    if day_activity_logs:
        mood_scores = []
        for activity in day_activity_logs:
            duration = float(activity.get('durationMinutes', 0))
            total_activity_duration += duration
            score = activity.get('moodScore')
            if score is not None:
                mood_scores.append(float(score))
        if mood_scores:
            avg_mood_score = sum(mood_scores) / len(mood_scores)

    return [
        sleep_hours,
        screen_time,
        exercise_duration,
        float(caffeine_intake),
        total_expense,
        food_expense,
        transport_expense,
        medical_expense,
        personal_expense,
        total_activity_duration,
        avg_mood_score
    ]


def build_history_matrix(mood_logs, expense_logs, activity_logs, dates):
    """
    Build a 2D numpy array of historical feature vectors for multiple dates.

    Args:
        mood_logs: List of MongoDB documents for mood logs
        expense_logs: List of MongoDB documents for expense logs
        activity_logs: List of MongoDB documents for activity logs
        dates: List of date strings in YYYY-MM-DD format

    Returns:
        2D numpy array of shape (n_days, 11) containing feature vectors
    """
    history_matrix = []
    for date_str in dates:
        features = aggregate_daily_features(mood_logs, expense_logs, activity_logs, date_str)
        history_matrix.append(features)
    return np.array(history_matrix)


def detect_anomaly(history_matrix, today_vector):
    """
    Detect anomalies using Isolation Forest.

    Args:
        history_matrix: 2D numpy array of historical data (n_days x 11)
        today_vector: List of 11 floats representing today's features

    Returns:
        Dictionary with anomaly detection results
    """
    days_used = len(history_matrix)

    # Check for insufficient data
    if days_used < 4:
        return {
            "anomaly": False,
            "reason": "insufficient_data",
            "anomaly_score": None,
            "days_used": days_used
        }

    # Train Isolation Forest
    model = IsolationForest(
        contamination=0.05,
        n_estimators=100,
        random_state=42
    )
    model.fit(history_matrix)

    # Predict on today's data
    today_array = np.array(today_vector).reshape(1, -1)
    prediction = model.predict(today_array)[0]
    anomaly_score = round(float(model.decision_function(today_array)[0]), 4)

    is_anomaly = bool(prediction == -1)
    reasons = []

    if is_anomaly:
        FEATURE_NAMES = [
            "sleep_hours", "screen_time", "exercise_duration", "caffeine_intake",
            "total_expense", "food_expense", "transport_expense", "medical_expense",
            "personal_expense", "total_activity_duration", "avg_mood_score"
        ]
        FEATURE_REASONS = {
            "sleep_hours":           {"low": "Sleep hours significantly lower than usual", "high": "Sleep hours significantly higher than usual"},
            "screen_time":           {"low": "Screen time significantly lower than usual", "high": "Screen time significantly higher than usual"},
            "exercise_duration":     {"low": "Exercise duration significantly lower than usual", "high": "Exercise duration significantly higher than usual"},
            "caffeine_intake":       {"low": "Caffeine intake unusually low", "high": "Caffeine intake unusually high"},
            "total_expense":         {"low": "Total spending unusually low", "high": "Total spending significantly higher than usual"},
            "food_expense":          {"low": "Food expenses unusually low", "high": "Food expenses unusually high"},
            "transport_expense":     {"low": "Transport expenses unusually low", "high": "Transport expenses unusually high"},
            "medical_expense":       {"low": "No medical expenses (unusual)", "high": "Unusual medical expenses detected"},
            "personal_expense":      {"low": "Personal expenses unusually low", "high": "Personal expenses unusually high"},
            "total_activity_duration": {"low": "Activity duration significantly lower than usual", "high": "Activity duration significantly higher than usual"},
            "avg_mood_score":        {"low": "Mood score significantly lower than usual", "high": "Mood score significantly higher than usual"},
        }

        history_mean = np.mean(history_matrix, axis=0)
        deviations = today_array[0] - history_mean
        abs_deviations = np.abs(deviations)
        top_indices = np.argsort(abs_deviations)[::-1][:3]

        for idx in top_indices:
            if abs_deviations[idx] > 0.5:
                direction = "high" if deviations[idx] > 0 else "low"
                reasons.append(FEATURE_REASONS[FEATURE_NAMES[idx]][direction])

    return {
        "anomaly": is_anomaly,
        "anomaly_score": anomaly_score,
        "days_used": days_used,
        "reasons": reasons
    }