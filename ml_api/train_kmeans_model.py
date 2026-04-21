import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import joblib

# Load data
df = pd.read_csv("data/kmeans_training.csv")

# ✅ SCALE EXPENSE (IMPORTANT - avoid dominance)
df["expense"] = df["expense"] / 1000

# ✅ SELECT REAL FEATURES (NO SCORE)
X = df[["sleep", "screen", "exercise", "expense", "activity_duration"]]

# ✅ SCALE FEATURES
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ✅ TRAIN MODEL
kmeans = KMeans(n_clusters=3, random_state=42,n_init=10)
kmeans.fit(X_scaled)

# ✅ PRINT CLUSTER CENTERS (ORIGINAL SCALE)
centers = scaler.inverse_transform(kmeans.cluster_centers_)

print("\nCluster Centers (original values):")
print(pd.DataFrame(centers, columns=X.columns))

print("\nCluster meaning hint:")
for i, row in enumerate(centers):
    print(f"Cluster {i} →", row)

# ✅ SAVE MODEL
joblib.dump(kmeans, "models/kmeans_model.pkl")
joblib.dump(scaler, "models/kmeans_scaler.pkl")

print("✅ Model trained successfully")