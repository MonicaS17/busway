import { useState, useEffect } from 'react';
import { auth } from '../../../config/firebase';
import api from '../../../config/api';

export default function useRuta({ usuario, esPadre }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rutaInfo, setRutaInfo] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [hijos, setHijos] = useState([]);
  const [conductorInfo, setConductorInfo] = useState(null);
  const [activeTripInitial, setActiveTripInitial] = useState(null);
  const [faseViaje, setFaseViaje] = useState('sin_viaje');
  const [token, setToken] = useState(null);               

  useEffect(() => {
    if (!usuario) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        if (!auth.currentUser) {
          setError('Por favor, inicia sesión para continuar.');
          setLoading(false);
          return;
        }

        const idToken = await auth.currentUser.getIdToken();
        setToken(idToken); // Guardar para revalidación en foreground

        if (esPadre) {
          // ─── LOGICA DE PADRE ─────────────────────────────────────────────────────────
          const resHijos = await api.get('/api/padre/mis-hijos', {
            headers: { Authorization: `Bearer ${idToken}` }
          });

          if (!resHijos.data || !resHijos.data.hijos || resHijos.data.hijos.length === 0) {
            setError('No tienes hijos registrados actualmente.');
            setLoading(false);
            return;
          }

          const hijosObtenidos = resHijos.data.hijos;
          setHijos(hijosObtenidos);

          const firstChild = hijosObtenidos[0];
          const condId = firstChild.conductor_id;

          if (!condId) {
            setError('Este estudiante no tiene un conductor asignado actualmente.');
            setLoading(false);
            return;
          }

          // Obtener perfil conductor
          try {
            const resPerfil = await api.get(`/api/conductor/${condId}/perfil`, {
              headers: { Authorization: `Bearer ${idToken}` }
            });
            if (resPerfil.data) {
              setConductorInfo(resPerfil.data.conductor);
            }
          } catch (err) {
            console.log('Error fetching conductor profile:', err.message);
          }

          // Obtener ruta del conductor
          let rInfo = null;
          try {
            const resRuta = await api.get(`/api/conductor/${condId}/ruta`, {
              headers: { Authorization: `Bearer ${idToken}` }
            });
            if (resRuta.data && resRuta.data.ruta) {
              rInfo = resRuta.data.ruta;
              setRutaInfo(rInfo);
            }
          } catch (err) {
            console.log('Error fetching route info:', err.message);
          }

          if (!rInfo) {
            setError('El conductor asignado no tiene una ruta configurada.');
            setLoading(false);
            return;
          }

          // Obtener viaje activo con nueva estructura { viaje, fase }
          try {
            const resViaje = await api.get('/api/viajes/activo/padre', {
              headers: { Authorization: `Bearer ${idToken}` }
            });
            const respData = resViaje.data;
            if (respData && respData.viaje) {
              setActiveTripInitial(respData.viaje);
              setFaseViaje(respData.fase || 'activo');
            } else {
              setActiveTripInitial(null);
              setFaseViaje(respData?.fase || 'sin_viaje');
            }
          } catch (err) {
            console.log('Error fetching active trip for parent:', err.message);
          }

        } else {
          // ─── LOGICA DE CONDUCTOR ─────────────────────────────────────────────────────────
          const resRuta = await api.get('/api/conductor/ruta', {
            headers: { Authorization: `Bearer ${idToken}` }
          });

          if (!resRuta.data || !resRuta.data.ruta) {
            setError('No tienes rutas asignadas actualmente.');
            setLoading(false);
            return;
          }

          const r = resRuta.data.ruta;
          setRutaInfo(r);

          const resEst = await api.get('/api/conductor/estudiantes', {
            headers: { Authorization: `Bearer ${idToken}` }
          });
          const estudiantesObtenidos = resEst.data?.estudiantes || [];
          setEstudiantes(estudiantesObtenidos);

          try {
            const resViaje = await api.get('/api/viajes/activo/conductor', {
              headers: { Authorization: `Bearer ${idToken}` }
            });
            const respData = resViaje.data;
            if (respData && respData.viaje) {
              setActiveTripInitial(respData.viaje);
              setFaseViaje(respData.fase || 'activo');
            } else {
              setActiveTripInitial(null);
              setFaseViaje(respData?.fase || 'sin_viaje');
            }
          } catch (err) {
            console.log('No active trip found on startup:', err.message);
          }
        }

      } catch (err) {
        console.error('Error loading route/viaje details:', err);
        setError('Error al obtener la información.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [usuario, esPadre]);


  return {
    loading,
    error,
    rutaInfo,
    estudiantes,
    hijos,
    conductorInfo,
    activeTripInitial,
    faseViaje,
    token,   
    setEstudiantes
  };
}
