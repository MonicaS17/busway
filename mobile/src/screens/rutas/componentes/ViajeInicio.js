import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ViajeInicio({
  rutaInfo,
  rutas = [],
  rutaSeleccionadaId,
  setRutaSeleccionadaId,
  tipoViaje,
  setTipoViaje,
  estudiantes,
  iniciarRuta,
  comenzarAsistencia
}) {
  const total = estudiantes.length;
  const abordo = estudiantes.filter(e => e.estado === 'abordo').length;
  const pendiente = estudiantes.filter(e => e.estado === 'pendiente').length;
  const ausente = estudiantes.filter(e => e.estado === 'ausente').length;

  const handleStart = () => {
    if (comenzarAsistencia) {
      comenzarAsistencia();
    }
  };

  const getSafeText = (value, fallback = '') => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed || fallback;
    }
    return fallback;
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.body, { paddingBottom: 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroIconWrap}>
          <Ionicons name="bus-outline" size={36} color="#0D1B3E" />
        </View>
        <Text style={styles.heroTitle}>¿Listo para iniciar?</Text>
        <Text style={styles.heroDesc}>
          {tipoViaje === 'ida'
            ? 'Inicia el recorrido para comenzar a recoger a los estudiantes desde sus hogares.'
            : 'Pasa lista de asistencia antes de iniciar el recorrido de vuelta a casa.'}
        </Text>
      </View>

      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, tipoViaje === 'ida' && styles.segmentBtnActivo]}
          onPress={() => setTipoViaje('ida')}
          activeOpacity={0.8}
        >
          <Ionicons name="sunny-outline" size={15} color={tipoViaje === 'ida' ? '#0D1B3E' : '#888'} />
          <Text style={[styles.segmentText, tipoViaje === 'ida' && styles.segmentTextActivo]}>Mañana (Ida)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, tipoViaje === 'vuelta' && styles.segmentBtnActivo]}
          onPress={() => setTipoViaje('vuelta')}
          activeOpacity={0.8}
        >
          <Ionicons name="moon-outline" size={15} color={tipoViaje === 'vuelta' ? '#0D1B3E' : '#888'} />
          <Text style={[styles.segmentText, tipoViaje === 'vuelta' && styles.segmentTextActivo]}>Tarde (Vuelta)</Text>
        </TouchableOpacity>
      </View>

      {rutas && rutas.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionLabel}>Selecciona la Ruta a Iniciar</Text>
          <View style={styles.rutasContainer}>
            {rutas.map(r => {
              const activo = rutaInfo?._id === r._id;
              return (
                <TouchableOpacity
                  key={r._id}
                  style={[styles.rutaSelectorCard, activo && styles.rutaSelectorCardActivo]}
                  onPress={() => setRutaSeleccionadaId(r._id)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.rutaSelectorIconWrap, activo && styles.rutaSelectorIconWrapActivo]}>
                    <Ionicons name="bus-outline" size={18} color={activo ? '#0D1B3E' : '#888'} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.rutaSelectorNombre, activo && styles.rutaSelectorNombreActivo]}>
                      {r.nombre_ruta || r.nombre || 'Ruta sin nombre'}
                    </Text>
                    <Text style={styles.rutaSelectorDetalle}>
                      {r.escuela} · {r.zona}
                    </Text>
                  </View>
                  <View style={[styles.radioCircle, activo && styles.radioCircleActivo]}>
                    {activo && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}


      <View style={styles.miniStats}>
        <MiniStat valor={total}     label="Total"     color="#0D1B3E" />
        <MiniStat valor={abordo}    label="A bordo"   color="#16A34A" />
        <MiniStat valor={pendiente} label="Pendiente" color="#F59E0B" />
        <MiniStat valor={ausente}   label="Ausente"   color="#DC2626" />
      </View>

      <TouchableOpacity style={styles.btnPrimary} onPress={handleStart}>
        <Ionicons name="qr-code-outline" size={20} color="#0D1B3E" />
        <Text style={styles.btnPrimaryText}>Comenzar asistencia</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Ruta de hoy</Text>
      <View style={styles.infoCard}>
        <FilaInfoViaje icon="school-outline"   label="Escuela"      valor={getSafeText(rutaInfo?.escuela, 'Colegio San Agustín')}  />
        <FilaInfoViaje icon="location-outline" label="Zonas"        valor={getSafeText(rutaInfo?.zona, 'Arraiján')} />
        <FilaInfoViaje 
          icon="time-outline"     
          label="Horario"      
          valor={
            tipoViaje === 'vuelta'
              ? (rutaInfo?.hora_salida_vuelta ? `Salida a las ${rutaInfo.hora_salida_vuelta}` : '12:30 PM')
              : getSafeText(rutaInfo?.horario, '6:30 AM — 7:15 AM')
          }    
        />
        <FilaInfoViaje icon="people-outline"   label="Estudiantes"  valor={`${total} registrados`} last />
      </View>
    </ScrollView>
  );
}

