import urllib.request
import json

SUPABASE_URL = 'https://mzjefpsizovmqalybzap.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16amVmcHNpem92bXFhbHliemFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjY3NzksImV4cCI6MjA5NTQwMjc3OX0.wfCp-L6z5NnWvbS79IXfNWH5fBGn1RBLYpu9CCTUrDw'

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Valores estándar por 100g (Aproximados para propósitos de prototipo)
NUTRI_DATA = {
    "patatas": {"kcal": 77, "carbs": 17, "protein": 2, "fat": 0.1, "sodium": 6},
    "huevos": {"kcal": 155, "carbs": 1.1, "protein": 13, "fat": 11, "sodium": 124},
    "leche": {"kcal": 42, "carbs": 5, "protein": 3.4, "fat": 1, "sodium": 44},
    "crema dulce": {"kcal": 340, "carbs": 3, "protein": 2, "fat": 35, "sodium": 40},
    "posta de cerdo": {"kcal": 242, "carbs": 0, "protein": 27, "fat": 14, "sodium": 60},
    "aceite de oliva": {"kcal": 884, "carbs": 0, "protein": 0, "fat": 100, "sodium": 2},
    "aceite de girasol": {"kcal": 884, "carbs": 0, "protein": 0, "fat": 100, "sodium": 2},
    "pan blanco artesanal": {"kcal": 265, "carbs": 49, "protein": 9, "fat": 3, "sodium": 490},
    "arroz": {"kcal": 130, "carbs": 28, "protein": 2.7, "fat": 0.3, "sodium": 1},
    "frijoles negros": {"kcal": 341, "carbs": 62, "protein": 21, "fat": 1.4, "sodium": 5},
    "aguacate hass": {"kcal": 160, "carbs": 9, "protein": 2, "fat": 15, "sodium": 7},
    "tomate": {"kcal": 18, "carbs": 3.9, "protein": 0.9, "fat": 0.2, "sodium": 5},
    "cebollas": {"kcal": 40, "carbs": 9, "protein": 1.1, "fat": 0.1, "sodium": 4},
    "queso crema": {"kcal": 342, "carbs": 4, "protein": 6, "fat": 34, "sodium": 320},
    "natilla": {"kcal": 200, "carbs": 4, "protein": 3, "fat": 20, "sodium": 50},
    "azúcar": {"kcal": 387, "carbs": 100, "protein": 0, "fat": 0, "sodium": 1},
    "mahonesa hellmann's": {"kcal": 680, "carbs": 1, "protein": 1, "fat": 75, "sodium": 640},
}

def enrich_nutri():
    # 1. Obtener todos los insumos
    url = f"{SUPABASE_URL}/rest/v1/insumos?select=id,nombre"
    req = urllib.request.Request(url, headers=headers, method='GET')
    
    try:
        with urllib.request.urlopen(req) as response:
            insumos = json.loads(response.read().decode())
            print(f"Buscando coincidencias para {len(insumos)} insumos...")
            
            updates = 0
            for insumo in insumos:
                nombre_clean = insumo['nombre'].lower().strip()
                match = None
                
                # Búsqueda de coincidencia simple
                for key in NUTRI_DATA:
                    if key in nombre_clean:
                        match = NUTRI_DATA[key]
                        break
                
                if match:
                    # 2. Actualizar el insumo en Supabase
                    update_url = f"{SUPABASE_URL}/rest/v1/insumos?id=eq.{insumo['id']}"
                    update_data = json.dumps(match).encode('utf-8')
                    update_req = urllib.request.Request(update_url, data=update_data, headers=headers, method='PATCH')
                    
                    with urllib.request.urlopen(update_req) as up_res:
                        if up_res.status in [200, 204]:
                            print(f"✅ Enriquecido: {insumo['nombre']}")
                            updates += 1
            
            print(f"\nProceso finalizado. Se actualizaron {updates} ingredientes.")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    enrich_nutri()
