import urllib.request
import json

SUPABASE_URL = 'https://mzjefpsizovmqalybzap.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16amVmcHNpem92bXFhbHliemFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjY3NzksImV4cCI6MjA5NTQwMjc3OX0.wfCp-L6z5NnWvbS79IXfNWH5fBGn1RBLYpu9CCTUrDw'

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
}

def check_recetas_schema():
    url = f"{SUPABASE_URL}/rest/v1/recetas?select=*&limit=1"
    req = urllib.request.Request(url, headers=headers, method='GET')
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if len(data) > 0:
                print("Columns in 'recetas':")
                for key in data[0].keys():
                    print(f"- {key}")
            else:
                print("No recipes found to check schema.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_recetas_schema()
