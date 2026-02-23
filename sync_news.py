import firebase_admin
from firebase_admin import credentials, firestore
from newsapi import NewsApiClient
import os
import json
import hashlib
from dotenv import load_dotenv

load_dotenv()

# 1. AUTENTICACIÓN
try:
    if "FIREBASE_KEY_JSON" in os.environ:
        key_data = json.loads(os.environ["FIREBASE_KEY_JSON"])
        cred = credentials.Certificate(key_data)
    elif os.path.exists("serviceAccountKey.json"):
        cred = credentials.Certificate("serviceAccountKey.json")
    else:
        raise Exception("No se encontraron credenciales.")

    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"Error: {e}")
    exit()

newsapi = NewsApiClient(api_key=os.getenv("NEWS_API_KEY"))

# 2. TUS 5 CATEGORÍAS (NO SE MOVIERON)
categorias_tesis = {
    "Tecnología": "tecnología OR gaming OR IA",
    "Política": "política OR gobierno",
    "Negocios": "negocios OR economía OR finanzas",
    "Cultura Pop": "entretenimiento OR cine OR música",
    "Ciencia": "ciencia OR espacio OR salud OR investigación"
}

try:
    print("🚀 Sincronizando noticias...")
    for nombre_cat, query_busqueda in categorias_tesis.items():
        query_final = f'({query_busqueda}) AND (Mexico OR "Estados Unidos")' 
        response = newsapi.get_everything(q=query_final, language='es', sort_by='publishedAt', page_size=15)
        articulos = response.get('articles', [])
        
        for art in articulos:
            titulo = art.get("title")
            if not titulo or len(titulo) < 15: continue

            # EL CAMBIO PARA NO REPETIR EN ALL: ID único basado en el título
            doc_id = hashlib.sha256(titulo.encode('utf-8')).hexdigest()[:20]
            doc_ref = db.collection("noticias_tesis").document(doc_id)
            doc_snap = doc_ref.get()

            if doc_snap.exists:
                # Si ya existe, solo añadimos la categoría a la lista 'categories'
                data_old = doc_snap.to_dict()
                cats = data_old.get("categories", [])
                if nombre_cat not in cats:
                    cats.append(nombre_cat)
                    doc_ref.update({"categories": cats})
            else:
                # Si es nueva, la creamos con la lista inicial de categorías
                doc_ref.set({
                    "title": titulo,
                    "description": art.get("description") or "Contenido adaptativo...",
                    "url": art.get("url"),
                    "urlToImage": art.get("urlToImage"),
                    "source": {"name": art.get("source", {}).get("name")},
                    "publishedAt": art.get("publishedAt"),
                    "categories": [nombre_cat], # Se manda como lista para el filtro
                    "fetchedAt": firestore.SERVER_TIMESTAMP 
                })
    print("✅ Base de datos actualizada sin duplicados en All.")
except Exception as e:
    print(f"Error: {e}")