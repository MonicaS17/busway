import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useViaje from './hooks/useViaje';

import ViajeInicio from './componentes/ViajeInicio';
import ViajeAsistencia from './componentes/ViajeAsistencia';
import ViajeActivo from './componentes/ViajeActivo';
import ViajeFinalizado from './componentes/ViajeFinalizado';

export default function ViajeScreen({ navigation, route }) {
  const { usuario, selectedRutaId, ruta_id } = route?.params || {};
  const esPadre = usuario?.tipo === 'padre';
  const insets = useSafeAreaInsets();

  const [hijoSeleccionado, setHijoSeleccionado] = useState(null);
  const [mostrarGrid, setMostrarGrid] = useState(false);

  const activeRutaId = ruta_id || selectedRutaId;
  const activeHijoId = hijoSeleccionado?._id || hijoSeleccionado?.id || null;
  const viaje = useViaje({ usuario, esPadre, selectedHijoId: activeHijoId, selectedRutaId: activeRutaId });

  const uniqueRutas = useMemo(() => {
    if (!esPadre || !viaje.rawHijos) return [];
    return Array.from(new Set(
      viaje.rawHijos.map(h => h.ruta_id?._id?.toString() || h.ruta_id?.toString()).filter(Boolean)
    ));
  }, [esPadre, viaje.rawHijos]);

  const tieneRutasDistintas = uniqueRutas.length > 1;

  // Si viene hijoSeleccionado en route.params
  useEffect(() => {
    if (route?.params?.hijoSeleccionado) {
      setHijoSeleccionado(route.params.hijoSeleccionado);
      setMostrarGrid(false);
    }
  }, [route?.params?.hijoSeleccionado]);

  useEffect(() => {
    if (!esPadre || !viaje.rawHijos || viaje.rawHijos.length === 0) return;

    if (viaje.rawHijos.length === 1 || uniqueRutas.length <= 1) {
      // Caso A o C
      setHijoSeleccionado(viaje.rawHijos[0]);
      setMostrarGrid(false);
    } else {
      // Caso B
      if (!hijoSeleccionado && !route?.params?.hijoSeleccionado) {
        setMostrarGrid(true);
      }
    }
  }, [esPadre, viaje.rawHijos, hijoSeleccionado]);

  if (!usuario) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
          <Text style={styles.errorTitle}>Datos de usuario no disponibles</Text>
          <Text style={styles.errorSub}>Vuelve a ingresar a la pantalla para cargar la información.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (viaje.loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Cargando información del viaje...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (esPadre && mostrarGrid && viaje.rawHijos) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#0D1B3E" />
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerSub}>BusWay</Text>
              <Text style={styles.headerTitle}>Seguimiento</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <View style={styles.card}>
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.hijosMenuContainer}>
              <Text style={styles.menuTitle}>Selecciona un estudiante</Text>
              {viaje.rawHijos.map((hijo) => {
                const schoolName = hijo.ruta_id?.escuela || hijo.ruta_id?.nombre_ruta || 'Escuela asignada';
                return (
                  <TouchableOpacity
                    key={hijo._id}
                    style={styles.hijoMenuItem}
                    onPress={() => {
                      setHijoSeleccionado(hijo);
                      setMostrarGrid(false);
                      navigation.navigate('Viaje', { usuario, hijoSeleccionado: hijo });
                    }}
                  >
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name="person-circle-outline" size={32} color="#0D1B3E" />
                        <Text style={styles.hijoMenuName}>{hijo.nombre}</Text>
                      </View>
                      <Text style={{ fontSize: 13, color: '#666', marginLeft: 42 }}>{schoolName}</Text>
                    </View>
                    <View style={[
                      styles.estadoBadge,
                      { backgroundColor: '#E6F9EE' }
                    ]}>
                      <Text style={[
                        styles.estadoBadgeText,
                        { color: '#16A34A' }
                      ]}>
                        {hijo.estado || 'Activo'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (viaje.error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorSub}>{viaje.error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderStep = () => {
    if (esPadre) {
      return <ViajeActivo esPadre={true} {...viaje} hijoSeleccionado={hijoSeleccionado} bottomInset={insets.bottom} />;
    }

    const { currentStep, tipoViaje } = viaje;

    if (tipoViaje === 'ida' && currentStep === 'ATTENDANCE') {
      return <ViajeActivo esPadre={false} {...viaje} bottomInset={insets.bottom} />;
    }

    switch (viaje.currentStep) {
      case 'PRE_TRIP':
        return <ViajeInicio {...viaje} />;
      case 'SCHOOL_CHECKIN':
        return (
          <ViajeAsistencia
            estudiantes={viaje.estudiantes}
            marcarEstado={viaje.marcarEstado}
            handleQRScanned={viaje.handleQRScanned}
            iniciarRuta={viaje.iniciarRuta}
            bottomInset={insets.bottom}
          />
        );

      // En el caso de viajes de ida, se omite la pantalla de asistencia y se pasa directamente a la pantalla de viaje activo
      case 'ATTENDANCE':
        return (
          <ViajeAsistencia
            estudiantes={viaje.estudiantes}
            marcarEstado={viaje.marcarEstado}
            handleQRScanned={viaje.handleQRScanned}
            iniciarRuta={viaje.iniciarRuta}
            bottomInset={insets.bottom}
          />
        );

      case 'ACTIVE_TRIP':
        return <ViajeActivo esPadre={false} {...viaje} bottomInset={insets.bottom} />;

      case 'MID_JOURNEY_CONFIRM':
        return <ViajeFinalizado {...viaje} bottomInset={insets.bottom} />;

      case 'COMPLETED':
        return <ViajeFinalizado {...viaje} bottomInset={insets.bottom} />;

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B3E" />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerSub}>BusWay</Text>
            <Text style={styles.headerTitle}>{esPadre ? 'Seguimiento' : 'Viaje'}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.card}>
        {esPadre && tieneRutasDistintas && viaje.rawHijos && viaje.rawHijos.length > 1 && (
          <View style={styles.hijosTabsContainer}>
            <TouchableOpacity
              onPress={() => {
                setHijoSeleccionado(null);
                setMostrarGrid(true);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 }}
            >
              <Ionicons name="arrow-back-outline" size={18} color="#0D1B3E" />
              <Text style={styles.btnVolverText}>Cambiar estudiante</Text>
            </TouchableOpacity>
          </View>
        )}
        {renderStep()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B3E' },
  header: { backgroundColor: '#0D1B3E', paddingTop: 8, paddingBottom: 28, paddingHorizontal: '6%' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCenter: { alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  card: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#fff' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  errorTitle: { fontSize: 16, fontWeight: 'bold', color: '#0D1B3E', marginTop: 10 },
  errorSub: { color: '#888', textAlign: 'center', marginTop: 6 },
  hijosMenuContainer: { padding: 20, alignItems: 'center', width: '100%', minHeight: 300, gap: 10 },
  menuTitle: { fontSize: 18, fontWeight: 'bold', color: '#0D1B3E', marginBottom: 20, textAlign: 'center' },
  hijoMenuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F5F8FC', borderWidth: 1.5, borderColor: '#E3ECF7', borderRadius: 16, padding: 16, width: '100%', marginBottom: 12 },
  hijoMenuName: { fontSize: 16, fontWeight: 'bold', color: '#0D1B3E' },
  estadoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E6F9EE', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  estadoBadgeText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  btnVolverText: { fontSize: 14, fontWeight: '600', color: '#0D1B3E' },
  hijosTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: '6%',
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4FA',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  hijoTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F5F8FC',
    borderWidth: 1.5,
    borderColor: '#E3ECF7',
    gap: 4,
  },
  hijoTabActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  hijoTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  hijoTabTextActive: {
    color: '#0D1B3E',
    fontWeight: '700',
  },
});
