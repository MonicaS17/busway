const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccount.json');

// Inicializar Firebase Admin solo una vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Middleware para verificar token Firebase
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) { // Si no hay token o no tiene formato correcto
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split('Bearer ')[1]; // Extraer el token del encabezado
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();

  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = verifyToken;