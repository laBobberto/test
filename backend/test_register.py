import requests
import json

BASE_URL = "http://localhost:8000"

# Register
register_data = {
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpass123",
    "roles": ["student"]
}

print("Sending registration request...")
print(f"Data: {json.dumps(register_data, indent=2)}")

try:
    response = requests.post(
        f"{BASE_URL}/api/auth/register", 
        json=register_data,
        headers={"Content-Type": "application/json"}
    )
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("\nSuccess! User created.")
        user_data = response.json()
        print(f"User ID: {user_data['id']}")
        print(f"Username: {user_data['username']}")
        print(f"Email: {user_data['email']}")
except Exception as e:
    print(f"\nError: {e}")
    import traceback
    traceback.print_exc()
