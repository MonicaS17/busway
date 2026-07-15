import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function ViajeAsistencia({
  estudiantes,
  marcarEstado,
  handleQRScanned,
  iniciarRuta,
  bottomInset
}) {
  const [camaraActiva, setCamaraActiva] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();

  const abordo = estudiantes.filter(e => e.estado === 'abordo').length;
  const pendiente = estudiantes.filter(e => e.estado === 'pendiente').length;
  const ausente = estudiantes.filter(e => e.estado === 'ausente').length;

  const safeBottom = Math.max(bottomInset || 0, 16);

  const getSafeText = (value, fallback = '') => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed || fallback;
    }
    return fallback;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Sección de la Cámara QR */}
      <View style={styles.camaraSection}>
        {camaraActiva ? (
          permission?.granted ? (
            <View style={styles.camaraContainer}>
              <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={handleQRScanned}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              />
              <View style={styles.qrOverlay}>
                <View style={styles.qrFrame}>
                  <View style={[styles.qrCorner, styles.qrCornerTL]} />
                  <View style={[styles.qrCorner, styles.qrCornerTR]} />
                  <View style={[styles.qrCorner, styles.qrCornerBL]} />
                  <View style={[styles.qrCorner, styles.qrCornerBR]} />
                </View>
              </View>
              <TouchableOpacity
                style={styles.btnToggleCamara}
                onPress={() => setCamaraActiva(false)}
              >
                <Ionicons name="camera-reverse-outline" size={16} color="#fff" />
                <Text style={styles.btnToggleCamaraText}>Ocultar Cámara</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.permisoCamaraMini}>
              <Ionicons name="camera-outline" size={30} color="#94A3B8" />
              <Text style={styles.permisoCamaraMiniText}>Se requiere permiso de cámara</Text>
              <TouchableOpacity style={styles.btnPermisoMini} onPress={requestPermission}>
                <Text style={styles.btnPermisoMiniText}>Conceder</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <TouchableOpacity
            style={styles.camaraPlaceholder}
            onPress={async () => {
              if (!permission?.granted) await requestPermission();
              setCamaraActiva(true);
            }}
          >
            <Ionicons name="qr-code-outline" size={24} color="#0D1B3E" />
            <Text style={styles.camaraPlaceholderText}>Activar Escáner QR</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de Estudiantes (Scrollable) */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: '6%', paddingTop: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Pase de asistencia</Text>
        <Text style={styles.sectionSub}>Escanea el QR del estudiante o márcalo manualmente abajo:</Text>

        {estudiantes.map((est) => {
          const nombreEst = getSafeText(est?.nombre, 'Estudiante');
          const zonaEst = getSafeText(est?.zona, 'Arraiján');
          const estadoEst = est?.estado || 'pendiente';
          const cfg = {
            pendiente: { color: '#F59E0B', bg: '#FFF8E1', texto: 'Pendiente' },
            abordo:    { color: '#16A34A', bg: '#E6F9EE', texto: 'A bordo'   },
            ausente:   { color: '#DC2626', bg: '#FEE2E2', texto: 'Ausente'   },
          }[estadoEst] || { color: '#F59E0B', bg: '#FFF8E1', texto: 'Pendiente' };

          return (
            <View key={est?.id || nombreEst} style={styles.asistenciaCard}>
              <View style={styles.asistenciaLeft}>
                <View style={[styles.asistenciaAvatar, { backgroundColor: cfg.color }]}> 
                  <Text style={styles.asistenciaAvatarText}>{nombreEst.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.asistenciaNombre}>{nombreEst}</Text>
                  <Text style={styles.asistenciaZona}>{zonaEst}</Text>
                </View>
              </View>
              <View style={styles.asistenciaBotones}>
                {/* Botón A bordo / Check */}
                <TouchableOpacity
                  style={[
                    styles.btnAsistencia,
                    estadoEst === 'abordo' ? styles.btnAsistenciaActivo : { borderColor: '#16A34A' }
                  ]}
                  onPress={() => marcarEstado(est?.id, estadoEst === 'abordo' ? 'pendiente' : 'abordo')}
                >
                  <Ionicons name="checkmark" size={16} color={estadoEst === 'abordo' ? '#fff' : '#16A34A'} />
                </TouchableOpacity>

                {/* Botón Ausente / Cruz */}
                <TouchableOpacity
                  style={[
                    styles.btnAsistencia,
                    estadoEst === 'ausente' ? styles.btnAusenteActivo : { borderColor: '#DC2626' }
                  ]}
                  onPress={() => marcarEstado(est?.id, estadoEst === 'ausente' ? 'pendiente' : 'ausente')}
                >
                  <Ionicons name="close" size={16} color={estadoEst === 'ausente' ? '#fff' : '#DC2626'} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer Fijo */}
      <View style={[styles.listaFooter, { paddingBottom: safeBottom + 8 }]}>
        <View style={styles.miniStats}>
          <MiniStat valor={abordo}    label="A bordo"   color="#16A34A" />
          <MiniStat valor={pendiente} label="Pendiente" color="#F59E0B" />
          <MiniStat valor={ausente}   label="Ausente"   color="#DC2626" />
        </View>
        <TouchableOpacity style={styles.btnIniciarRuta} onPress={iniciarRuta}>
          <Ionicons name="navigate" size={18} color="#0D1B3E" />
          <Text style={styles.btnIniciarRutaText}>Confirmar e Iniciar Viaje</Text>
        </TouchableOpacity>
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
  camaraSection: {
    height: 200,
    backgroundColor: '#0D1B3E',
    overflow: 'hidden',
  },
  camaraContainer: {
    flex: 1,
    position: 'relative',
  },
  camaraPlaceholder: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F0FE',
    borderBottomWidth: 1.5,
    borderBottomColor: '#00AEEF',
    gap: 8,
  },
  camaraPlaceholderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D1B3E',
  },
  permisoCamaraMini: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    gap: 4,
    paddingHorizontal: 20,
  },
  permisoCamaraMiniText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  btnPermisoMini: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  btnPermisoMiniText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D1B3E',
  },
  btnToggleCamara: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  btnToggleCamaraText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  qrOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  qrFrame: { width: 140, height: 140, position: 'relative' },
  qrCorner: { position: 'absolute', width: 20, height: 20, borderColor: '#FFD700', borderWidth: 3 },
  qrCornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  qrCornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  qrCornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  qrCornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  miniStats: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  miniStatCard: { flex: 1, backgroundColor: '#F5F8FC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E3ECF7', padding: 12, alignItems: 'center' },
  miniStatValor: { fontSize: 22, fontWeight: 'bold' },
  miniStatLabel: { fontSize: 10, color: '#888', marginTop: 2, textAlign: 'center' },
  btnIniciarRuta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FFD700', borderRadius: 14,
    paddingVertical: 14,
  },
  btnIniciarRutaText: { fontSize: 15, fontWeight: '700', color: '#0D1B3E' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#0D1B3E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  sectionSub: { fontSize: 12, color: '#888', marginBottom: 14, marginTop: -6 },
  asistenciaCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#E3ECF7', padding: 12, marginBottom: 8 },
  asistenciaLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  asistenciaAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  asistenciaAvatarText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  asistenciaNombre: { fontSize: 14, fontWeight: '700', color: '#0D1B3E' },
  asistenciaZona: { fontSize: 11, color: '#888', marginTop: 1 },
  asistenciaBotones: { flexDirection: 'row', gap: 8 },
  btnAsistencia: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  btnAsistenciaActivo: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  btnAusenteActivo: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  listaFooter: { backgroundColor: '#fff', paddingHorizontal: '6%', paddingTop: 14, borderTopWidth: 1, borderTopColor: '#E3ECF7' },
});
