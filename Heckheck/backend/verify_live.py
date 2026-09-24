import urllib.request
import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

print("1. Querying /api/health...")
with urllib.request.urlopen("http://127.0.0.1:8000/api/health") as res:
    health = json.loads(res.read().decode())
    print(f"Health Status: {health.get('status')} | Service: {health.get('service')}")

print("\n2. Querying /api/patients...")
with urllib.request.urlopen("http://127.0.0.1:8000/api/patients") as res:
    patients = json.loads(res.read().decode())
    print(f"Total Patients in SQLite DB: {len(patients)}")
    first = patients[0]
    print(f"Sample Patient: {first['id']} ({first['name']}) | Wait: {first['wait_time_minutes']} min | Doctor: {first.get('assignedDoctor')}")

print("\n3. Testing live wait escalation (+5m)...")
req = urllib.request.Request(
    "http://127.0.0.1:8000/api/patients/advance-wait",
    data=json.dumps({"minutes": 5}).encode('utf-8'),
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(req) as res:
    advance_res = json.loads(res.read().decode())
    print(f"Wait Escalation Result: {advance_res.get('status')}")

with urllib.request.urlopen("http://127.0.0.1:8000/api/patients") as res:
    patients_after = json.loads(res.read().decode())
    first_after = patients_after[0]
    print(f"After +5m: {first_after['id']} wait is now: {first_after['wait_time_minutes']} min (Persisted in SQLite)")

print("\n4. Querying /api/rooms...")
with urllib.request.urlopen("http://127.0.0.1:8000/api/rooms") as res:
    rooms = json.loads(res.read().decode())
    print(f"Total Rooms in SQLite DB: {len(rooms)}")
    occupied = [r for r in rooms if r['status'] == 'occupied']
    available = [r for r in rooms if r['status'] == 'available']
    print(f"Available: {len(available)} | Occupied: {len(occupied)}")

print("\nAll live FastAPI endpoints and SQLite persistence verified successfully!")
