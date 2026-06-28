import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useViaje from './hooks/useViaje';

import ViajeInicio from './componentes/ViajeInicio';
import ViajeAsistencia from './componentes/ViajeAsistencia';
import ViajeActivo from './componentes/ViajeActivo';
import ViajeFinalizado from './componentes/ViajeFinalizado';

export default function ViajeScreen({ navigation, route }) {
  const { usuario } = route?.params || {};
  const esPadre = usuario?.tipo === 'padre';
  const insets = useSafeAreaInsets();

  const viaje = useViaje({ usuario, esPadre });

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
      return <ViajeActivo esPadre={true} {...viaje} bottomInset={insets.bottom} />;
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
});
