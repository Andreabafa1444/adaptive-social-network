const BASE_URL = "https://pibbles-api.onrender.com";

/**
 * Obtiene la colección completa de Pibbles desde la API.
 * @returns {Promise<Array>} Lista de objetos de pibbles.
 */
export async function fetchPibbles() {
  try {
    const response = await fetch(`${BASE_URL}/pibbles`);
    
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const result = await response.json();
    
    // Tu API devuelve un objeto con { "total": X, "data": [...] }
    console.log("Primer pibble de la colección:", result.data[0]);

    return result.data || [];
  } catch (error) {
    console.error(" Error al obtener pibbles:", error);
    return [];
  }
}

/**
 * Obtiene un pibble aleatorio.
 */
export async function fetchRandomPibble() {
  try {
    const response = await fetch(`${BASE_URL}/pibbles/random`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener pibble random:", error);
    return null;
  }
}