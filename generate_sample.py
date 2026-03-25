"""
Generate a realistic sample CDR (Call Detail Records) dataset for TelForensics AI
Run: python generate_sample.py
"""
import pandas as pd
import random
from datetime import datetime, timedelta

random.seed(42)

# Phone numbers — some suspicious, some normal
NUMBERS = {
    "suspicious": [
        "+91-98765-43210",  # High-risk hub
        "+91-11223-34455",  # Night caller
        "+91-55667-78899",  # Burst caller
    ],
    "normal": [
        "+91-90123-45678", "+91-80234-56789", "+91-70345-67890",
        "+91-60456-78901", "+91-50567-89012", "+91-40678-90123",
        "+91-30789-01234", "+91-20890-12345", "+91-10901-23456",
        "+91-99012-34567", "+91-88123-45678", "+91-77234-56789",
        "+91-66345-67890", "+91-55456-78901", "+91-44567-89012",
    ],
    "unknown": [
        "+44-7911-123456",  # UK
        "+1-555-0101",      # US
        "+86-138-0013-8000",# China
        "+971-50-123-4567", # UAE
    ]
}

ALL_NUMBERS = NUMBERS["suspicious"] + NUMBERS["normal"] + NUMBERS["unknown"]

records = []
base_date = datetime(2024, 10, 1)

def random_duration():
    return random.randint(5, 1200)  # 5s to 20min

def random_datetime(suspicious=False, burst=False):
    day_offset = random.randint(0, 89)  # 3 months
    dt = base_date + timedelta(days=day_offset)
    if suspicious:
        # Late night: 1AM - 5AM
        hour = random.choice([1, 2, 2, 3, 3, 4, 4, 5])
    elif burst:
        # Same hour, burst pattern
        hour = random.choice([14, 15, 22, 23])
    else:
        hour = random.randint(8, 22)
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    return dt.replace(hour=hour, minute=minute, second=second)

# Generate normal records
for _ in range(400):
    a, b = random.sample(NUMBERS["normal"] + NUMBERS["suspicious"], 2)
    records.append({
        "caller_number": a,
        "receiver_number": b,
        "call_datetime": random_datetime(),
        "duration_seconds": random_duration(),
        "call_type": random.choice(["Voice", "Voice", "Voice", "SMS"]),
        "tower_location": random.choice(["Hyderabad-Central", "Hyderabad-West", "Secunderabad", "Cyberabad", "LB Nagar"]),
        "imei": f"35{random.randint(100000000000000, 999999999999999)}",
    })

# Suspicious number 1: +91-98765-43210 — Night calls, many unknowns, hub
for _ in range(120):
    receiver = random.choice(NUMBERS["unknown"] + NUMBERS["normal"] + NUMBERS["normal"])
    records.append({
        "caller_number": "+91-98765-43210",
        "receiver_number": receiver,
        "call_datetime": random_datetime(suspicious=True),
        "duration_seconds": random.randint(5, 180),
        "call_type": "Voice",
        "tower_location": random.choice(["Hyderabad-Central", "Secunderabad", "Unknown-Tower"]),
        "imei": "351234567890123",
    })

# Suspicious number 2: +91-11223-34455 — Only late night, short calls
for _ in range(80):
    receiver = random.choice(NUMBERS["normal"] + NUMBERS["unknown"])
    records.append({
        "caller_number": "+91-11223-34455",
        "receiver_number": receiver,
        "call_datetime": random_datetime(suspicious=True),
        "duration_seconds": random.randint(5, 60),
        "call_type": random.choice(["Voice", "SMS"]),
        "tower_location": random.choice(["LB Nagar", "Unknown-Tower", "Cyberabad"]),
        "imei": "359876543210987",
    })

# Suspicious number 3: +91-55667-78899 — Burst caller
for i in range(60):
    receiver = random.choice(NUMBERS["normal"])
    records.append({
        "caller_number": "+91-55667-78899",
        "receiver_number": receiver,
        "call_datetime": random_datetime(burst=True),
        "duration_seconds": random.randint(5, 30),
        "call_type": "Voice",
        "tower_location": "Hyderabad-West",
        "imei": "354567890123456",
    })

# Some incoming calls to suspicious numbers
for _ in range(50):
    caller = random.choice(NUMBERS["normal"] + NUMBERS["unknown"])
    records.append({
        "caller_number": caller,
        "receiver_number": "+91-98765-43210",
        "call_datetime": random_datetime(),
        "duration_seconds": random_duration(),
        "call_type": "Voice",
        "tower_location": random.choice(["Hyderabad-Central", "Secunderabad"]),
        "imei": f"35{random.randint(100000000000000, 999999999999999)}",
    })

# Shuffle and create DataFrame
random.shuffle(records)
df = pd.DataFrame(records)
df["call_datetime"] = pd.to_datetime(df["call_datetime"])
df = df.sort_values("call_datetime").reset_index(drop=True)
df["call_id"] = [f"CDR{str(i+1).zfill(5)}" for i in range(len(df))]
df = df[["call_id", "caller_number", "receiver_number", "call_datetime", "duration_seconds", "call_type", "tower_location", "imei"]]

df.to_excel("sample_cdr.xlsx", index=False)
df.to_csv("sample_cdr.csv", index=False)
print(f"✅ Generated {len(df)} CDR records → sample_cdr.xlsx + sample_cdr.csv")
print(f"   Suspicious numbers: {NUMBERS['suspicious']}")
print(f"   Date range: {df['call_datetime'].min()} to {df['call_datetime'].max()}")
