import { useState, useEffect } from 'react';
import api from '../../../config/api';
import { getAuthHeader } from '../../../utils/authToken';

export default function useRuta({ usuario, esPadre, selectedHijoId, selectedRutaId }) {
  const esPadreEfectivo = esPadre || usuario?.tipo === 'padre';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rutaInfo, setRutaInfo] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [conductorInfo, setConductorInfo] = useState(null);
  const [activeTripInitial, setActiveTripInitial] = useState(null);
  const [faseViaje, setFaseViaje] = useState('sin_viaje');
  const [hijos, setHijos] = useState([]);
  const [token, setToken] = useState(null);
  const [rutas, setRutas] = useState([]);

  const seleccionarRutaConductor = async (rutaId) => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      console.log('[useRuta] seleccionarRutaConductor auth header:', headers.Authorization?.substring(0, 40));
      const resDetalle = await api.get(`/api/conductor/ruta/${rutaId}`, {
        headers
      });
      if (resDetalle.data && resDetalle.data.ruta) {
        setRutaInfo(resDetalle.data.ruta);
        const mapped = (resDetalle.data.estudiantes || []).map((e, idx) => ({
          ...e,
          id: e._id,
          _id: e._id,
          orden: e.orden || (idx + 1)
        }));
        setEstudiantes(mapped);
      }
    } catch (err) {
      console.error('Error al seleccionar otra ruta:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!usuario) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        if (esPadreEfectivo) {
          // ─── LOGICA DE PADRE ─────────────────────────────────────────────────────────
          const headers = await getAuthHeader();
          const tokenValue = headers.Authorization.replace('Bearer ', '');
          setToken(tokenValue); // Guardar para revalidación en foreground
          console.log('[useRuta] padre auth header:', headers.Authorization?.substring(0, 40));

          const resHijos = await api.get('/api/padre/mis-hijos', { headers });

          if (!resHijos.data || !resHijos.data.hijos || resHijos.data.hijos.length === 0) {
            setError('No tienes hijos registrados actualmente.');
            setLoading(false);
            return;
          }

          const hijosObtenidos = resHijos.data.hijos;
          setHijos(hijosObtenidos);

          // Determinar qué hijo usar
          let activeHijo = hijosObtenidos[0];
          if (selectedHijoId) {
            const found = hijosObtenidos.find(h => h._id === selectedHijoId || h.id === selectedHijoId);
            if (found) activeHijo = found;
          }

          const condId = activeHijo.conductor_id?._id || activeHijo.conductor_id;
          const activeRutaId = activeHijo.ruta_id?._id || activeHijo.ruta_id;
          console.log('[useRuta] selectedHijoId=', selectedHijoId, 'activeHijo=', activeHijo?._id, 'condId=', condId, 'activeRutaId=', activeRutaId);

          if (!activeHijo?._id) {
            setError('El estudiante seleccionado no tiene un identificador válido.');
            setLoading(false);
            return;
          }

          if (!condId) {
            setError('Este estudiante no tiene un conductor asignado actualmente.');
            setLoading(false);
            return;
          }

          if (!activeRutaId) {
            setError('Este estudiante no tiene una ruta asignada actualmente.');
            setLoading(false);
            return;
          }

          // Obtener perfil conductor
          try {
  const resPerfil = await api.get(
    `/api/conductor/${condId}/perfil`,
    { headers }
  );

  if (resPerfil.data) {
    setConductorInfo(resPerfil.data.conductor);
  }
} catch (err) {
  console.log('Error fetching conductor profile:', err.message);
}

          // Obtener ruta del conductor
          let rInfo = null;

try {
  const resRuta = await api.get(
    `/api/conductor/${condId}/ruta?ruta_id=${activeRutaId}`,
    { headers }
  );

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
            const resViaje = await api.get(`/api/viajes/activo/padre?estudiante_id=${activeHijo._id}&ruta_id=${activeRutaId}`, { headers });
            const respData = resViaje.data;
            if (respData && respData.viaje) {
              setActiveTripInitial(respData.viaje);
              setFaseViaje(respData.fase || 'activo');
            } else {
              setActiveTripInitial(null);
              setFaseViaje(respData?.fase || 'sin_viaje');
            }
          } catch (err) {
            console.log('Error fetching active trip for parent:', err.response?.status, err.response?.data || err.message || err);
            setActiveTripInitial(null);
            setFaseViaje('sin_viaje');
          }

        } else {
          // ─── LOGICA DE CONDUCTOR ─────────────────────────────────────────────────────────
          const headers = await getAuthHeader();
          setToken(headers.Authorization.replace('Bearer ', '')); // Guardar para revalidación en foreground
          console.log('[useRuta] conductor auth header:', headers.Authorization?.substring(0, 40));
          const resRuta = await api.get('/api/conductor/ruta', { headers });

          if (!resRuta.data || (!resRuta.data.ruta && (!resRuta.data.rutas || resRuta.data.rutas.length === 0))) {
            setError('No tienes rutas asignadas actualmente.');
            setLoading(false);
            return;
          }

          const allRoutes = resRuta.data.rutas || [];
          setRutas(allRoutes);

          // Si el conductor tiene una rutaInfo seleccionada en el estado local, usar esa.
          // De lo contrario, si se pasó selectedRutaId, usar esa.
          // De lo contrario, usar la primera ruta de allRoutes.
          let r = rutaInfo;
          if (!r && allRoutes.length > 0) {
            if (selectedRutaId) {
              const found = allRoutes.find(item => item._id === selectedRutaId);
              r = found || allRoutes[0];
            } else {
              r = allRoutes[0];
            }
          }
          if (r) {
            setRutaInfo(r);
          }

          let estudiantesList = [];
          if (r) {
            try {
              const resDetalle = await api.get(`/api/conductor/ruta/${r._id}`, { headers });
              if (resDetalle.data && resDetalle.data.estudiantes) {
                estudiantesList = resDetalle.data.estudiantes.map((e, idx) => ({
                  ...e,
                  id: e._id,
                  _id: e._id,
                  orden: e.orden || (idx + 1)
                }));
              }
            } catch (err) {
              console.log('Error loading selected route detail:', err.message);
            }
          }

          if (estudiantesList.length > 0) {
            setEstudiantes(estudiantesList);
          } else {
            const resEst = await api.get('/api/conductor/estudiantes', { headers });
            const estudiantesObtenidos = resEst.data?.estudiantes || [];
            setEstudiantes(estudiantesObtenidos.map((e, idx) => ({
              ...e,
              id: e._id,
              _id: e._id,
              orden: idx + 1
            })));
          }

          try {
            const resViaje = await api.get('/api/viajes/activo/conductor', { headers });
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
  }, [usuario, esPadre, esPadreEfectivo, selectedHijoId, selectedRutaId]);


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
    setEstudiantes,
    rutas,
    seleccionarRutaConductor
  };
}
