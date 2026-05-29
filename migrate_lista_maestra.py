import urllib.request
import json
import re

SUPABASE_URL = 'https://mzjefpsizovmqalybzap.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16amVmcHNpem92bXFhbHliemFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjY3NzksImV4cCI6MjA5NTQwMjc3OX0.wfCp-L6z5NnWvbS79IXfNWH5fBGn1RBLYpu9CCTUrDw'


headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def parse_markdown(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    categories = re.split(r'- \*\*(.*?)\*\*', content)
    insumos = []
    
    # categories[0] is the header "# Lista maestra..."
    for i in range(1, len(categories), 2):
        cat_name = categories[i].strip()
        items_str = categories[i+1].strip()
        
        # Mapping categories to system categories
        system_cat = 'otros'
        if cat_name == 'FARIANCEOS': system_cat = 'abarrotes' # Mix, but mostly abarrotes
        elif cat_name == 'PROTEÍNAS': system_cat = 'carnes'
        elif cat_name == 'GRASAS': system_cat = 'otros'
        elif cat_name == 'VEGETALES/FRUTAS': system_cat = 'vegetales'
        elif cat_name == 'ABARROTES/VARIOS': system_cat = 'abarrotes'

        items = [item.strip() for item in items_str.split(',') if item.strip()]
        for item in items:
            # Special refinements for FARIANCEOS
            final_cat = system_cat
            if item.lower() in ['patatas', 'platano maduro']:
                final_cat = 'vegetales'
            
            # Special refinements for PROTEÍNAS
            if item.lower() in ['leche', 'crema dulce', 'leche en polvo pinito', 'queso crema', 'natilla']:
                final_cat = 'lacteos'

            insumos.append({
                "nombre": item,
                "categoria": final_cat,
                "proveedor": "POR DEFINIR",
                "unidad": "kilo" if final_cat != 'lacteos' and final_cat != 'otros' else "litro",
                "precio_costo": 0,
                "kcal": 0,
                "carbs": 0,
                "protein": 0,
                "fat": 0,
                "sodium": 0
            })
    return insumos

def migrate():
    insumos = parse_markdown('Proyectos/prototipos/lingote-control-center/lista_maestra.md')
    print(f"Parsed {len(insumos)} insumos from markdown.")
    
    url = f"{SUPABASE_URL}/rest/v1/insumos"
    data = json.dumps(insumos).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status in [200, 201, 204]:
                print("✅ Migration successful!")
            else:
                print(f"❌ Error during migration: {response.status}")
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error: {e.code}")
        print(e.read().decode())
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    migrate()
