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

# Valores estándar por 100g (ENRIQUECIMIENTO TOTAL)
NUTRI_DATA = {
    "patatas": {"kcal": 77, "carbs": 17, "protein": 2, "fat": 0.1, "sodium": 6, "azucares": 0.8, "fibra": 2.2, "saturadas": 0.03, "trans": 0, "colesterol": 0},
    "huevos": {"kcal": 155, "carbs": 1.1, "protein": 13, "fat": 11, "sodium": 124, "azucares": 1.1, "fibra": 0, "saturadas": 3.3, "trans": 0, "colesterol": 372},
    "leche": {"kcal": 42, "carbs": 5, "protein": 3.4, "fat": 1, "sodium": 44, "azucares": 5, "fibra": 0, "saturadas": 0.6, "trans": 0, "colesterol": 5},
    "crema dulce": {"kcal": 340, "carbs": 3, "protein": 2, "fat": 35, "sodium": 40, "azucares": 3, "fibra": 0, "saturadas": 23, "trans": 0, "colesterol": 110},
    "posta de cerdo": {"kcal": 242, "carbs": 0, "protein": 27, "fat": 14, "sodium": 60, "azucares": 0, "fibra": 0, "saturadas": 5, "trans": 0, "colesterol": 80},
    "aceite de oliva": {"kcal": 884, "carbs": 0, "protein": 0, "fat": 100, "sodium": 2, "azucares": 0, "fibra": 0, "saturadas": 14, "trans": 0, "colesterol": 0},
    "aceite de girasol": {"kcal": 884, "carbs": 0, "protein": 0, "fat": 100, "sodium": 2, "azucares": 0, "fibra": 0, "saturadas": 10, "trans": 0, "colesterol": 0},
    "pan blanco artesanal": {"kcal": 265, "carbs": 49, "protein": 9, "fat": 3, "sodium": 490, "azucares": 5, "fibra": 2.7, "saturadas": 0.7, "trans": 0, "colesterol": 0},
    "arroz": {"kcal": 130, "carbs": 28, "protein": 2.7, "fat": 0.3, "sodium": 1, "azucares": 0.1, "fibra": 0.4, "saturadas": 0.1, "trans": 0, "colesterol": 0},
    "frijoles negros": {"kcal": 341, "carbs": 62, "protein": 21, "fat": 1.4, "sodium": 5, "azucares": 2.1, "fibra": 15.2, "saturadas": 0.4, "trans": 0, "colesterol": 0},
    "aguacate hass": {"kcal": 160, "carbs": 9, "protein": 2, "fat": 15, "sodium": 7, "azucares": 0.7, "fibra": 7, "saturadas": 2.1, "trans": 0, "colesterol": 0},
    "tomate": {"kcal": 18, "carbs": 3.9, "protein": 0.9, "fat": 0.2, "sodium": 5, "azucares": 2.6, "fibra": 1.2, "saturadas": 0, "trans": 0, "colesterol": 0},
    "cebollas": {"kcal": 40, "carbs": 9, "protein": 1.1, "fat": 0.1, "sodium": 4, "azucares": 4.2, "fibra": 1.7, "saturadas": 0, "trans": 0, "colesterol": 0},
    "queso crema": {"kcal": 342, "carbs": 4, "protein": 6, "fat": 34, "sodium": 320, "azucares": 3.2, "fibra": 0, "saturadas": 20, "trans": 0, "colesterol": 110},
    "natilla": {"kcal": 200, "carbs": 4, "protein": 3, "fat": 20, "sodium": 50, "azucares": 4, "fibra": 0, "saturadas": 12, "trans": 0, "colesterol": 60},
    "azúcar": {"kcal": 387, "carbs": 100, "protein": 0, "fat": 0, "sodium": 1, "azucares": 100, "fibra": 0, "saturadas": 0, "trans": 0, "colesterol": 0},
    "mahonesa hellmann's": {"kcal": 680, "carbs": 1, "protein": 1, "fat": 75, "sodium": 640, "azucares": 1, "fibra": 0, "saturadas": 12, "trans": 0, "colesterol": 40},
    "leche condensada": {"kcal": 322, "carbs": 54, "protein": 7.9, "fat": 8.7, "sodium": 127, "azucares": 54, "fibra": 0, "saturadas": 5.5, "trans": 0, "colesterol": 34},
    "leche evaporada": {"kcal": 134, "carbs": 10, "protein": 6.8, "fat": 7.6, "sodium": 106, "azucares": 10, "fibra": 0, "saturadas": 4.6, "trans": 0, "colesterol": 29},
    "leche pinito": {"kcal": 496, "carbs": 38, "protein": 26, "fat": 26, "sodium": 371, "azucares": 38, "fibra": 0, "saturadas": 16, "trans": 0, "colesterol": 97},
    "dulce de leche": {"kcal": 315, "carbs": 55, "protein": 6, "fat": 7, "sodium": 129, "azucares": 50, "fibra": 0, "saturadas": 4, "trans": 0, "colesterol": 25},
    "helado de vainilla": {"kcal": 207, "carbs": 24, "protein": 3.5, "fat": 11, "sodium": 80, "azucares": 21, "fibra": 0.7, "saturadas": 6.8, "trans": 0, "colesterol": 44},
    "donas": {"kcal": 452, "carbs": 51, "protein": 4.9, "fat": 25, "sodium": 326, "azucares": 27, "fibra": 2.2, "saturadas": 12, "trans": 0.3, "colesterol": 0},
    "platano maduro": {"kcal": 122, "carbs": 32, "protein": 1.3, "fat": 0.4, "sodium": 4, "azucares": 15, "fibra": 2.3, "saturadas": 0.1, "trans": 0, "colesterol": 0},
}

def enrich_nutri():
    url = f"{SUPABASE_URL}/rest/v1/insumos?select=id,nombre"
    req = urllib.request.Request(url, headers=headers, method='GET')
    
    try:
        with urllib.request.urlopen(req) as response:
            insumos = json.loads(response.read().decode())
            print(f"Enriqueciendo {len(insumos)} insumos con datos completos...")
            
            updates = 0
            for insumo in insumos:
                nombre_clean = insumo['nombre'].lower().strip()
                match = None
                
                for key in NUTRI_DATA:
                    if key in nombre_clean:
                        match = NUTRI_DATA[key]
                        break
                
                if match:
                    update_url = f"{SUPABASE_URL}/rest/v1/insumos?id=eq.{insumo['id']}"
                    update_data = json.dumps(match).encode('utf-8')
                    update_req = urllib.request.Request(update_url, data=update_data, headers=headers, method='PATCH')
                    
                    with urllib.request.urlopen(update_req) as up_res:
                        if up_res.status in [200, 204]:
                            print(f"✅ Enriquecido Completo: {insumo['nombre']}")
                            updates += 1
            
            print(f"\nProceso finalizado. {updates} ingredientes tienen ahora datos nutricionales completos.")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    enrich_nutri()
