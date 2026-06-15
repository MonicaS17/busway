import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import io from 'socket.io-client';

const BACKEND_URL = 'http://192.168.1.106:3000'; 
const MOCK_RUTA_ID = '64bbf1f9c8d1a23b4c5d6e71';
const MOCK_CONDUCTOR_ID = '64bbf1f9c8d1a23b4c5d6e72';
const MOCK_ESTUDIANTE_ID = '64bbf1f9c8d1a23b4c5d6e99'; 

// Coordenadas fijas
const ORIGEN_LAT = 8.9833;
const ORIGEN_LNG = -79.5167;

export default function PreviaRutaConductor() {
  const [socket, setSocket] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [viajeIniciado, setViajeIniciado] = useState(false);
  const [idViaje, setIdViaje] = useState(null);
  
  const [marcadorBus, setMarcadorBus] = useState({ lat: ORIGEN_LAT, lng: ORIGEN_LNG, velocidad: 0 });
  const [logsAsistencia, setLogsAsistencia] = useState([]);
  
  const gpsInterval = useRef(null);

  useEffect(() => {
    const socketClient = io(BACKEND_URL);

    socketClient.on('connect', () => {
      setConectado(true);
      socketClient.emit('join:ruta', { id_ruta: MOCK_RUTA_ID, rol: 'conductor' });
    });

    socketClient.on('ruta:iniciada', (data) => {
      setViajeIniciado(true);
      setIdViaje(data.id_viaje);
      
      // Activar el motor de emisión continua de coordenadas
      comenzarTransmisionGPS(socketClient);
    });

    // Escuchar confirmación asíncrona de QR (asistencia almacenada en la base)
    socketClient.on('asistencia:actualizada', (data) => {
      setLogsAsistencia((prev) => [data, ...prev]);
    });

    setSocket(socketClient);

    return () => {
      if (socketClient) socketClient.disconnect();
      if (gpsInterval.current) clearInterval(gpsInterval.current);
    };
  }, []);

  const iniciarRuta = () => {
    if (socket) {
      socket.emit('ruta:iniciar', { 
        id_ruta: MOCK_RUTA_ID, 
        id_conductor: MOCK_CONDUCTOR_ID 
      });
    }
  };

  // GPS Calcula el desplazamiento dinámico y actualiza el marcador único
  const comenzarTransmisionGPS = (socketInstancia) => {
    let latActual = ORIGEN_LAT;
    let lngActual = ORIGEN_LNG;

    gpsInterval.current = setInterval(() => {
      // Simulación de avance en línea recta
      latActual += 0.0003;
      lngActual += 0.0001;
      const velocidadCalculada = Math.floor(Math.random() * (40 - 15 + 1)) + 15; //quitar luego de pruebas

      const nuevoPuntoGps = {
        id_ruta: MOCK_RUTA_ID,
        lat: latActual,
        lng: lngActual,
        velocidad: velocidadCalculada
      };

      // ACTUALIZACIÓN LOCAL DEL MARCADOR ÚNICO
      setMarcadorBus({ lat: latActual, lng: lngActual, velocidad: velocidadCalculada });

      // EMISIÓN AL BACKEND (Vía WebSockets para propagar a salas del Padre y BD)
      socketInstancia.emit('conductor:coordenadas', nuevoPuntoGps);
      console.log('📡 Coordenadas enviadas por el Conductor:', nuevoPuntoGps);

    }, 3500); // Actualiza la telemetría del marcador cada 3.5 segundos
  };

  // Simulación de lectura e interceptación del QR por la Cámara
  const escanearCodigoQR = (tipoAccion) => {
    if (!idViaje) {
      Alert.alert("Error de Flujo", "La ruta no se ha iniciado. No se puede escanear asistencia.");
      return;
    }

    const payloadAsistencia = {
      id_viaje: idViaje,
      id_ruta: MOCK_RUTA_ID,
      hijo_id: MOCK_ESTUDIANTE_ID,
      tipo: tipoAccion, // subida y bajada
      lat: marcadorBus.lat,
      lng: marcadorBus.lng
    };

    socket.emit('asistencia:escanear', payloadAsistencia);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Consola de Control del Conductor</Text>
      <Text style={styles.subtitle}>Estatus del Servidor: {conectado ? '🟢 Conectado' : '🔴 Desconectado'}</Text>

      <View style={styles.card}>
        <Text style={styles.infoLabel}>ID Canal Sockets: <Text style={styles.infoValue}>{MOCK_RUTA_ID}</Text></Text>
        <Text style={styles.infoLabel}>Código Operador: <Text style={styles.infoValue}>{MOCK_CONDUCTOR_ID}</Text></Text>
      </View>

      {!viajeIniciado ? (
        <TouchableOpacity style={styles.btnIniciar} onPress={iniciarRuta} disabled={!conectado}>
          <Text style={styles.btnText}>▶ DESPACHAR E INICIAR RUTA</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.liveContainer}>
          <Text style={styles.liveBadge}>🚀 SEGUIMIENTO EN VIVO ACTIVADO</Text>
          <Text style={styles.viajeText}>Hito Viaje: {idViaje}</Text>

          <View style={styles.mapGridPlaceholder}>
            <Text style={styles.mapGridTitle}>🗺️ Radar Cartesiano de Telemetría (OpenSource Mock)</Text>
            
            <View style={styles.radarBox}>
              <Text style={styles.busMarker}>🚌</Text>
              <Text style={styles.markerLabel}>BusWay Escolar (Marcador Único)</Text>
            </View>

            <View style={styles.telemetriaRow}>
              <Text style={styles.telemetriaText}>Latitud: {marcadorBus.lat.toFixed(5)}</Text>
              <Text style={styles.telemetriaText}>Longitud: {marcadorBus.lng.toFixed(5)}</Text>
            </View>
            <Text style={styles.speedText}>Velocidad: {marcadorBus.velocidad} km/h</Text>
          </View>

          <View style={styles.qrControlBox}>
            <Text style={styles.sectionHeader}>Controles de Simulación de Asistencia QR</Text>
            
            <TouchableOpacity 
              style={[styles.btnQr, { backgroundColor: '#2563EB' }]} 
              onPress={() => escanearCodigoQR('subida')}
            >
              <Text style={styles.btnText}>📸 ESCANEAR QR: SUBIDA (Módulo 9)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnQr, { backgroundColor: '#DC2626', marginTop: 10 }]} 
              onPress={() => escanearCodigoQR('bajada')}
            >
              <Text style={styles.btnText}>📸 ESCANEAR QR: LLEGADA (Módulo 11)</Text>
            </TouchableOpacity>
          </View>

          {/* HISTORIAL REACCIONANDO EN CALIENTE AL SOCKET */}
          <View style={styles.logsBox}>
            <Text style={styles.logsTitle}>Historial de Escaneos Confirmados:</Text>
            {logsAsistencia.length === 0 && <Text style={styles.noLogs}>Ningún estudiante registrado en esta sesión...</Text>}
            {logsAsistencia.map((item, index) => (
              <Text key={index} style={styles.logItem}>
                {`🔷 Estudiante ${item.hijo_id.slice(-5)} -> Registró [${item.tipo.toUpperCase()}] exitosamente.`}
              </Text>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 20, backgroundColor: '#FFF', paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginTop: 40, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#64748B', marginBottom: 20, textAlign: 'center' },
  card: { padding: 15, borderRadius: 8, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  infoLabel: { fontSize: 13, color: '#475569', marginBottom: 4 },
  infoValue: { fontWeight: '600', color: '#0F172A', fontFamily: 'monospace' },
  btnIniciar: { backgroundColor: '#10B981', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  liveContainer: { marginTop: 10 },
  liveBadge: { color: '#10B981', fontWeight: 'bold', fontSize: 15, textAlign: 'center', marginBottom: 2 },
  viajeText: { color: '#64748B', fontSize: 11, textAlign: 'center', fontFamily: 'monospace', marginBottom: 20 },
  mapGridPlaceholder: { backgroundColor: '#1E293B', padding: 18, borderRadius: 10, marginBottom: 20, alignItems: 'center' },
  mapGridTitle: { color: '#38BDF8', fontWeight: 'bold', fontSize: 12, marginBottom: 15, alignSelf: 'flex-start' },
  radarBox: { padding: 20, backgroundColor: '#334155', borderRadius: 8, width: '100%', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#475569', marginBottom: 15 },
  busMarker: { fontSize: 32, marginBottom: 5 },
  markerLabel: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  telemetriaRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  telemetriaText: { color: '#94A3B8', fontFamily: 'monospace', fontSize: 12 },
  speedText: { color: '#F59E0B', fontWeight: 'bold', fontSize: 13, marginTop: 8, fontFamily: 'monospace' },
  qrControlBox: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  sectionHeader: { fontSize: 13, fontWeight: 'bold', color: '#334155', marginBottom: 12, textAlign: 'center' },
  btnQr: { paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
  logsBox: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 8 },
  logsTitle: { fontWeight: 'bold', color: '#0F172A', fontSize: 13, marginBottom: 8 },
  noLogs: { color: '#94A3B8', fontSize: 12, fontStyle: 'italic' },
  logItem: { fontSize: 11, color: '#334155', fontFamily: 'monospace', marginVertical: 3 }
});