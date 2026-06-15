import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import io from 'socket.io-client';

const BACKEND_URL = 'http://192.168.1.106:3000'; 
const MOCK_RUTA_ID = '64bbf1f9c8d1a23b4c5d6e71';
const MOCK_CONDUCTOR_ID = '64bbf1f9c8d1a23b4c5d6e72';
const MOCK_ESTUDIANTE_ID = '64bbf1f9c8d1a23b4c5d6e99'; 

export default function PreviaRutaConductor() {
  const [socket, setSocket] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [viajeIniciado, setViajeIniciado] = useState(false);
  const [idViaje, setIdViaje] = useState(null);
  
  // Coordenadas iniciales (Centro de Panamá por defecto hasta que conecte el GPS)
  const [posicionReal, setPosicionReal] = useState({
    latitude: 8.9833,
    longitude: -79.5167,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  const [cargandoGps, setCargandoGps] = useState(true);
  const [logsAsistencia, setLogsAsistencia] = useState([]);

  const locationSubscription = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const socketClient = io(BACKEND_URL);

    socketClient.on('connect', () => {
      setConectado(true);
      socketClient.emit('join:ruta', { id_ruta: MOCK_RUTA_ID, rol: 'conductor' });
    });

    socketClient.on('ruta:iniciada', (data) => {
      setViajeIniciado(true);
      setIdViaje(data.id_viaje);
    });

    socketClient.on('asistencia:actualizada', (data) => {
      setLogsAsistencia((prev) => [data, ...prev]);
    });

    setSocket(socketClient);
    solicitarPermisosGps();

    return () => {
      if (socketClient) socketClient.disconnect();
      if (locationSubscription.current) locationSubscription.current.remove();
    };
  }, []);

  useEffect(() => {
    if (viajeIniciado && socket) {
      activarGpsDispositivo();
    }
  }, [viajeIniciado, socket]);

  const solicitarPermisosGps = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso Denegado', 'Se requiere acceso al GPS para mostrar el mapa en vivo.');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    
    setPosicionReal({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.006,
      longitudeDelta: 0.006,
    });
    setCargandoGps(false);
  };

  const iniciarRuta = () => {
    if (socket) {
      socket.emit('ruta:iniciar', { id_ruta: MOCK_RUTA_ID, id_conductor: MOCK_CONDUCTOR_ID });
    }
  };

  const activarGpsDispositivo = async () => {
    if (!socket) return;

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000, 
        distanceInterval: 3 
      },
      (location) => {
        const coordsActuales = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.006,
          longitudeDelta: 0.006,
        };

        setPosicionReal(coordsActuales);

        // Centrar suavemente el mapa en la nueva ubicación del bus
        if (mapRef.current) {
          mapRef.current.animateToRegion(coordsActuales, 1000);
        }

        // Emitir al backend para almacenamiento y tracking del padre
        socket.emit('conductor:coordenadas', {
          id_ruta: MOCK_RUTA_ID,
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      }
    );
  };

  const finalizarRutaManual = () => {
    if (socket && idViaje) {
      socket.emit('ruta:finalizar', { id_viaje: idViaje, id_ruta: MOCK_RUTA_ID });
      if (locationSubscription.current) locationSubscription.current.remove();
      
      setViajeIniciado(false);
      setIdViaje(null);
      setLogsAsistencia([]);
      Alert.alert('Ruta Finalizada', 'El recorrido ha concluido.');
    }
  };

  const escanearAsistenciaQR = (tipoRegistro) => {
    if (!idViaje || !socket) return;

    socket.emit('asistencia:escanear', {
      id_viaje: idViaje,
      id_ruta: MOCK_RUTA_ID,
      hijo_id: MOCK_ESTUDIANTE_ID,
      tipo: tipoRegistro, 
      lat: posicionReal.latitude,
      lng: posicionReal.longitude
    });
    Alert.alert('Asistencia', `QR procesado como: ${tipoRegistro.toUpperCase()}`);
  };

  if (cargandoGps) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 10, color: '#64748B' }}>Sincronizando satélites GPS...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Navegación: Iniciar Ruta</Text>
      <Text style={styles.subtitle}>Servidor: {conectado ? '🟢 Conectado' : '🔴 Desconectado'}</Text>

      {!viajeIniciado ? (
        <View style={styles.previaBox}>
          <TouchableOpacity style={styles.btnIniciar} onPress={iniciarRuta} disabled={!conectado}>
            <Text style={styles.btnText}>▶ INICIAR RECORRIDO ESCOLAR</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.interfazEnRuta}>
          
          {/* MAPA REAL INTEGRADO */}
          <View style={styles.mapWrapper}>
            <Text style={styles.mapTitle}>🗺️ Monitoreo de Ubicación de la Ruta</Text>
            <MapView
                ref={mapRef}
                style={styles.mapaFisico}
                provider={PROVIDER_DEFAULT}
                initialRegion={posicionReal}
                showsUserLocation={false}
                zoomEnabled={true}
            >
              {/* Marcador Único del Autobús */}
              <Marker 
                coordinate={{ latitude: posicionReal.latitude, longitude: posicionReal.longitude }}
                title="Bus Escolar"
                description="Transmitiendo coordenadas"
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.customMarker}>
                  <Text style={styles.busEmoji}>🚌</Text>
                </View>
              </Marker>
            </MapView>
          </View>

          {/* CONTROLES DE ASISTENCIA QR */}
          <View style={styles.qrContainer}>
            <TouchableOpacity style={[styles.btnQr, { backgroundColor: '#3B82F6' }]} onPress={() => escanearAsistenciaQR('subida')}>
              <Text style={styles.btnText}>ESCANEAR QR: SUBIDA</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btnQr, { backgroundColor: '#10B981', marginTop: 12 }]} onPress={() => escanearAsistenciaQR('bajado')}>
              <Text style={styles.btnText}>ESCANEAR QR: LLEGADA</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logsBox}>
            {logsAsistencia.map((item, index) => (
              <Text key={index} style={styles.logText}>
                🔹 Alumno {item.hijo_id.slice(-5)} marcó [{item.tipo.toUpperCase()}] con éxito.
              </Text>
            ))}
          </View>

          <TouchableOpacity style={styles.btnFinalizar} onPress={finalizarRutaManual}>
            <Text style={styles.btnText}>⏹️ FINALIZAR RECORRIDO</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: 
  { padding: 20, backgroundColor: '#FFF', paddingBottom: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginTop: 40, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#64748B', marginBottom: 20, textAlign: 'center' },
  previaBox: { marginTop: 20 },
  btnIniciar: { backgroundColor: '#10B981', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  interfazEnRuta: { marginTop: 5 },
  mapWrapper: { marginBottom: 20 },
  mapTitle: { color: '#1E293B', fontWeight: 'bold', fontSize: 14, marginBottom: 10 },

  mapaFisico: { 
    width: '100%', 
    height: Dimensions.get('window').height * 0.35, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },

  customMarker: {
    backgroundColor: 'transparent', 
    justifyContent: 'center',
    alignItems: 'center',
  },

  busEmoji: {
    fontSize: 28,
    textAlign: 'center',
    includeFontPadding: false,
  },

  qrContainer: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  btnQr: { paddingVertical: 13, borderRadius: 6, alignItems: 'center' },
  logsBox: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, marginBottom: 25 },
  logText: { fontSize: 11, color: '#334155', fontFamily: 'monospace', marginVertical: 2 },
  btnFinalizar: { backgroundColor: '#DC2626', paddingVertical: 15, borderRadius: 8, alignItems: 'center' }
});