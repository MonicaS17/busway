import * as FileSystem from 'expo-file-system/legacy'; // Para leer la imagen como base64

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_KEY; // Lee la clave de la variable de entorno

export const reconocerTexto = async (imageUri) => {
  try {
    // Convertir imagen a base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    // Llamar a Google Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64 },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
          }]
        })
      }
    );

    const data = await response.json();
    console.log('Vision API respuesta:', JSON.stringify(data));

    const texto = data.responses?.[0]?.fullTextAnnotation?.text || '';
    return texto.toUpperCase();

  } catch (error) {
    console.log('Vision API error:', error);
    throw error;
  }
};