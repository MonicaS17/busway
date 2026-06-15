import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import io from 'socket.io-client';

const BACKEND_URL = 'http://192.168.1.106:3000'; 
const MOCK_RUTA_ID = '64bbf1f9c8d1a23b4c5d6e71';

export default function PreviaRutaPadre() {
  const [estadoRuta, setEstadoRuta] = useState('espera'); 
  const [datosViaje, setDatosViaje] = useState(null);
  const [coordenadasEnVivo, setCoordenadasEnVivo] = useState(null);

  useEffect(() => {
    const socketClient = io(BACKEND_URL);

    socketClient.on('connect', () => {
      socketClient.emit('join:ruta', { id_ruta: MOCK_RUTA_ID, rol: 'padre' });
    });

    // Escuchar cuando inicia el viaje
    socketClient.on('ruta:iniciada', (data) => {
      setEstadoRuta('progreso');
      setDatosViaje(data);
    });

    // Escuchar telemetría GPS retransmitida por el backend
    socketClient.on('padre:actualizar_mapa', (coor) => {
      setEstadoRuta('progreso');
      setCoordenadasEnVivo(coor);
    });

    return () => {
      if (socketClient) socketClient.disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seguimiento de BusWay</Text>
      
      {estadoRuta === 'espera' ? (
        <View style={styles.esperaCard}>
          <ActivityIndicator size="small" color="#F59E0B" style={{ marginBottom: 15 }} />
          <Text style={styles.esperaText}>A la espera del inicio de la ruta...</Text>
          <Text style={styles.subEsperaText}>No hay información disponible. La vista del mapa se activará automáticamente cuando el conductor inicie el viaje desde la central.</Text>
        </View>
      ) : (
        <View style={styles.progresoCard}>
          <Text style={styles.progresoText}>🟢 ¡Ruta Escolar en Curso!</Text>
          <Text style={styles.subProgresoText}>ID de Registro: {datosViaje?.id_viaje || 'Buscando hito...'}</Text>
          
          <View style={styles.mapMockCard}>
            <Text style={styles.mapMockTitle}>🗺️ Flujo de Datos del Mapa Recibido:</Text>
            {coordenadasEnVivo ? (
              <View>
                <Text style={styles.telemetria}>Latitud: <Text style={{fontWeight:'bold'}}>{coordenadasEnVivo.lat}</Text></Text>
                <Text style={styles.telemetria}>Longitud: <Text style={{fontWeight:'bold'}}>{coordenadasEnVivo.lng}</Text></Text>
                <Text style={styles.telemetria}>Velocidad Bus: <Text style={{color:'#EF4444', fontWeight:'bold'}}>{coordenadasEnVivo.velocidad} km/h</Text></Text>
                <Text style={styles.telemetriaText}>Última actualización: {new Date(coordenadasEnVivo.timestamp).toLocaleTimeString()}</Text>
              </View>
            ) : (
              <Text style={styles.waitingGps}>Esperando el primer reporte de coordenadas del bus...</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#F8FAFC' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 25, textAlign: 'center' },
  esperaCard: { padding: 25, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FEF3C7', alignItems: 'center' },
  esperaText: { fontSize: 16, fontWeight: 'bold', color: '#D97706', marginBottom: 10 },
  subEsperaText: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18 },
  progresoCard: { padding: 25, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  progresoText: { fontSize: 16, fontWeight: 'bold', color: '#10B981', marginBottom: 5, textAlign: 'center' },
  subProgresoText: { fontSize: 11, color: '#64748B', textAlign: 'center', fontFamily: 'monospace', marginBottom: 20 },
  mapMockCard: { backgroundColor: '#1E293B', padding: 15, borderRadius: 8 },
  mapMockTitle: { color: '#38BDF8', fontWeight: 'bold', fontSize: 13, marginBottom: 10 },
  telemetria: { color: '#FFF', fontSize: 14, marginBottom: 4, fontFamily: 'monospace' },
  telemetriaText: { color: '#94A3B8', fontSize: 11, marginTop: 10, fontStyle: 'italic' },
  waitingGps: { color: '#94A3B8', fontSize: 12, fontStyle: 'italic', textAlign: 'center' }
});