import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator, Alert
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../config/api'; //importamos la variable de entorno para la URL del backend

export default function LoginScreen({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (!correo || !contrasena) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setCargando(true);

    // 1. Firebase valida credenciales y genera JWT
      const userCredential = await signInWithEmailAndPassword(auth, correo, contrasena);
      const token = await userCredential.user.getIdToken();

    // 2. Tu Backend verifica el token usando la ruta relativa del endpoint
      const response = await api.post('/api/auth/login', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigation.navigate('Dashboard', { usuario: response.data.usuario });

    } catch (error) {
      // Manejo de errores detallado para saber exactamente qué falló en desarrollo
      if (error.response) {
        Alert.alert('Error del Servidor', JSON.stringify(error.response.data));
      } else if (error.request) {
        Alert.alert('Error de Red', 'No se pudo conectar con el servidor backend de BusWay.');
      } else {
        Alert.alert('Error de Autenticación', 'Correo o contraseña incorrectos');
      }
      console.error('Login error:', error);
    } finally {
      setCargando(false);
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
        <Text style={styles.slogan}>tus hijos seguros en cada ruta</Text>
      </View>

      {/* Formulario */}
      <View style={styles.form}>
        <View style={styles.titleBar}>
          <Text style={styles.title}>Inicio de Sesión</Text>
        </View>

        <View style={styles.fields}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry
          />

          <TouchableOpacity>
            <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnLogin}
            onPress={handleLogin}
            disabled={cargando}
          >
            {cargando
              ? <ActivityIndicator color="#0D1B3E" />
              : <Text style={styles.btnLoginText}>Iniciar Sesión</Text>
            }
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  logoBus: {
    color: '#0D1B3E',
  },
  logoWay: {
    color: '#00AEEF',
  },
  slogan: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  form: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleBar: {
    backgroundColor: '#0D1B3E',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  fields: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
  },
  forgot: {
    color: '#555',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  btnLogin: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  btnLoginText: {
    color: '#0D1B3E',
    fontSize: 16,
    fontWeight: 'bold',
  },
});