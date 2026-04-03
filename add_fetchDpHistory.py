path = '/Users/lalith/snu/sem6/swe/lab/code_implimentaion/frontend/app/staff/dp/actions.ts'
with open(path, 'r') as f:
    content = f.read()

new_action = """
export async function fetchDpHistory() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return [];

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const res = await fetch(`${API_URL}/api/delivery/person/history`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    return [];
  }
  return res.json();
}
"""

if 'fetchDpHistory' not in content:
    with open(path, 'a') as f:
        f.write(new_action)
    print("Added fetchDpHistory action.")
