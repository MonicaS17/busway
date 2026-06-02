import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar} from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B3E" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Bienvenido</Text>
      </View>

      {/* Logo y slogan */}
      <View style={styles.body}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            <Text style={styles.logoBus}>Bus</Text>
            <Text style={styles.logoWay}>Way</Text>
          </Text>
          <Text style={styles.slogan}>tus hijos <Text style={styles.seguros}>seguros</Text> en cada ruta</Text>
        </View>

        {/* Botones */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.btnConductor}
            onPress={() => navigation.navigate('Register', { tipo: 'conductor' })}
          >
            <Text style={styles.btnConductorText}>👤 Soy Conductor</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnPadre}
            onPress={() => navigation.navigate('Register', { tipo: 'padre' })}
          >
            <Text style={styles.btnPadreText}>👨‍👧 Soy Padre de familia</Text>
            <Text style={styles.arrowDark}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <TouchableOpacity
        style={styles.footer}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.footerText}>Ya tengo cuenta →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#0D1B3E',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logoBus: {
    color: '#0D1B3E',
  },
  logoWay: {
    color: '#00AEEF',
  },
  slogan: {
    fontSize: 16,
    color: '#555',
  },
  seguros: {
    color: '#00AEEF',
    fontWeight: 'bold',
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  btnConductor: {
    backgroundColor: '#0D1B3E',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnConductorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  arrow: {
    color: '#fff',
    fontSize: 24,
  },
  btnPadre: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#0D1B3E',
  },
  btnPadreText: {
    color: '#0D1B3E',
    fontSize: 16,
    fontWeight: '600',
  },
  arrowDark: {
    color: '#0D1B3E',
    fontSize: 24,
  },
  footer: {
    backgroundColor: '#0D1B3E',
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 16,
  },
});