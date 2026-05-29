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

# Valores estándar por 100g para los faltantes
NUTRI_DATA_EXTRA = {
    "patata amarilla": {"kcal": 77, "carbs": 17, "protein": 2, "fat": 0.1, "sodium": 6},
    "platano maduro": {"kcal": 122, "carbs": 32, "protein": 1.3, "fat": 0.4, "sodium": 4},
    "harina de trigo": {"kcal": 364, "carbs": 76, "protein": 10, "fat": 1, "sodium": 2},
    "chile dulce": {"kcal": 20, "carbs": 4.6, "protein": 0.9, "fat": 0.2, "sodium": 2},
    "culantro castilla": {"kcal": 23, "carbs": 3.7, "protein": 2.1, "fat": 0.5, "sodium": 46},
    "ajos": {"kcal": 149, "carbs": 33, "protein": 6.4, "fat": 0.5, "sodium": 17},
    "limones mesinos": {"kcal": 29, "carbs": 9, "protein": 1.1, "fat": 0.3, "sodium": 2},
    "limones mandarinos": {"kcal": 43, "carbs": 13, "protein": 0.7, "fat": 0.2, "sodium": 2},
    "moras": {"kcal": 43, "carbs": 10, "protein": 1.4, "fat": 0.5, "sodium": 1},
    "cas": {"kcal": 40, "carbs": 10, "protein": 0.8, "fat": 0.2, "sodium": 2}, # Aproximado a guayaba
    "chile panameño": {"kcal": 40, "carbs": 9, "protein": 1.9, "fat": 0.4, "sodium": 9}, # Aproximado a habanero
    "coco lopez": {"kcal": 333, "carbs": 53, "protein": 0, "fat": 13, "sodium": 40}, # Crema de coco dulce
    "chile chipotle asado": {"kcal": 44, "carbs": 9, "protein": 1.5, "fat": 0.5, "sodium": 300}, # En adobo aprox
    "sal fina": {"kcal": 0, "carbs": 0, "protein": 0, "fat": 0, "sodium": 38758}, # PURA SAL
    "donas": {"kcal": 452, "carbs": 51, "protein": 4.9, "fat": 25, "sodium": 326},
    "salsa lizano": {"kcal": 50, "carbs": 12, "protein": 1, "fat": 0, "sodium": 1200}, # Estimado alto en sodio
    "sazon completa": {"kcal": 150, "carbs": 30, "protein": 5, "fat": 2, "sodium": 15000}, # Estimado especias con sal
    "vino blanco": {"kcal": 82, "carbs": 2.6, "protein": 0.1, "fat": 0, "sodium": 5},
    "paprika": {"kcal": 282, "carbs": 54, "protein": 14, "fat": 13, "sodium": 68},
    "oregano": {"kcal": 265, "carbs": 69, "protein": 9, "fat": 4.3, "sodium": 25},
    "seco": {"kcal": 265, "carbs": 69, "protein": 9, "fat": 4.3, "sodium": 25}, # Asumiendo perejil/oregano seco
    "ajo en polvo": {"kcal": 331, "carbs": 73, "protein": 17, "fat": 0.7, "sodium": 60},
    "helado de vainilla": {"kcal": 207, "carbs": 24, "protein": 3.5, "fat": 11, "sodium": 80},
    "nesquik": {"kcal": 379, "carbs": 83, "protein": 4.5, "fat": 3.2, "sodium": 140},
    "levadura panadero": {"kcal": 325, "carbs": 41, "protein": 40, "fat": 8, "sodium": 51},
    "café": {"kcal": 2, "carbs": 0, "protein": 0.3, "fat": 0, "sodium": 2}, # Café preparado
    "vinagre balsámico": {"kcal": 88, "carbs": 17, "protein": 0.5, "fat": 0, "sodium": 23},
    "vinagre blanco": {"kcal": 18, "carbs": 0, "protein": 0, "fat": 0, "sodium": 2},
}

def enrich_nutri_extra():
    url = f"{SUPABASE_URL}/rest/v1/insumos?select=id,nombre"
    req = urllib.request.Request(url, headers=headers, method='GET')
    
    try:
        with urllib.request.urlopen(req) as response:
            insumos = json.loads(response.read().decode())
            print(f"Procesando {len(insumos)} insumos para datos faltantes...")
            
            updates = 0
            for insumo in insumos:
                nombre_clean = insumo['nombre'].lower().strip()
                match = None
                
                for key in NUTRI_DATA_EXTRA:
                    if key in nombre_clean:
                        match = NUTRI_DATA_EXTRA[key]
                        break
                
                if match:
                    update_url = f"{SUPABASE_URL}/rest/v1/insumos?id=eq.{insumo['id']}"
                    update_data = json.dumps(match).encode('utf-8')
                    update_req = urllib.request.Request(update_url, data=update_data, headers=headers, method='PATCH')
                    
                    with urllib.request.urlopen(update_req) as up_res:
                        if up_res.status in [200, 204]:
                            print(f"✅ Enriquecido: {insumo['nombre']}")
                            updates += 1
            
            print(f"\nProceso finalizado. Se actualizaron {updates} ingredientes más.")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    enrich_nutri_extra()
