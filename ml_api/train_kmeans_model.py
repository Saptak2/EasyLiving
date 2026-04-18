import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import joblib

# Load data
df = pd.read_csv("data/kmeans_training.csv")

df["expense"] = df["expense"] / 1000

df["sleep_n"] = df["sleep"] / 8
df["screen_n"] = 1 - (df["screen"] / 12)
df["exercise_n"] = df["exercise"] / 45
df["expense_n"] = 1 - (df["expense"] / 50000)
df["activity_n"] = df["activity_count"] / 5

# 🔥 CREATE LIFESTYLE SCORE
df["lifestyle_score"] = (
    0.3 * df["sleep_n"] +
    0.2 * df["exercise_n"] +
    0.2 * df["activity_n"] +
    0.15 * df["screen_n"] +
    0.15 * df["expense_n"]
)

# 🔥 USE ONLY SCORE
X = df[["lifestyle_score"]]

# Scale
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)



# Train model
kmeans = KMeans(n_clusters=3, random_state=42)
kmeans.fit(X_scaled)

# Print cluster centers (original scale)
centers = scaler.inverse_transform(kmeans.cluster_centers_)

print("\nCluster Centers (original values):")
print(centers)

# Save
joblib.dump(kmeans, "models/kmeans_model.pkl")
joblib.dump(scaler, "models/kmeans_scaler.pkl")

print("✅ Model trained successfully")