const mongoose = require('mongoose');

let admin;
let hasFirebase = false;
try {
  admin = require('../config/firebaseAdmin');
  hasFirebase = true;
} catch (e) {
  console.warn("⚠️ Firebase Admin credentials not found. Using Mock Auth mode.");
}

// Middleware para verificar token Firebase o mock
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken = null;

    // Solo permitir tokens mock explícitamente cuando la variable de entorno esté activada.
    if (process.env.ALLOW_MOCK_TOKENS === 'true' && token.startsWith('mock_token_for_')) {
      // Formato: mock_token_for_<uid>
      const uid = token.replace('mock_token_for_', '');
      decodedToken = { uid };
    } else {
      if (!hasFirebase) {
        throw new Error('Firebase Auth is required but not configured.');
      }
      // Autenticación real: delegar a Firebase Admin
      decodedToken = await admin.auth().verifyIdToken(token);
    }

    console.log('[verifyToken] ', req.method, req.path, 'uid=', decodedToken?.uid, 'mockAllowed=', process.env.ALLOW_MOCK_TOKENS === 'true');

    // Enriquecer req.user con datos de la BD de MongoDB
    const Usuario = mongoose.model('usuarios');
    let dbUser = await Usuario.findOne({ firebase_uid: decodedToken.uid });
    
    if (!dbUser) {
      // También intentar buscar por correo si el token de desarrollo contenía el correo
      dbUser = await Usuario.findOne({ correo: decodedToken.uid });
      if (dbUser) {
        decodedToken.uid = dbUser.firebase_uid;
      }
    }

    console.log('[verifyToken] decodedUid=', decodedToken?.uid, 'email=', decodedToken?.email, 'dbUser=', dbUser ? `${dbUser._id.toString()}(${dbUser.tipo})` : 'null');

    if (!dbUser) {
      // Si no existe, dejamos continuar (ej. para registro)
      req.user = decodedToken;
      return next();
    }

    req.user = {
      ...decodedToken,
      id: dbUser._id.toString(),
      tipo: dbUser.tipo,
    };

    if (dbUser.tipo === 'padre') {
      const Estudiante = require('../models/Estudiante');
      const estudiantes = await Estudiante.find({ padre_id: dbUser._id });
      req.user.hijos_ids = estudiantes.map(h => h._id.toString());
    }

    next();

  } catch (error) {
    console.error('Error en verifyToken:', error);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = verifyToken;