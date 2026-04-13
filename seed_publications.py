import requests
import json

BASE_URL = "http://localhost:8080/api"
ADMIN_EMAIL = "admin1@naas.com"
ADMIN_PASSWORD = "password"

publications = [
    {
        "name": "The Daily Bugle",
        "type": "NEWSPAPER",
        "price": 2.50,
        "description": "City's top daily news source.",
        "imageUrl": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80"
    },
    {
        "name": "Tech Monthly",
        "type": "MAGAZINE",
        "price": 5.99,
        "description": "Latest in technology and gadgets.",
        "imageUrl": "https://images.unsplash.com/photo-1541560052-77ec1bbc09f7?auto=format&fit=crop&w=400&q=80"
    },
    {
        "name": "Financial Times",
        "type": "NEWSPAPER",
        "price": 3.00,
        "description": "Global business and economic news.",
        "imageUrl": "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=400&q=80"
    },
    {
        "name": "Vogue Trends",
        "type": "MAGAZINE",
        "price": 6.50,
        "description": "Fashion, lifestyle, and culture.",
        "imageUrl": "https://images.unsplash.com/photo-1533601017-dc61895e03c0?auto=format&fit=crop&w=400&q=80"
    },
    {
        "name": "Global Explorer",
        "type": "MAGAZINE",
        "price": 4.99,
        "description": "Travel destinations and adventures.",
        "imageUrl": "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=400&q=80"
    },
    {
        "name": "Morning Chronicle",
        "type": "NEWSPAPER",
        "price": 1.50,
        "description": "Local news and community updates.",
        "imageUrl": "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80"
    }
]

def main():
    print("Initiating login...")
    session = requests.Session()
    
    # Login
    login_url = f"{BASE_URL}/auth/login"
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    response = session.post(login_url, json=login_data)
    
    if response.status_code != 200:
        print(f"Login failed! Status code: {response.status_code}")
        print(response.text)
        return
        
    token = response.json().get('token')
    if not token:
        print("Login failed, no token received.")
        return
        
    print("Logged in successfully. Injecting publications...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    success_count = 0
    for pub in publications:
        pub_url = f"{BASE_URL}/admin/publications"
        res = session.post(pub_url, json=pub, headers=headers)
        if res.status_code in [200, 201]:
            print(f"✅ Successfully added '{pub['name']}'")
            success_count += 1
        else:
            print(f"❌ Failed to add '{pub['name']}': {res.text}")
            
    print(f"\nDone! Successfully injected {success_count}/{len(publications)} publications.")

if __name__ == '__main__':
    main()