import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function ViajeAsistencia({
  estudiantes,
  marcarEstado,
  handleQRScanned,
  iniciarRuta,
  bottomInset
}) {
  const [tabActivo, setTabActivo] = useState('lista'); // 'lista' | 'qr'
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
    <View style={{ flex: 1 }}>
      {/* Tabs QR / Lista */}
      <View style={styles.tabsInternos}>
        <TouchableOpacity
          style={[styles.tabInterno, tabActivo === 'qr' && styles.tabInternoActivo]}
          onPress={async () => {
            if (!permission?.granted) await requestPermission();
            setTabActivo('qr');
          }}
        >
          <Ionicons name="qr-code-outline" size={16} color={tabActivo === 'qr' ? '#0D1B3E' : '#aaa'} />
          <Text style={[styles.tabInternoText, tabActivo === 'qr' && styles.tabInternoTextActivo]}>
            Escanear QR
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabInterno, tabActivo === 'lista' && styles.tabInternoActivo]}
          onPress={() => setTabActivo('lista')}
        >
          <Ionicons name="list-outline" size={16} color={tabActivo === 'lista' ? '#0D1B3E' : '#aaa'} />
          <Text style={[styles.tabInternoText, tabActivo === 'lista' && styles.tabInternoTextActivo]}>
            Lista manual
          </Text>
        </TouchableOpacity>
      </View>

      {tabActivo === 'qr' ? (
        // ── LECTOR QR ──────────────────────────────────────────────────────
        <View style={{ flex: 1 }}>
          {permission?.granted ? (
            <View style={{ flex: 1 }}>
              <CameraView
                style={{ flex: 1 }}
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
                <Text style={styles.qrInstruccion}>
                  Apunta al QR del estudiante
                </Text>
              </View>
              {/* Barra inferior con safe area */}
              <View style={[styles.qrBottomBar, { paddingBottom: safeBottom + 8 }]}>
                <View style={styles.miniStats}>
                  <MiniStat valor={abordo}    label="A bordo"   color="#16A34A" />
                  <MiniStat valor={pendiente} label="Pendiente" color="#F59E0B" />
                  <MiniStat valor={ausente}   label="Ausente"   color="#DC2626" />
                </View>
                <TouchableOpacity style={styles.btnIniciarRuta} onPress={iniciarRuta}>
                  <Ionicons name="navigate" size={18} color="#0D1B3E" />
                  <Text style={styles.btnIniciarRutaText}>Iniciar Ruta</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.permisoContainer}>
              <Ionicons name="camera-outline" size={48} color="#C8D6E5" />
              <Text style={styles.permisoTitle}>Permiso de cámara requerido</Text>
              <Text style={styles.permisoDesc}>Necesitamos acceso a la cámara para escanear los códigos QR de los estudiantes.</Text>
              <TouchableOpacity style={styles.btnPrimary} onPress={requestPermission}>
                <Text style={styles.btnPrimaryText}>Conceder permiso</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        // ── LISTA MANUAL ───────────────────────────────────────────────────
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingHorizontal: '6%', paddingTop: 16, paddingBottom: 20 }}>
            <Text style={styles.sectionLabel}>Lista de asistencia</Text>
            <Text style={styles.sectionSub}>Marca el estado de cada estudiante manualmente</Text>

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
                    <TouchableOpacity
                      style={[styles.btnAsistencia, estadoEst === 'abordo' && styles.btnAsistenciaActivo]}
                      onPress={() => marcarEstado(est?.id, 'abordo')}
                    >
                      <Ionicons name="checkmark" size={16} color={estadoEst === 'abordo' ? '#fff' : '#16A34A'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnAsistencia, estadoEst === 'ausente' && styles.btnAusenteActivo]}
                      onPress={() => marcarEstado(est?.id, 'ausente')}
                    >
                      <Ionicons name="close" size={16} color={estadoEst === 'ausente' ? '#fff' : '#DC2626'} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer fijo con safe area */}
          <View style={[styles.listaFooter, { paddingBottom: safeBottom + 8 }]}>
            <View style={styles.miniStats}>
              <MiniStat valor={abordo}    label="A bordo"   color="#16A34A" />
              <MiniStat valor={pendiente} label="Pendiente" color="#F59E0B" />
              <MiniStat valor={ausente}   label="Ausente"   color="#DC2626" />
            </View>
            <TouchableOpacity style={styles.btnIniciarRuta} onPress={iniciarRuta}>
              <Ionicons name="navigate" size={18} color="#0D1B3E" />
              <Text style={styles.btnIniciarRutaText}>Iniciar Ruta</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  tabsInternos: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E3ECF7', backgroundColor: '#fff', paddingHorizontal: '6%' },
  tabInterno: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabInternoActivo: { borderBottomColor: '#0D1B3E' },
  tabInternoText: { fontSize: 13, color: '#aaa', fontWeight: '500' },
  tabInternoTextActivo: { color: '#0D1B3E', fontWeight: '700' },
  qrOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  qrFrame: { width: 240, height: 240, position: 'relative' },
  qrCorner: { position: 'absolute', width: 30, height: 30, borderColor: '#FFD700', borderWidth: 3 },
  qrCornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  qrCornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  qrCornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  qrCornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  qrInstruccion: { position: 'absolute', bottom: -50, color: '#fff', fontWeight: '600', fontSize: 14, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  qrBottomBar: { backgroundColor: '#fff', paddingHorizontal: '6%', paddingTop: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 8 },
  miniStats: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  miniStatCard: { flex: 1, backgroundColor: '#F5F8FC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E3ECF7', padding: 12, alignItems: 'center' },
  miniStatValor: { fontSize: 22, fontWeight: 'bold' },
  miniStatLabel: { fontSize: 10, color: '#888', marginTop: 2, textAlign: 'center' },
  btnIniciarRuta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FFD700', borderRadius: 14,
    paddingVertical: 14, marginTop: 10,
  },
  btnIniciarRutaText: { fontSize: 15, fontWeight: '700', color: '#0D1B3E' },
  permisoContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: '10%', gap: 12 },
  permisoTitle: { fontSize: 18, fontWeight: 'bold', color: '#0D1B3E' },
  permisoDesc: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FFD700', borderRadius: 16,
    paddingVertical: 15, marginBottom: 4,
  },
  btnPrimaryText: { fontSize: 15, fontWeight: '700', color: '#0D1B3E' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#0D1B3E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  sectionSub: { fontSize: 12, color: '#888', marginBottom: 14, marginTop: -6 },
  asistenciaCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F5F8FC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E3ECF7', padding: 12, marginBottom: 8 },
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
