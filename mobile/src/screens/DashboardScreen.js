import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, StatusBar, Alert
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function DashboardScreen({ navigation, route }) {
  const { usuario } = route.params;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }]
      });
    } catch (error) {
        Alert.alert('Error', 'No se pudo cerrar sesión');
        console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B3E" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>
          <Text style={styles.logoBus}>Bus</Text>
          <Text style={styles.logoWay}>Way</Text>
        </Text>
        <View style={styles.headerTitle}>
          <Text style={styles.panelText}>Panel principal</Text>
        </View>
      </View>

      {/* Perfil */}
      <View style={styles.perfil}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
          </Text>
        </View>
        <View>
          <Text style={styles.nombre}>
            {usuario.nombre} {usuario.apellido}
          </Text>
          <Text style={styles.tipo}>
            {usuario.tipo === 'conductor' ? '🚌 Conductor' : '👨‍👧 Padre de familia'}
          </Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {usuario.tipo === 'conductor' ? (
          <>
            <View style={styles.menuRow}>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuText}>Solicitudes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuText}>Viajes</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.menuRow}>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuText}>Notificaciones</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuText}>Pagos</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.menuRow}>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuText}>Marketplace</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuText}>Viajes</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.menuRow}>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuText}>Hijos y QR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuText}>Pagos</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabIconActive}>🏠</Text>
          <Text style={styles.tabLabelActive}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabIcon}>🗺️</Text>
          <Text style={styles.tabLabel}>Ruta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabIcon}>🔔</Text>
          <Text style={styles.tabLabel}>Avisos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={handleLogout}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Salir</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  logoBus: {
    color: '#0D1B3E',
  },
  logoWay: {
    color: '#00AEEF',
  },
  headerTitle: {
    backgroundColor: '#0D1B3E',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  panelText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  perfil: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0D1B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  tipo: {
    fontSize: 14,
    color: '#00AEEF',
    marginTop: 2,
  },
  menu: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  menuRow: {
    flexDirection: 'row',
    gap: 12,
  },
  menuItem: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0D1B3E',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 22,
  },
  tabIconActive: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  tabLabelActive: {
    fontSize: 11,
    color: '#0D1B3E',
    fontWeight: 'bold',
    marginTop: 2,
  },
});