function FilaInfoViaje({ icon, label, valor, last }) {
  return (
    <View style={[styles.filaInfo, !last && { borderBottomWidth: 1, borderBottomColor: '#E3ECF7' }]}>
      <View style={styles.filaInfoIcon}>
        <Ionicons name={icon} size={15} color="#0D1B3E" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.filaInfoLabel}>{label}</Text>
        <Text style={styles.filaInfoValor}>{valor}</Text>
      </View>
    </View>
  );
}

function MiniStat({ valor, label, color }) {
  return (
    <View style={styles.miniStatCard}>
      <Text style={[styles.miniStatValor, { color }]}>{valor}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flexGrow: 1, paddingHorizontal: '6%', paddingTop: 24 },
  heroCard: { backgroundColor: '#F0F5FF', borderRadius: 20, borderWidth: 1.5, borderColor: '#E3ECF7', padding: 24, alignItems: 'center', marginBottom: 20 },
  heroIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFD700', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 20, fontWeight: 'bold', color: '#0D1B3E', marginBottom: 8 },
  heroDesc: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
  miniStats: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  miniStatCard: { flex: 1, backgroundColor: '#F5F8FC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E3ECF7', padding: 12, alignItems: 'center' },
  miniStatValor: { fontSize: 22, fontWeight: 'bold' },
  miniStatLabel: { fontSize: 10, color: '#888', marginTop: 2, textAlign: 'center' },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FFD700', borderRadius: 16,
    paddingVertical: 15, marginBottom: 4,
  },
  btnPrimaryText: { fontSize: 15, fontWeight: '700', color: '#0D1B3E' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#0D1B3E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  infoCard: { backgroundColor: '#F5F8FC', borderRadius: 18, borderWidth: 1.5, borderColor: '#E3ECF7', paddingHorizontal: 16, paddingVertical: 4, marginBottom: 4 },
  filaInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  filaInfoIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E3ECF7' },
  filaInfoLabel: { fontSize: 11, color: '#888', marginBottom: 1 },
  filaInfoValor: { fontSize: 13, fontWeight: '600', color: '#0D1B3E' },
  rutasContainer: { gap: 10, marginBottom: 4 },
  rutaSelectorCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F8FC', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#E3ECF7',
    paddingVertical: 12, paddingHorizontal: 16,
  },
  rutaSelectorCardActivo: {
    backgroundColor: '#FFFBE6', borderColor: '#FFD700',
  },
  rutaSelectorIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#E3ECF7', alignItems: 'center', justifyContent: 'center',
  },
  rutaSelectorIconWrapActivo: {
    backgroundColor: '#FFD700',
  },
  rutaSelectorNombre: {
    fontSize: 14, fontWeight: '700', color: '#0D1B3E',
  },
  rutaSelectorNombreActivo: {
    color: '#0D1B3E',
  },
  rutaSelectorDetalle: {
    fontSize: 11, color: '#888', marginTop: 2,
  },
  radioCircle: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#ccc',
    alignItems: 'center', justifyContent: 'center',
  },
  radioCircleActivo: {
    borderColor: '#0D1B3E',
  },
  radioDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#0D1B3E',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F8FC',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#E3ECF7',
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentBtnActivo: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  segmentTextActivo: {
    color: '#0D1B3E',
  },
});
