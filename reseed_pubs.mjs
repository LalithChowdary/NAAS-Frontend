import fs from 'fs';

const BASE_URL = "http://localhost:8080/api";
const ADMIN_EMAIL = "admin1@naas.com";
const ADMIN_PASSWORD = "password";

const publications = [
  {
    name: "The Daily Bugle",
    type: "NEWSPAPER",
    price: 2.50,
    description: "City's top daily news source. Get the latest scoop on local events.",
    frequency: "DAILY",
    imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Tech Monthly",
    type: "MAGAZINE",
    price: 5.99,
    description: "Latest in technology, gadgets, and software development trends.",
    frequency: "MONTHLY",
    imageUrl: "https://images.unsplash.com/photo-1541560052-77ec1bbc09f7?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Financial Times",
    type: "NEWSPAPER",
    price: 3.00,
    description: "Global business and economic news you can trust.",
    frequency: "DAILY",
    imageUrl: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Vogue Trends",
    type: "MAGAZINE",
    price: 6.50,
    description: "Fashion, lifestyle, and culture from around the world.",
    frequency: "MONTHLY",
    imageUrl: "https://images.unsplash.com/photo-1533601017-dc61895e03c0?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Global Explorer",
    type: "MAGAZINE",
    price: 4.99,
    description: "Travel destinations, adventures, and breath-taking photography.",
    frequency: "MONTHLY",
    imageUrl: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Morning Chronicle",
    type: "NEWSPAPER",
    price: 1.50,
    description: "Your daily morning digest covering politics and society.",
    frequency: "DAILY",
    imageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Science Today",
    type: "MAGAZINE",
    price: 7.99,
    description: "In-depth articles on physics, biology, and space exploration.",
    frequency: "MONTHLY",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "The Sports Gazette",
    type: "NEWSPAPER",
    price: 2.00,
    description: "Comprehensive coverage of local and international sports.",
    frequency: "WEEKLY",
    imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Home & Garden",
    type: "MAGAZINE",
    price: 5.50,
    description: "Tips and tricks for interior design and landscaping.",
    frequency: "MONTHLY",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Culinary Delights",
    type: "MAGAZINE",
    price: 6.99,
    description: "Recipes, restaurant reviews, and top chef interviews.",
    frequency: "WEEKLY",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "The Evening Post",
    type: "NEWSPAPER",
    price: 1.75,
    description: "Evening edition covering the day's most important events.",
    frequency: "DAILY",
    imageUrl: "https://images.unsplash.com/photo-1504711331083-9c8959412227?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Automotive Weekly",
    type: "MAGAZINE",
    price: 8.50,
    description: "Car reviews, industry news, and classic auto showcases.",
    frequency: "WEEKLY",
    imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80",
  }
];

async function main() {
  console.log("Initiating login...");

  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!loginRes.ok) {
    console.error("Login failed!", await loginRes.text());
    return;
  }

  const { token } = await loginRes.json();

  console.log("Logged in successfully. Fetching existing publications...");

  // Get existing
  const existingRes = await fetch(`${BASE_URL}/admin/publications`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  
  if (!existingRes.ok) {
    console.error("Failed to get list:", await existingRes.text());
  }

  // Assuming /publications or /admin/publications returns the list
  // The service returns a list. If standard GET returns list:
  const text = await existingRes.text();
  const existingPubs = JSON.parse(text);

  let successCount = 0;
  for (const pub of publications) {
    const existing = existingPubs.find(p => p.name === pub.name);
    
    let url = `${BASE_URL}/admin/publications`;
    let method = "POST";
    
    if (existing) {
      url = `${BASE_URL}/admin/publications/${existing.id}`;
      method = "PUT";
    }

    const pubRes = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(pub)
    });

    if (pubRes.ok) {
      console.log(`✅ Successfully ${method === "PUT" ? "updated" : "added"} '${pub.name}'`);
      successCount++;
    } else {
      console.error(`❌ Failed to process '${pub.name}':`, await pubRes.text());
    }
  }
}

main().catch(console.error);
