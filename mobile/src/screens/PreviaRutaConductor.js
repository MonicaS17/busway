import React, { useEffect, useState, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import io from 'socket.io-client';
import * as Location from 'expo-location'; 
import { auth } from '../config/firebase';
import api from '../config/api';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL; 
const DEFAULT_SCHOOL_COORDS = { latitude: 8.9975, longitude: -79.5240 };

export default function PreviaRutaConductor({ route, navigation }) {
  const idConductorReal = route?.params?.usuario?._id;
  const [socket, setSocket] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [viajeIniciado, setViajeIniciado] = useState(false);
  const [idViaje, setIdViaje] = useState(null);
  
  // Lista ordenada de estudiantes de la base de datos
  const [estudiantes, setEstudiantes] = useState([]);
  const [rutaInfo, setRutaInfo] = useState(null);

  // rutaSeleccionada inicia en null → muestra la pantalla de selección
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [tipoViaje, setTipoViaje] = useState('ida'); // 'ida' o 'vuelta', inicia en 'ida' por defecto

  // Lista congelada de estudiantes que participan en la trayectoria una vez se inicia el viaje
  const [estudiantesEnTrayecto, setEstudiantesEnTrayecto] = useState([]);

  // Control de estado de cada estudiante: { [id]: 'pendiente' | 'abordado' | 'ausente' | 'entregado' }
  const [estadosEstudiantes, setEstadosEstudiantes] = useState({});

  // Control de posición del busito
  const [indiceRuta, setIndiceRuta] = useState(0);
  const [posicionBus, setPosicionBus] = useState({
    latitude: 8.9833,
    longitude: -79.5167,
    latitudeDelta: 0.006,
    longitudeDelta: 0.006,
  });
  
  const [logsAsistencia, setLogsAsistencia] = useState([]);
  const mapRef = useRef(null);

  // Estados de carga y error para la UI
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [mensajeError, setMensajeError] = useState('');
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  // Refs para evitar recrear la conexión socket.io cuando cambian las dependencias
  const tipoViajeRef = useRef(tipoViaje);
  const estadosEstudiantesRef = useRef(estadosEstudiantes);
  const estudiantesRef = useRef(estudiantes);
  const idViajeRef = useRef(idViaje);

  useEffect(() => { tipoViajeRef.current = tipoViaje; }, [tipoViaje]);
  useEffect(() => { estadosEstudiantesRef.current = estadosEstudiantes; }, [estadosEstudiantes]);
  useEffect(() => { estudiantesRef.current = estudiantes; }, [estudiantes]);
  useEffect(() => { idViajeRef.current = idViaje; }, [idViaje]);

  const rutaInfoRef = useRef(rutaInfo);
  useEffect(() => { rutaInfoRef.current = rutaInfo; }, [rutaInfo]);

  // ──────────────────────────
  // CARGA DE DATOS DE LA API 
  // ──────────────────────────
  useEffect(() => {
    const cargarDatosBackend = async () => {
      try {
        setCargandoDatos(true);
        setMensajeError('');
        
        if (!auth.currentUser) {
          setMensajeError('Por favor, inicia sesión para continuar.');
          setCargandoDatos(false);
          return;
        }

        const token = await auth.currentUser.getIdToken();

        // Obtener la ruta del conductor
        let rutaObtenida = null;
        try {
          const resRuta = await api.get('/api/conductor/ruta', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resRuta.data && resRuta.data.ruta) {
            rutaObtenida = resRuta.data.ruta;
            setRutaInfo(resRuta.data.ruta);
          }
        } catch (err) {
          console.log('Error al buscar ruta:', err.response?.data || err.message);
        }

        if (!rutaObtenida) {
          setMensajeError('No tienes rutas asignadas actualmente.');
          setCargandoDatos(false);
          return;
        }

        // Obtener estudiantes asignados
        let estudiantesObtenidos = [];
        try {
          const resEst = await api.get('/api/conductor/estudiantes', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resEst.data && resEst.data.estudiantes) {
            estudiantesObtenidos = resEst.data.estudiantes;
            setEstudiantes(resEst.data.estudiantes);
            if (resEst.data.estudiantes.length === 0) {
              setMensajeError('No hay estudiantes asociados a esta ruta.');
            }
          }
        } catch (err) {
          console.log('Error al buscar estudiantes:', err.response?.data || err.message);
        }

        // Consultar si hay un viaje activo para este conductor
        //    IMPORTANTE - Si hay viaje activo, restauramos SOLO los datos técnicos
        //    (idViaje, viajeIniciado, tipoViaje, estados de estudiantes).
        //    NO establecemos rutaSeleccionada aquí. El flujo SIEMPRE inicia en
        //    Paso 1: Selección de ruta (rutaSeleccionada === null).
        //    Si hay viaje activo, se restauran los datos pero la UI muestra Paso 1 primero,
        //    permitiendo que el conductor confirme su selección.

        try {
          const resViajeActivo = await api.get('/api/viajes/activo/conductor', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resViajeActivo.data) {
            const viaje = resViajeActivo.data;
            console.log('📥 Viaje activo detectado al cargar datos:', viaje);
            
            if (viaje.estado === 'activo') {
              setIdViaje(viaje._id);
              setTipoViaje(viaje.tipo_viaje || 'ida');
              setViajeIniciado(true);

              // Reconstruir estados de asistencia desde el viaje activo
              const initialStates = {};
              estudiantesObtenidos.forEach(est => {
                initialStates[est._id] = 'pendiente';
              });
              if (viaje.asistencias && viaje.asistencias.length > 0) {
                viaje.asistencias.forEach(asist => {
                  if (asist.tipo === 'subida') {
                    initialStates[asist.hijo_id] = 'abordado';
                  } else if (asist.tipo === 'bajada') {
                    initialStates[asist.hijo_id] = 'entregado';
                  } else if (asist.tipo === 'ausente') {
                    initialStates[asist.hijo_id] = 'ausente';
                  }
                });
              }
              setEstadosEstudiantes(initialStates);

              // Congelar estudiantes en trayecto si es viaje de vuelta
              if (viaje.tipo_viaje === 'vuelta') {
                const abordaron = estudiantesObtenidos.filter(est => initialStates[est._id] === 'abordado');
                setEstudiantesEnTrayecto(abordaron);
              } else {
                setEstudiantesEnTrayecto(estudiantesObtenidos);
              }
            } else {
              setIdViaje(null);
              setViajeIniciado(false);
              setTipoViaje('ida');
              setRutaSeleccionada(null);
            }
          }
        } catch (err) {
          if (err.response?.status !== 404) {
            console.log('Error al buscar viaje activo del conductor:', err.response?.data || err.message);
          }
          setIdViaje(null);
          setViajeIniciado(false);
          setTipoViaje('ida');
          setRutaSeleccionada(null);
        }

      } catch (error) {
        console.error('Error cargando iniciales:', error);
        setMensajeError('Error al conectar con el servidor.');
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarDatosBackend();
  }, []);

  // ───────────────────────────────
  // SOCKET.IO (conexión y eventos)
  // ───────────────────────────────
  useEffect(() => {
    if (!rutaInfo || !rutaInfo._id) return;

    console.log('🔌 Iniciando conexión de Socket para ruta:', rutaInfo._id);
    const socketClient = io(BACKEND_URL);

    socketClient.on('connect', () => {
      console.log('🔌 Socket conectado para conductor. ID:', socketClient.id);
      setConectado(true);
      socketClient.emit('join:ruta', { id_ruta: rutaInfoRef.current._id, rol: 'conductor' });
      socketClient.emit('ruta:obtener_detalles', { id_ruta: rutaInfoRef.current._id });
    });

    socketClient.on('disconnect', (reason) => {
      console.log('🔌 Socket desconectado para conductor. Razón:', reason);
      setConectado(false);
    });

    socketClient.on('ruta:detalles', (data) => {
      console.log('Detalles de ruta recibidos del servidor:', data);
      if (data) {
        setRutaInfo(prev => ({
          ...prev,
          ...data,
          _id: data._id || data.id_ruta || prev?._id
        }));
        if (data.estudiantes && data.estudiantes.length > 0) {
          setEstudiantes(data.estudiantes);
        }
      }
    });

    socketClient.on('ruta:detalles:error', (err) => {
      console.warn('Error recibiendo detalles de ruta por Socket:', err);
    });

    socketClient.on('ruta:iniciada', (data) => {
      console.log('📥 Evento "ruta:iniciada" :', data);
      setViajeIniciado(true);
      setIdViaje(data.id_viaje);

      const list = estudiantesRef.current;
      if (tipoViajeRef.current === 'vuelta') {
        const abordaron = list.filter(est => estadosEstudiantesRef.current[est._id] === 'abordado');
        setEstudiantesEnTrayecto(abordaron);
      } else {
        setEstudiantesEnTrayecto(list);
      }

      if (tipoViajeRef.current === 'vuelta') {
        list.forEach(est => {
          const estado = estadosEstudiantesRef.current[est._id];
          if (estado === 'abordado') {
            socketClient.emit('asistencia:escanear', {
              id_viaje: data.id_viaje,
              id_ruta: rutaInfoRef.current?._id,
              hijo_id: est._id,
              tipo: 'subida',
              lat: DEFAULT_SCHOOL_COORDS.latitude,
              lng: DEFAULT_SCHOOL_COORDS.longitude
            });
          } else if (estado === 'ausente') {
            socketClient.emit('asistencia:registrar_manual', {
              id_viaje: data.id_viaje,
              id_ruta: rutaInfoRef.current?._id,
              hijo_id: est._id,
              tipo: 'subida',
              estado: 'ausente',
              lat: DEFAULT_SCHOOL_COORDS.latitude,
              lng: DEFAULT_SCHOOL_COORDS.longitude
            });
          }
        });
      }
    });

    socketClient.on('asistencia:actualizada', (data) => {
      console.log('Asistencia actualizada recibida por socket:', data);
      
      const list = estudiantesRef.current;
      const est = list.find(e => e._id === data.hijo_id);
      const estudianteNombre = est ? `${est.nombre} ${est.apellido || ''}`.trim() : `Estudiante (${data.hijo_id.slice(-4)})`;
      
      const logNormalizado = {
        hijo_id: data.hijo_id,
        tipo: data.tipo,
        estudianteNombre,
        fecha_hora: data.fecha_hora || new Date().toISOString()
      };

      setEstadosEstudiantes((prev) => {
        const next = { ...prev };
        if (data.tipo === 'subida' || data.tipo === 'abordado') {
          next[data.hijo_id] = 'abordado';
        } else if (data.tipo === 'bajada' || data.tipo === 'entregado') {
          next[data.hijo_id] = 'entregado';
        } else if (data.tipo === 'ausente') {
          next[data.hijo_id] = 'ausente';
        }
        return next;
      });

      setLogsAsistencia((prev) => {
        const isDuplicate = prev.some(
          (log) => log.hijo_id === logNormalizado.hijo_id && 
                   log.tipo === logNormalizado.tipo &&
                   Math.abs(new Date(log.fecha_hora) - new Date(logNormalizado.fecha_hora)) < 2000
        );
        if (isDuplicate) return prev;
        return [logNormalizado, ...prev];
      });
    });

    socketClient.on('ruta:ida_finalizada', (data) => {
      console.log('📥 Evento "ruta:ida_finalizada" recibido con data:', data);
      // Si el backend confirma fin de ida desde otra fuente, sincronizamos
      // el UI local para preparar la vuelta sin regresar al menú.
      if (tipoViajeRef.current === 'ida') {
        setViajeIniciado(false);
        setIdViaje(null);
        setTipoViaje('vuelta');
        setIndiceRuta(0);
        setEstudiantesEnTrayecto([]);
        setLogsAsistencia([]);

        const list = estudiantesRef.current;
        const initialStates = {};
        list.forEach(est => {
          initialStates[est._id] = 'pendiente';
        });
        setEstadosEstudiantes(initialStates);
      }
    });

    socketClient.on('ruta:transicion_vuelta', (data) => {
      console.log('📥 Evento "ruta:transicion_vuelta" recibido con data:', data);
      //    Al transicionar a vuelta, viajeIniciado=false para mostrar
      //    la pantalla de Check-In. rutaSeleccionada se mantiene para no ir al menú.
      setViajeIniciado(false);
      setIdViaje(data.id_viaje);
      setTipoViaje('vuelta');
      setIndiceRuta(0);
      setEstudiantesEnTrayecto([]);
      
      const list = estudiantesRef.current;
      const initialStates = {};
      list.forEach(est => {
        initialStates[est._id] = 'pendiente';
      });
      setEstadosEstudiantes(initialStates);
    });

    socketClient.on('ruta:finalizada', () => {
      console.log('📥 Evento "ruta:finalizada" recibido desde Socket.');
      //    Al finalizar todo el ciclo, limpiamos TODOS los estados
      //    y reseteamos rutaSeleccionada = null para volver a la selección de ruta.
      setViajeIniciado(false);
      setIdViaje(null);
      setTipoViaje('ida');
      setIndiceRuta(0);
      setEstudiantesEnTrayecto([]);
      setLogsAsistencia([]);
      setRutaSeleccionada(null); // Regresa al Selección de ruta
      
      const list = estudiantesRef.current;
      const initialStates = {};
      list.forEach(est => {
        initialStates[est._id] = 'pendiente';
      });
      setEstadosEstudiantes(initialStates);

      Alert.alert('Jornada Finalizada', '¡La Ruta de hoy ha concluido! Puede cerrar la sesión o esperar la próxima jornada.');
    });

    setSocket(socketClient);

    return () => {
      if (socketClient) {
        console.log('🔌 Desconectando socket en cleanup del effect. ID:', socketClient.id);
        socketClient.disconnect();
      }
    };
  }, [rutaInfo?._id]);

  // Inicializar estados de estudiantes (solo cuando no hay viaje activo)
  useEffect(() => {
    if (idViaje !== null) return;
    const list = estudiantes;
    const initialStates = {};
    list.forEach(est => {
      initialStates[est._id] = 'pendiente';
    });
    setEstadosEstudiantes(initialStates);
  }, [estudiantes, idViaje]);

  // ──────────────────────────────────────────
  // HELPERS Y CALLBACKS (Selección de ruta, Check-In, Avance de ruta, Finalización)
  // ──────────────────────────────────────────
  const cambiarTipoViaje = (tipo) => {
    setTipoViaje(tipo);
    setViajeIniciado(false);
    setIdViaje(null);
    setIndiceRuta(0);
    setLogsAsistencia([]);
    setEstudiantesEnTrayecto([]);
    
    const list = estudiantes;
    const initialStates = {};
    list.forEach(est => {
      initialStates[est._id] = 'pendiente';
    });
    setEstadosEstudiantes(initialStates);
  };

  const setCheckInStatus = (estudianteId, status) => {
    setEstadosEstudiantes(prev => ({
      ...prev,
      [estudianteId]: status
    }));
  };

  const todosAsignadosCheckIn = useMemo(() => {
    const list = estudiantes || [];
    return list.every(est => estadosEstudiantes[est._id] === 'abordado' || estadosEstudiantes[est._id] === 'ausente');
  }, [estadosEstudiantes, estudiantes]);

  const obtenerCoordenadasEstudiante = (est, index) => {
    const lat = est.latitud || est.lat || (est.direccion && est.direccion.lat) || (est.coordenadas && est.coordenadas.latitude);
    const lng = est.longitud || est.lng || (est.direccion && est.direccion.lng) || (est.coordenadas && est.coordenadas.longitude);
    if (lat && lng) {
      return { latitude: Number(lat), longitude: Number(lng) };
    }
    return {
      latitude: 8.9833 + (index * 0.003),
      longitude: -79.5167 - (index * 0.002),
    };
  };

  const trayectoria = useMemo(() => {
    const listaEstudiantes = viajeIniciado ? (estudiantesEnTrayecto || []) : (estudiantes || []);
    const escuelaNombre = rutaInfo?.escuela || 'Colegio San Agustín';
    const escuelaCoords = (rutaInfo?.escuela_lat && rutaInfo?.escuela_lng) 
      ? { latitude: Number(rutaInfo.escuela_lat), longitude: Number(rutaInfo.escuela_lng) } 
      : DEFAULT_SCHOOL_COORDS;

    if (tipoViaje === 'ida') {
      const paradasEstudiantes = listaEstudiantes.map((est, idx) => ({
        _id: est._id,
        nombre: est.nombre,
        latitude: obtenerCoordenadasEstudiante(est, idx).latitude,
        longitude: obtenerCoordenadasEstudiante(est, idx).longitude,
        descripcion: `Parada ${idx + 1}: Recoger a ${est.nombre} (Hogar)`,
        esEstudiante: true,
        tipoParada: 'recogida'
      }));

      return [
        ...paradasEstudiantes,
        {
          _id: 'escuela',
          nombre: escuelaNombre,
          latitude: escuelaCoords.latitude,
          longitude: escuelaCoords.longitude,
          descripcion: `Destino Final: ${escuelaNombre}`,
          esEstudiante: false,
          tipoParada: 'escuela'
        }
      ];
    } else {
      const paradasEstudiantes = listaEstudiantes.map((est, idx) => ({
        _id: est._id,
        nombre: est.nombre,
        latitude: obtenerCoordenadasEstudiante(est, idx).latitude,
        longitude: obtenerCoordenadasEstudiante(est, idx).longitude,
        descripcion: `Parada ${idx + 1}: Entregar a ${est.nombre} en su Hogar`,
        esEstudiante: true,
        tipoParada: 'entrega'
      }));

      return [
        {
          _id: 'escuela',
          nombre: escuelaNombre,
          latitude: escuelaCoords.latitude,
          longitude: escuelaCoords.longitude,
          descripcion: `Punto de Partida: ${escuelaNombre}`,
          esEstudiante: false,
          tipoParada: 'escuela'
        },
        ...paradasEstudiantes
      ];
    }
  }, [estudiantes, tipoViaje, rutaInfo, estudiantesEnTrayecto, viajeIniciado]);

  // Sincronizar posición inicial del busito al cargar trayectoria (solo si el viaje no está en curso)
  useEffect(() => {
    if (trayectoria.length > 0 && !viajeIniciado) {
      const startPoint = trayectoria[0];
      const regionCoords = {
        latitude: startPoint.latitude,
        longitude: startPoint.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      };
      setPosicionBus(regionCoords);
      setIndiceRuta(0);
      if (mapRef.current) {
        mapRef.current.animateToRegion(regionCoords, 500);
      }
    }
  }, [trayectoria, viajeIniciado]);

  const iniciarRuta = () => {
    if (procesandoAccion) return;
    setProcesandoAccion(true);

    console.log('🔘 Botón "Iniciar Ruta" presionado. Estado local:', { conectado, tipoViaje, idConductorReal, idRuta: rutaInfo?._id, idViaje });
    if (!socket || !rutaInfo) {
      console.warn('⚠️ No se pudo iniciar ruta: socket o rutaInfo ausentes.', { tieneSocket: !!socket, tieneRuta: !!rutaInfo });
      setProcesandoAccion(false);
      return;
    }

    if (tipoViaje === 'vuelta' && !idViaje) {
      console.log('📡 Creando viaje de vuelta en Socket.');
      socket.emit('ruta:crear_vuelta', {
        id_ruta: rutaInfo._id,
        id_conductor: idConductorReal
      });
      setTimeout(() => setProcesandoAccion(false), 1000);
      return;
    }

    console.log('📡 Emitiendo evento "ruta:iniciar" para la ruta:', rutaInfo._id);
    socket.emit('ruta:iniciar', { 
      id_ruta: rutaInfo._id, 
      id_conductor: idConductorReal,
      tipo_viaje: tipoViaje
    });
    setTimeout(() => setProcesandoAccion(false), 1000);
  };

  const avanzarSiguienteParada = () => {
    const siguienteIndice = indiceRuta + 1;
    if (siguienteIndice < trayectoria.length) {
      setIndiceRuta(siguienteIndice);
      const hitoSiguiente = trayectoria[siguienteIndice];
      const nuevasCoordenadas = {
        latitude: hitoSiguiente.latitude,
        longitude: hitoSiguiente.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      };
      setPosicionBus(nuevasCoordenadas);
      if (mapRef.current) {
        mapRef.current.animateToRegion(nuevasCoordenadas, 1000);
      }
      
      if (socket && rutaInfo) {
        socket.emit('conductor:coordenadas', {
          id_ruta: rutaInfo._id,
          lat: hitoSiguiente.latitude,
          lng: hitoSiguiente.longitude,
          velocidad: 30
        });
      }
    }
  };

  // Avance automático según estado de asistencia del estudiante actual
  useEffect(() => {
    if (!viajeIniciado || trayectoria.length === 0) return;

    const hitoActual = trayectoria[indiceRuta];
    if (!hitoActual || !hitoActual.esEstudiante) return;

    const estadoActual = estadosEstudiantes[hitoActual._id];

    if (tipoViaje === 'ida' && (estadoActual === 'abordado' || estadoActual === 'ausente')) {
      const timer = setTimeout(() => { avanzarSiguienteParada(); }, 1500);
      return () => clearTimeout(timer);
    }

    if (tipoViaje === 'vuelta' && (estadoActual === 'entregado' || estadoActual === 'ausente')) {
      const timer = setTimeout(() => { avanzarSiguienteParada(); }, 1500);
      return () => clearTimeout(timer);
    }
  }, [estadosEstudiantes, indiceRuta, viajeIniciado, tipoViaje, trayectoria]);

  const registrarAsistenciaQR = (tipo) => {
    const hitoActual = trayectoria[indiceRuta];
    if (!hitoActual || !hitoActual.esEstudiante) return;

    if (socket && idViaje && rutaInfo) {
      socket.emit('asistencia:escanear', {
        id_viaje: idViaje,
        id_ruta: rutaInfo._id,
        hijo_id: hitoActual._id,
        tipo,
        lat: hitoActual.latitude,
        lng: hitoActual.longitude
      });
    }

    setEstadosEstudiantes(prev => ({
      ...prev,
      [hitoActual._id]: tipo === 'subida' ? 'abordado' : 'entregado'
    }));

    Alert.alert('Escáner QR', `Código QR leído con éxito para ${hitoActual.nombre}.`);
  };

  const registrarAsistenciaManual = (estado) => {
    const hitoActual = trayectoria[indiceRuta];
    if (!hitoActual || !hitoActual.esEstudiante) return;

    if (socket && idViaje && rutaInfo) {
      socket.emit('asistencia:registrar_manual', {
        id_viaje: idViaje,
        id_ruta: rutaInfo._id,
        hijo_id: hitoActual._id,
        tipo: tipoViaje === 'ida' ? 'subida' : 'bajada',
        estado,
        lat: hitoActual.latitude,
        lng: hitoActual.longitude
      });
    }

    setEstadosEstudiantes(prev => ({
      ...prev,
      [hitoActual._id]: estado
    }));

    Alert.alert('Registro Manual', `Se registró de forma manual al estudiante ${hitoActual.nombre} como ${estado.toUpperCase()}.`);
  };

  const marcarEstudianteAusente = () => {
    const hitoActual = trayectoria[indiceRuta];
    if (!hitoActual || !hitoActual.esEstudiante) return;

    if (socket && idViaje && rutaInfo) {
      socket.emit('asistencia:registrar_manual', {
        id_viaje: idViaje,
        id_ruta: rutaInfo._id,
        hijo_id: hitoActual._id,
        tipo: tipoViaje === 'ida' ? 'subida' : 'bajada',
        estado: 'ausente',
        lat: hitoActual.latitude,
        lng: hitoActual.longitude
      });
    }

    setEstadosEstudiantes(prev => ({
      ...prev,
      [hitoActual._id]: 'ausente'
    }));

    Alert.alert('Inasistencia', `${hitoActual.nombre} fue registrado como Ausente.`);
  };

  const registrarDesembarqueEscuela = () => {
    if (!idViaje || !socket || !rutaInfo) return;
    
    const lista = estudiantes;
    const abordaron = lista.filter(e => estadosEstudiantes[e._id] === 'abordado');

    if (abordaron.length === 0) {
      Alert.alert('Información', 'No hay estudiantes a bordo para desembarcar.');
      return;
    }

    abordaron.forEach(est => {
      socket.emit('asistencia:escanear', {
        id_viaje: idViaje,
        id_ruta: rutaInfo._id,
        hijo_id: est._id,
        tipo: 'bajada',
        lat: DEFAULT_SCHOOL_COORDS.latitude,
        lng: DEFAULT_SCHOOL_COORDS.longitude
      });

      setEstadosEstudiantes(prev => ({
        ...prev,
        [est._id]: 'entregado'
      }));
    });

    Alert.alert('Llegada Confirmada', 'Se ha registrado la llegada de todos los estudiantes al Colegio.');
  };

  const finalizarRutaManual = (mostrarAlerta = true) => {
    if (socket && idViajeRef.current && rutaInfo) {
      socket.emit('ruta:finalizar', { id_viaje: idViajeRef.current, id_ruta: rutaInfo._id });
    }

    const tipoAnterior = tipoViajeRef.current;

    if (tipoAnterior === 'ida') {
      setViajeIniciado(false);
      setIdViaje(null);
      setTipoViaje('vuelta');
      setIndiceRuta(0);
      setEstudiantesEnTrayecto([]);
      setLogsAsistencia([]);

      const estadosIniciales = {};
      estudiantes.forEach(est => {
        estadosIniciales[est._id] = 'pendiente';
      });
      setEstadosEstudiantes(estadosIniciales);

      if (mostrarAlerta) {
        Alert.alert('Fin de Ida', 'El recorrido de ida ha terminado. Ahora puede preparar la vuelta en el Check-In.');
      }
      return;
    }

    setViajeIniciado(false);
    setIdViaje(null);
    setRutaSeleccionada(null);
    setTipoViaje('ida');
    setIndiceRuta(0);
    setEstudiantesEnTrayecto([]);
    setLogsAsistencia([]);
    setEstadosEstudiantes({});

    if (mostrarAlerta) {
      Alert.alert('Ruta Finalizada', 'Ha finalizado su ruta de hoy.');
    }
  };

  //    Offset del busito para evitar que tape hitos estáticos.
  //    Además de desplazamiento por coordenadas, reforzamos con zIndex={99} en el Marker.
  const obtenerCoordenadasBusOffset = () => {
    const busCoords = { latitude: posicionBus.latitude, longitude: posicionBus.longitude };
    const coincide = trayectoria.some(
      (hito) => Math.abs(hito.latitude - busCoords.latitude) < 0.0001 &&
                Math.abs(hito.longitude - busCoords.longitude) < 0.0001
    );

    if (coincide) {
      return {
        latitude: busCoords.latitude + 0.0004,
        longitude: busCoords.longitude
      };
    }
    return busCoords;
  };

  const formatLogText = (item) => {
    const timeStr = new Date(item.fecha_hora).toLocaleTimeString();
    let action = '';
    
    if (item.tipo === 'subida' || item.tipo === 'abordado') {
      action = 'abordó el bus (Subida)';
    } else if (item.tipo === 'bajada' || item.tipo === 'entregado') {
      action = 'llegó a destino (Bajada)';
    } else if (item.tipo === 'ausente') {
      action = 'marcado como AUSENTE';
    } else {
      action = item.tipo;
    }
    
    // Ejemplo: "• [08:45:12] Juan Pérez abordó el bus (Subida)"
    return `• [${timeStr}] ${item.estudianteNombre} ${action}`; 
  };

  // ──────────────────────────────────────────
  // SUB-RENDERS
  // ──────────────────────────────────────────
  const renderCheckInVuelta = () => {
    const list = estudiantes;
    return (
      <View style={styles.checkInContainer}>
        <Text style={styles.checkInTitle}>Fase de Abordaje en la Escuela (Check-In)</Text>
        <Text style={styles.checkInSubtitle}>
          Marque el estado de cada estudiante antes de iniciar la marcha hacia los hogares.
        </Text>
        
        <ScrollView style={styles.checkInScroll} nestedScrollEnabled={true}>
          {list.map((est, idx) => {
            const estado = estadosEstudiantes[est._id] || 'pendiente';
            return (
              <View key={est._id || idx} style={styles.checkInItem}>
                <View style={styles.checkInInfo}>
                  <Text style={styles.checkInName}>{est.nombre} {est.apellido || ''}</Text>
                  <Text style={styles.checkInDetail}>Escuela: {est.escuela || 'Colegio San Agustín'}</Text>
                </View>
                
                <View style={styles.checkInActions}>
                  {estado === 'pendiente' ? (
                    <>
                      <TouchableOpacity 
                        style={[styles.checkInBtn, styles.checkInBtnAbordar]} 
                        onPress={() => setCheckInStatus(est._id, 'abordado')}
                      >
                        <Text style={styles.checkInBtnText}>Abordado</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.checkInBtn, styles.checkInBtnAusente]} 
                        onPress={() => setCheckInStatus(est._id, 'ausente')}
                      >
                        <Text style={styles.checkInBtnText}>Ausente</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.checkInStatusRow}>
                      <Text style={[
                        styles.checkInBadgeText, 
                        estado === 'abordado' ? styles.checkInBadgeAbordado : styles.checkInBadgeAusente
                      ]}>
                        {estado === 'abordado' ? 'Abordado' : 'Ausente'}
                      </Text>
                      <TouchableOpacity 
                        style={styles.checkInBtnRevertir} 
                        onPress={() => setCheckInStatus(est._id, 'pendiente')}
                      >
                        <Text style={styles.checkInBtnRevertirText}>Rehacer</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
        
        <TouchableOpacity 
          style={[styles.btnIniciarViajeGrande, (!todosAsignadosCheckIn || procesandoAccion || !conectado) && styles.btnDisabled]} 
          onPress={iniciarRuta}
          disabled={!todosAsignadosCheckIn || procesandoAccion || !conectado}
        >
          <Text style={styles.btnText}>
            {!todosAsignadosCheckIn 
              ? 'Asigne el estado de todos los estudiantes para iniciar' 
              : 'Iniciar Recorrido de Vuelta'
            }
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPreviaIda = () => {
    const list = estudiantes;
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitleHeader}>Configuración del Viaje (Ida)</Text>
        <View style={styles.studentListBox}>
          <Text style={styles.studentListHeader}>
            Lista de Estudiantes a Recoger ({list.length}):
          </Text>
          {list.map((est, index) => (
            <View key={est._id || index} style={styles.studentItem}>
              <Text style={styles.studentName}>{est.nombre} {est.apellido || ''}</Text>
              <Text style={styles.studentDetail}>Hogar a Colegio</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.btnIniciar, (procesandoAccion || !conectado) && styles.btnDisabled]} 
          onPress={iniciarRuta} 
          disabled={procesandoAccion || !conectado}
        >
          <Text style={styles.btnText}>Iniciar Recorrido de Ida</Text>
        </TouchableOpacity>
      </View>
    );
  };

  //    renderSeleccionRuta muestra las rutas disponibles.
  //    Presionar una → setRutaSeleccionada(r) → avanza al Paso 2 de previa.
  const renderSeleccionRuta = () => {
    const list = rutaInfo ? [rutaInfo] : [];
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitleHeader}>Rutas Asignadas</Text>
        {list.length === 0 ? (
          <Text style={styles.emptyLogsText}>No tienes rutas asignadas actualmente.</Text>
        ) : (
          list.map((r, idx) => (
            <TouchableOpacity 
              key={r._id || idx} 
              style={[styles.checkInItem, { paddingVertical: 15 }]}
              onPress={() => setRutaSeleccionada(r)}
            >
              <View style={styles.checkInInfo}>
                <Text style={[styles.checkInName, { fontSize: 15 }]}>{r.nombre}</Text>
                <Text style={[styles.checkInDetail, { marginTop: 4 }]}>Escuela: {r.escuela}</Text>
                <Text style={styles.checkInDetail}>Estudiantes asociados: {estudiantes.length}</Text>
                <Text style={styles.checkInDetail}>Estado: {r.estado || 'Activa'}</Text>
              </View>
              <View style={[styles.checkInActions, { alignSelf: 'center' }]}>
                <Text style={{ color: '#1E3A8A', fontWeight: 'bold', fontSize: 13 }}>Seleccionar</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  };

  // ──────────────────────────────────────────
  // RENDER PRINCIPAL
  // ──────────────────────────────────────────
  if (cargandoDatos) {
    return (
      <View style={[styles.scrollContainer, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 10, color: '#64748B' }}>Cargando información de tu ruta...</Text>
      </View>
    );
  }

  if (mensajeError) {
    return (
      <View style={[styles.scrollContainer, { justifyContent: 'center', alignItems: 'center', flex: 1, padding: 30 }]}>
        <Text style={{ fontSize: 48, marginBottom: 20 }}>🚌</Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginBottom: 10 }}>
          Información de la Ruta
        </Text>
        <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 20 }}>
          {mensajeError}
        </Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Volver al Menú</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hitoActual = trayectoria[indiceRuta];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Navegación de Recorrido</Text>
      <Text style={styles.subtitle}>Servidor: {conectado ? 'Conectado' : 'Desconectado'}</Text>

      {/*
        ── ÁRBOL DE RENDERIZADO CONDICIONAL (flujo cronológico correcto) ──
        Paso 1: rutaSeleccionada === null            → Pantalla de selección de ruta
        Paso 2: rutaSeleccionada !== null
                && !viajeIniciado                   → Previa de configuración (Ida o Check-In Vuelta)
        Paso 3: rutaSeleccionada !== null
                && viajeIniciado                    → Interfaz en ruta (mapa + controles)
      */}

      {/* ── PASO 1: Selección de ruta ── */}
      {rutaSeleccionada === null ? (
        renderSeleccionRuta()

      /* ── PASO 2: Previa / Configuración ── */
      ) : !viajeIniciado ? (
        <View style={styles.previaBox}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={styles.sectionTitleHeader}>Tipo de Recorrido</Text>
            <TouchableOpacity onPress={() => setRutaSeleccionada(null)}>
              <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 13 }}>Cambiar Ruta</Text>
            </TouchableOpacity>
          </View>

          {tipoViaje === 'ida' ? renderPreviaIda() : renderCheckInVuelta()}
        </View>

      /* ── PASO 3: Viaje en curso ── */
      ) : (
        <View style={styles.interfazEnRuta}>
          
          {/* MAPA DINÁMICO CON HITOS */}
          <View style={styles.mapWrapper}>
            <Text style={styles.mapTitle}>Recorrido en Curso</Text>
            <Text style={styles.paradaText}>
              Ubicación Actual: {hitoActual?.descripcion || 'Calculando...'}
            </Text>
            
            <MapView
              ref={mapRef}
              style={styles.mapaFisico}
              provider={PROVIDER_DEFAULT}
              initialRegion={posicionBus}
              zoomEnabled={true}
            >
              {/* Busito con offset de latitud (+0.0004) y zIndex={99} para no tapar hitos */}
              <Marker 
                coordinate={obtenerCoordenadasBusOffset()}
                title="Autobús Escolar"
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={99}
              >
                <View style={styles.customMarker}>
                  <Text style={styles.busEmoji}>🚌</Text>
                </View>
              </Marker>

              {/* Casas y escuelas tienen zIndex={5} (bajo) para quedar bajo el busito. */}
              {(() => {
                const coordenadasDibujadas = new Set();
                return trayectoria
                  .filter((hito) => {
                    const key = `${hito.latitude.toFixed(6)},${hito.longitude.toFixed(6)}`;
                    if (coordenadasDibujadas.has(key)) return false;
                    coordenadasDibujadas.add(key);
                    return true;
                  })
                  .map((hito) => {
                    const esPasoActual = hitoActual && 
                                         Math.abs(hito.latitude - hitoActual.latitude) < 0.0001 && 
                                         Math.abs(hito.longitude - hitoActual.longitude) < 0.0001;
                    return (
                      <Marker
                        key={hito._id}
                        coordinate={{ latitude: hito.latitude, longitude: hito.longitude }}
                        title={hito.nombre}
                        description={hito.descripcion}
                        zIndex={5}
                      >
                        <View style={[
                          styles.hitoMarker,
                          hito.esEstudiante ? styles.hitoEstudiante : styles.hitoEscuela,
                          esPasoActual && styles.hitoActual
                        ]}>
                          <Text style={styles.hitoEmoji}>
                            {hito.esEstudiante ? '🏠' : '🏫'}
                          </Text>
                        </View>
                      </Marker>
                    );
                  });
              })()}
            </MapView>
          </View>

          {/* CONTROLES DE ASISTENCIA */}
          <View style={styles.qrContainer}>
            <Text style={styles.sectionHeader}>Controles de Asistencia e Incidencias</Text>
            
            {hitoActual && (
              <View style={styles.studentInfoCard}>
                <Text style={styles.studentInfoLabel}>Parada Actual:</Text>
                {hitoActual.esEstudiante ? (
                  <>
                    <View style={styles.studentInfoMain}>
                      <Text style={styles.studentInfoName}>{hitoActual.nombre}</Text>
                      <View style={[
                        styles.statusBadge,
                        estadosEstudiantes[hitoActual._id] === 'pendiente' && styles.statusBadgePendiente,
                        estadosEstudiantes[hitoActual._id] === 'abordado' && styles.statusBadgeAbordado,
                        estadosEstudiantes[hitoActual._id] === 'entregado' && styles.statusBadgeEntregado,
                        estadosEstudiantes[hitoActual._id] === 'ausente' && styles.statusBadgeAusente
                      ]}>
                        <Text style={styles.statusBadgeText}>
                          {(estadosEstudiantes[hitoActual._id] || 'PENDIENTE').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.studentInfoAddress}>Dirección: {hitoActual.descripcion}</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.studentInfoMain}>
                      <Text style={styles.studentInfoSchoolName}>{hitoActual.nombre}</Text>
                      <View style={[styles.statusBadge, styles.statusBadgeEscuela]}>
                        <Text style={styles.statusBadgeText}>ESTRUCTURAL</Text>
                      </View>
                    </View>
                    <Text style={styles.studentInfoAddress}>Sede Principal del Servicio Escolar</Text>
                  </>
                )}
              </View>
            )}

            {hitoActual?.esEstudiante ? (
              <>
                {tipoViaje === 'ida' ? (
                  <View style={styles.qrButtonsRow}>
                    <TouchableOpacity 
                      style={[styles.btnAction, styles.btnActionQr, { flex: 1.2 }]} 
                      onPress={() => registrarAsistenciaQR('subida')}
                    >
                      <Text style={styles.btnText}>Escanear Código de Abordaje</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.btnAction, styles.btnActionAusente, { flex: 0.8 }]} 
                      onPress={marcarEstudianteAusente}
                    >
                      <Text style={styles.btnText}>Reportar Ausente</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.qrButtonsRowStacked}>
                    <TouchableOpacity 
                      style={[styles.btnAction, styles.btnActionQr]} 
                      onPress={() => registrarAsistenciaQR('bajada')}
                    >
                      <Text style={styles.btnText}>Escanear Código de Desembarque</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.exceptionButtonsRow}>
                      <TouchableOpacity 
                        style={[styles.btnAction, styles.btnActionManual, { flex: 1 }]} 
                        onPress={() => registrarAsistenciaManual('entregado')}
                      >
                        <Text style={styles.btnText}>Registrar Entrega Manual</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.btnAction, styles.btnActionAusente, { flex: 1 }]} 
                        onPress={marcarEstudianteAusente}
                      >
                        <Text style={styles.btnText}>Reportar Ausente</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View>
                {tipoViaje === 'vuelta' && indiceRuta === 0 ? (
                  <TouchableOpacity style={styles.btnComenzarConduccion} onPress={avanzarSiguienteParada}>
                    <Text style={styles.btnText}>Iniciar Recorrido a Domicilios</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.escuelaLlegadaBox}>
                    <View style={styles.infoEscuelaCard}>
                      <Text style={styles.infoEscuelaText}>
                        {tipoViaje === 'ida' ? 'Llegada al Colegio. Desembarque de alumnos.' : 'Punto final. Regreso al Colegio.'}
                      </Text>
                    </View>
                    {tipoViaje === 'ida' && (
                      <TouchableOpacity style={styles.btnDesembarcarEscuela} onPress={registrarDesembarqueEscuela}>
                        <Text style={styles.btnText}>Confirmar Llegada y Desembarque</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* LOGS DE ASISTENCIA */}
          <View style={styles.logsBox}>
            <Text style={styles.logTitle}>Historial de Asistencia</Text>
            {logsAsistencia.length === 0 ? (
              <Text style={styles.emptyLogsText}>Sin registros de asistencia para este viaje.</Text>
            ) : (
              logsAsistencia.map((item, index) => (
                <Text key={index} style={[
                  styles.logText,
                  item.tipo === 'ausente' && { color: '#DC2626' },
                  (item.tipo === 'subida' || item.tipo === 'abordado') && { color: '#16A34A' },
                  (item.tipo === 'bajada' || item.tipo === 'entregado') && { color: '#2563EB' }
                ]}>
                  {formatLogText(item)}
                </Text>
              ))
            )}
          </View>

          <TouchableOpacity style={styles.btnFinalizar} onPress={() => finalizarRutaManual(true)}>
            <Text style={styles.btnText}>Finalizar Recorrido</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 20, backgroundColor: '#F8FAFC', paddingBottom: 50 },
  title: { fontSize: 24, fontWeight: '700', color: '#1E3A8A', marginTop: 40, textAlign: 'center', letterSpacing: 0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginBottom: 20, textAlign: 'center', fontWeight: '500' },
  previaBox: { marginTop: 20 },
  sectionTitleHeader: { fontSize: 16, fontWeight: '700', color: '#1E3A8A', marginBottom: 12, letterSpacing: 0.2 },
  selectorContainer: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 12, padding: 4, marginBottom: 20 },
  btnSelect: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  btnSelectActive: { backgroundColor: '#1E3A8A' },
  btnSelectText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  btnSelectTextActive: { color: '#FFF' },
  studentListBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 25, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  studentListHeader: { fontSize: 14, fontWeight: '700', color: '#1E3A8A', marginBottom: 12 },
  studentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  studentName: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
  studentDetail: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  btnIniciar: { backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  btnText: { color: '#FFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  interfazEnRuta: { marginTop: 5 },
  mapWrapper: { marginBottom: 20, backgroundColor: '#FFF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  mapTitle: { color: '#1E3A8A', fontWeight: '700', fontSize: 14, marginBottom: 8 },
  paradaText: { color: '#2563EB', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  mapaFisico: { width: '100%', height: Dimensions.get('window').height * 0.35, borderRadius: 12 },
  customMarker: { backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  busEmoji: { fontSize: 32, textAlign: 'center', includeFontPadding: false },
  hitoMarker: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 2 },
  hitoEstudiante: { backgroundColor: '#2563EB' },
  hitoEscuela: { backgroundColor: '#10B981' },
  hitoActual: { borderColor: '#F59E0B', borderWidth: 3, transform: [{ scale: 1.2 }] },
  hitoEmoji: { fontSize: 14 },
  
  studentInfoCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  studentInfoLabel: { fontSize: 11, color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  studentInfoMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  studentInfoName: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  studentInfoSchoolName: { fontSize: 18, fontWeight: '700', color: '#0F766E' },
  studentInfoAddress: { fontSize: 13, color: '#475569', lineHeight: 18 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  statusBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFF', letterSpacing: 0.5 },
  statusBadgePendiente: { backgroundColor: '#F59E0B' },
  statusBadgeAbordado: { backgroundColor: '#10B981' },
  statusBadgeEntregado: { backgroundColor: '#2563EB' },
  statusBadgeAusente: { backgroundColor: '#EF4444' },
  statusBadgeEscuela: { backgroundColor: '#64748B' },

  qrContainer: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: '#1E3A8A', marginBottom: 14, textAlign: 'center' },
  qrButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  qrButtonsRowStacked: { flexDirection: 'column', gap: 12, marginTop: 4 },
  exceptionButtonsRow: { flexDirection: 'row', gap: 12 },
  btnAction: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  btnActionQr: { backgroundColor: '#2563EB' },
  btnActionAusente: { backgroundColor: '#EF4444' },
  btnActionManual: { backgroundColor: '#F59E0B' },
  btnComenzarConduccion: { backgroundColor: '#1E3A8A', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  infoEscuelaCard: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  infoEscuelaText: { fontSize: 13, color: '#065F46', fontWeight: '700', textAlign: 'center' },
  btnDesembarcarEscuela: { backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  escuelaLlegadaBox: { flexDirection: 'column' },

  checkInContainer: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 18, marginBottom: 20, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  checkInTitle: { fontSize: 16, fontWeight: '700', color: '#1E3A8A', marginBottom: 8, textAlign: 'center' },
  checkInSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 16, textAlign: 'center', lineHeight: 18 },
  checkInScroll: { maxHeight: 300, marginBottom: 16 },
  checkInItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  checkInInfo: { flex: 1, marginRight: 10 },
  checkInName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  checkInDetail: { fontSize: 12, color: '#64748B', marginTop: 4 },
  checkInActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  checkInBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
  checkInBtnAbordar: { backgroundColor: '#EBFDF5', borderColor: '#A7F3D0' },
  checkInBtnAusente: { backgroundColor: '#FFF5F5', borderColor: '#FEB2B2' },
  checkInBtnText: { fontSize: 12, fontWeight: '600', color: '#1E293B' },
  checkInStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkInBadgeText: { fontSize: 12, fontWeight: '700', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, overflow: 'hidden' },
  checkInBadgeAbordado: { backgroundColor: '#D1FAE5', color: '#065F46' },
  checkInBadgeAusente: { backgroundColor: '#FEE2E2', color: '#991B1B' },
  checkInBtnRevertir: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#E2E8F0' },
  checkInBtnRevertirText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  btnIniciarViajeGrande: { backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  btnDisabled: { backgroundColor: '#CBD5E1', shadowOpacity: 0, elevation: 0 },

  logsBox: { backgroundColor: '#F1F5F9', padding: 14, borderRadius: 12, marginBottom: 25, borderWidth: 1, borderColor: '#E2E8F0' },
  logTitle: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyLogsText: { fontSize: 12, color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 },
  logText: { fontSize: 12, color: '#334155', fontFamily: 'System', marginVertical: 4, lineHeight: 16 },
  btnFinalizar: { backgroundColor: '#DC2626', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#DC2626', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 }
});