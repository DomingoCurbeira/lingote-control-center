import urllib.request
import json

SUPABASE_URL = 'https://mzjefpsizovmqalybzap.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16amVmcHNpem92mXFhbHliemFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjY3NzksImV4cCI6MjA5NTQwMjc3OX0.wfCp-L6z5NnWvbS79IXfNWH5fBGn1RBLYpu9CCTUrDw'

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def test_insert():
    insumo = {
        "nombre": "TEST_ITEM",
        "categoria": "vegetales",
        "proveedor": "TEST",
        "unidad": "kilo",
        "precio_costo": 100
    }
    
    url = f"{SUPABASE_URL}/rest/v1/insumos"
    data = json.dumps(insumo).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status: {response.status}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(e.read().decode())

if __name__ == "__main__":
    test_insert()
