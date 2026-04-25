import requests
import json

BASE_URL = "http://localhost:8000"

# Create test user
def create_test_user():
    print("Creating test user...")
    
    # Register
    register_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpass123",
        "roles": ["student", "resident"]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
        print(f"Register response: {response.status_code}")
        if response.status_code == 200:
            print(f"User created: {response.json()}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Register error: {e}")
    
    # Login
    login_data = {
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        print(f"Login response: {response.status_code}")
        if response.status_code == 200:
            token_data = response.json()
            print(f"Token: {token_data['access_token']}")
            
            # Save token for tests
            with open('test-token.txt', 'w') as f:
                f.write(token_data['access_token'])
            
            return token_data['access_token']
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Login error: {e}")
    
    return None

# Set priorities
def set_priorities(token):
    print("\nSetting priorities...")
    
    priorities = [
        {"category": "education", "value": 25},
        {"category": "career", "value": 20},
        {"category": "health", "value": 20},
        {"category": "leisure", "value": 15},
        {"category": "social", "value": 10},
        {"category": "household", "value": 10}
    ]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.put(f"{BASE_URL}/api/user/priorities", json=priorities, headers=headers)
        print(f"Priorities response: {response.status_code}")
        if response.status_code == 200:
            print(f"Priorities set: {response.json()}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Priorities error: {e}")

if __name__ == "__main__":
    token = create_test_user()
    if token:
        set_priorities(token)
        print("\nTest user created successfully!")
        print(f"Email: test@example.com")
        print(f"Password: testpass123")
        print(f"Token saved to: test-token.txt")
    else:
        print("\nFailed to create test user")
