const Viaje = require('../models/Viaje');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    socket.on('join:ruta', ({ id_ruta, rol }) => {
      socket.join(`sala:ruta:${id_ruta}`);
      console.log(`👤 Usuario [${rol}] se unió a la sala de la ruta: ${id_ruta}`);
    });

    // Inicio de ruta por el conductor
    socket.on('ruta:iniciar', async ({ id_ruta, id_conductor }) => {
      try {
        const nuevoViaje = await Viaje.create({
          ruta_id: id_ruta,
          conductor_id: id_conductor,
          estado: 'activo',
          hora_salida: new Date()
        });

        console.log(`▶️ Viaje iniciado ID: ${nuevoViaje._id}`);
        
        io.to(`sala:ruta:${id_ruta}`).emit('ruta:iniciada', { 
          id_viaje: nuevoViaje._id,
          estado: 'activo' 
        });
      } catch (error) {
        console.error('Error al iniciar ruta:', error);
        socket.emit('error:servidor', { mensaje: 'No se pudo guardar el hito de inicio.' });
      }
    });

    // Transmisión GPS en tiempo real
    socket.on('conductor:coordenadas', ({ id_ruta, lat, lng, velocidad }) => {
      socket.to(`sala:ruta:${id_ruta}`).emit('padre:actualizar_mapa', {
        lat,
        lng,
        velocidad,
        timestamp: new Date()
      });
    });

    // Finalización de ruta
    socket.on('ruta:finalizar', async ({ id_viaje, id_ruta }) => {
      try {
        await Viaje.findByIdAndUpdate(id_viaje, {
          estado: 'finalizado',
          hora_llegada: new Date()
        });

        console.log(`⏹️ Viaje ${id_viaje} finalizado manualmente.`);
        io.to(`sala:ruta:${id_ruta}`).emit('ruta:finalizada');
        io.in(`sala:ruta:${id_ruta}`).socketsLeave(`sala:ruta:${id_ruta}`);
      } catch (error) {
        console.error('Error al finalizar viaje en BD:', error);
      }
    });

    // Registro de asistencia (subida o bajada)
    socket.on('asistencia:escanear', async ({ id_viaje, id_ruta, hijo_id, tipo, lat, lng }) => {
      try {
        const ahora = new Date();
        
        const nuevaAsistencia = {
          hijo_id,
          tipo, 
          metodo_registro: 'qr',
          fecha_hora: ahora,
          latitud: lat || null,
          longitud: lng || null
        };

        await Viaje.findByIdAndUpdate(
          id_viaje,
          { 
            $push: { asistencias: nuevaAsistencia },
            ...(tipo === 'subida' && { $addToSet: { estudiantes_abordo: hijo_id } }),
            ...(tipo === 'bajada' && { $pull: { estudiantes_abordo: hijo_id } })
          }
        );

        console.log(`📲 Registro [${tipo}] exitoso para el estudiante ${hijo_id}`);

        // Avisar en tiempo real a la sala de sockets
        io.to(`sala:ruta:${id_ruta}`).emit('asistencia:actualizada', {
          hijo_id,
          tipo,
          fecha_hora: ahora
        });

        // MÓDULO DE NOTIFICACIONES SIMULADO (FIREBASE NOTIFICATION)
        console.log(`🔔 [FIREBASE SIMULACIÓN] Enviando Notificación: padre_${id_ruta}`);
        console.log(`📢 Título: ${tipo === 'subida' ? 'BusWay: Abordo' : 'BusWay: Destino Confirmado'}`);
        console.log(`📝 Mensaje: El estudiante ha [${tipo.toUpperCase()}]`);
        
        /* const payloadPush = {
          notification: {
            title: tipo === 'subida' ? '🚌 ¡Abordo!' : '🏫 ¡Llegada exitosa!',
            body: `Su hijo ha escaneado el QR de ${tipo} de manera segura.`
          },
          topic: `padre_${id_ruta}`
        };
        admin.messaging().send(payloadPush)
          .then(res => console.log("Push exitoso"))
          .catch(err => console.error("Error en Push", err));
        */

      } catch (error) {
        console.error('Error al registrar asistencia QR:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });
};