import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator,
  Alert, ScrollView
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { reconocerTexto } from '../config/vision';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../config/api';
import {
  validarCedula, validarCorreo,
  validarContrasena, validarTelefono,
  mensajeFirebase
} from '../utils/validaciones';

export default function RegisterScreen({ navigation, route }) {
  const { tipo } = route.params;
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [modoCamara, setModoCamara] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  // Datos básicos
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [telefono, setTelefono] = useState('');

  // Estados OCR
  const [cedulaOcrValidada, setCedulaOcrValidada] = useState(false);
  const [licenciaOcrValidada, setLicenciaOcrValidada] = useState(false);
  const [facialVerificado, setFacialVerificado] = useState(false);

  // Datos del vehículo
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [numAsientos, setNumAsientos] = useState('');

  const totalPasos = tipo === 'conductor' ? 4 : 3;

  // ── VALIDAR PASO 1 ──────────────────────────────────────
  const validarPaso1 = () => {
    if (!nombre.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa tu nombre');
      return false;
    }
    if (!apellido.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa tu apellido');
      return false;
    }
    if (!correo.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa tu correo electrónico');
      return false;
    }
    if (!validarCorreo(correo)) {
      Alert.alert('Correo inválido', 'Por favor ingresa un correo electrónico válido (ej: nombre@correo.com)');
      return false;
    }
    if (!contrasena.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa una contraseña');
      return false;
    }
    if (!validarContrasena(contrasena)) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (tipo === 'conductor') {
      if (!telefono.trim()) {
        Alert.alert('Campo requerido', 'Por favor ingresa tu teléfono de contacto');
        return false;
      }
      if (!validarTelefono(telefono)) {
        Alert.alert('Teléfono inválido', 'El formato debe ser: 6500-1234');
        return false;
      }
    }
    return true;
  };

  // ── VALIDAR PASO VEHÍCULO ────────────────────────────────
  const validarPasoVehiculo = () => {
    if (tipo === 'padre') return true;
    if (!placa.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa la placa del bus');
      return false;
    }
    if (!marca.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa la marca del bus');
      return false;
    }
    if (!modelo.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa el modelo del bus');
      return false;
    }
    if (!anio.trim() || isNaN(anio) || anio.length !== 4) {
      Alert.alert('Año inválido', 'Por favor ingresa un año válido (ej: 2018)');
      return false;
    }
    if (!numAsientos.trim() || isNaN(numAsientos)) {
      Alert.alert('Campo requerido', 'Por favor ingresa el número de asientos');
      return false;
    }
    return true;
  };

  // ── ABRIR CÁMARA ─────────────────────────────────────────
  const escanearDocumento = async (modoEscaneo) => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para escanear tu documento');
        return;
      }
    }
    setModoCamara(modoEscaneo);
    setCamaraActiva(true);
  };

  const verificarRostro = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para verificar tu identidad');
        return;
      }
    }
    setModoCamara('facial');
    setCamaraActiva(true);
  };

  // ── TOMAR FOTO ───────────────────────────────────────────
  const tomarFoto = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'La cámara no está lista. Intenta de nuevo.');
      return;
    }
    try {
      setCargando(true);
      console.log('📸 Tomando foto...');

      const foto = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      console.log('✅ Foto tomada:', foto.uri);

      setCamaraActiva(false);

      console.log('🔍 Enviando a Google Vision API...');
      const texto = await reconocerTexto(foto.uri);
      console.log('📄 Texto reconocido:', texto);

      if (modoCamara === 'cedula') procesarOCRCedula(texto);
      else if (modoCamara === 'licencia') procesarOCRLicencia(texto);

    } catch (_error) {
      console.log('❌ Error:', _error.message);
      Alert.alert('Error', `No pudimos leer el documento: ${_error.message}`);
    } finally {
      setCargando(false);
    }
  };

  const capturarRostro = async () => {
    if (!cameraRef.current) return;
    try {
      setCargando(true);
      await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setCamaraActiva(false);
      setFacialVerificado(true);
      Alert.alert('✅ Identidad verificada', 'Tu rostro fue verificado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No pudimos verificar tu identidad. Intenta de nuevo');
    } finally {
      setCargando(false);
    }
  };

  // ── OCR CÉDULA ───────────────────────────────────────────
  const procesarOCRCedula = (texto) => {
  const cedulaRegex = /\d{1,2}-\d{3,4}-\d{1,6}|E-\d{1,2}-\d{1,6}|PE-\d{3,4}-\d{1,6}/;
  const cedulaEncontrada = texto.match(cedulaRegex);

    if (!cedulaEncontrada) {
      Alert.alert(
        'No pudimos leer la cédula',
        'Asegúrate de que la cédula esté bien iluminada y enfocada, luego intenta de nuevo'
      );
      return;
    }

    setCedula(cedulaEncontrada[0]);
    setCedulaOcrValidada(true);
    Alert.alert('✅ Cédula verificada', `Cédula detectada: ${cedulaEncontrada[0]}\nVerifica que sea correcta.`);
  };
  // ── OCR LICENCIA ─────────────────────────────────────────
  const procesarOCRLicencia = (texto) => {
    const tiposValidos = ['TIPO B', 'TYPE B', 'B ', ' B'];
    const esValida = tiposValidos.some(t => texto.includes(t));

    if (esValida) {
      setLicenciaOcrValidada(true);
      Alert.alert('✅ Licencia válida', 'Tu licencia cumple con los requisitos de la ATTT (Tipo B)');
    } else {
      Alert.alert(
        'Licencia no válida',
        'La ATTT exige licencia Tipo B para conducir buses escolares. La licencia escaneada no cumple con este requisito.'
      );
    }
  };

  // ── REGISTRO FINAL ───────────────────────────────────────
  const handleRegister = async () => {
    if (!validarPasoVehiculo()) return;

    try {
      setCargando(true);

      const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
      const firebase_uid = userCredential.user.uid;

      await api.post('/api/auth/register', {
        firebase_uid,
        nombre,
        apellido,
        correo,
        cedula,
        tipo,
        datos_conductor: tipo === 'conductor' ? {
          telefono,
          escuelas_ids: [],
          zona_cobertura: '',
          horario_inicio: '',
          cedula_ocr_validada: cedulaOcrValidada,
          licencia_ocr_validada: licenciaOcrValidada,
          estado_verificacion_att: 'pendiente',
          calificacion_promedio: 0,
          total_resenas: 0,
          metodo_pago: null
        } : null,
        datos_padre: tipo === 'padre' ? {
          cedula_ocr_validada: cedulaOcrValidada,
          facial_verificado: facialVerificado,
          stripe_customer_id: '',
          token_tarjeta: '',
          ultimos_4_digitos: '',
          hijos: []
        } : null,
        vehiculo: tipo === 'conductor' ? {
          placa,
          marca,
          modelo,
          anio: parseInt(anio, 10),
          num_asientos: parseInt(numAsientos, 10),
          estado_verificacion: 'pendiente',
          fecha_vencimiento_verificacion: null
        } : null
      });

      Alert.alert(
        '🎉 ¡Registro exitoso!',
        tipo === 'conductor'
          ? 'Tu cuenta fue creada. Tus documentos están en revisión con la ATTT. Te notificaremos cuando sean aprobados.'
          : 'Tu cuenta fue creada correctamente. Ya puedes iniciar sesión.',
        [{ text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') }]
      );

    } catch (error) {
      if (error.response) {
        Alert.alert('Error del Servidor', JSON.stringify(error.response.data));
      } else if (error.request) {
        Alert.alert('Error de Red', 'No se pudo conectar con el servidor de BusWay.');
      } else {
        Alert.alert('Error en el registro', mensajeFirebase(error.code));
      }
      console.error('Register error:', error);
    } finally {
      setCargando(false);
    }
  };

  // ── VISTA CÁMARA ─────────────────────────────────────────
  if (camaraActiva) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={modoCamara === 'facial' ? 'front' : 'back'}
        />
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraTitle}>
            {modoCamara === 'cedula' && '📄 Apunta al frente de tu cédula'}
            {modoCamara === 'licencia' && '🪪 Apunta al frente de tu licencia'}
            {modoCamara === 'facial' && '🤳 Centra tu rostro en la pantalla'}
          </Text>
          <View style={styles.cameraFrame} />
          <TouchableOpacity
            style={styles.btnCapturar}
            onPress={modoCamara === 'facial' ? capturarRostro : tomarFoto}
          >
            <Text style={styles.btnCapturarText}>
              {cargando ? 'Procesando...' : '📸 Capturar'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancelar} onPress={() => setCamaraActiva(false)}>
            <Text style={styles.btnCancelarText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── PASO 1: DATOS BÁSICOS ────────────────────────────────
  const renderPaso1 = () => (
    <ScrollView style={styles.form}>
      <Text style={styles.pasoTitulo}>Datos personales</Text>
      <Text style={styles.pasoDesc}>Ingresa tu información personal. Tu cédula se verificará en el siguiente paso.</Text>

      <Text style={styles.label}>Nombre *</Text>
      <TextInput style={styles.input} placeholder="Tu nombre" value={nombre} onChangeText={setNombre} />

      <Text style={styles.label}>Apellido *</Text>
      <TextInput style={styles.input} placeholder="Tu apellido" value={apellido} onChangeText={setApellido} />

      <Text style={styles.label}>Correo electrónico *</Text>
      <TextInput
        style={styles.input}
        placeholder="correo@ejemplo.com"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Contraseña *</Text>
      <TextInput
        style={styles.input}
        placeholder="Mínimo 6 caracteres"
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry
      />

      {tipo === 'conductor' && (
        <>
          <Text style={styles.label}>Teléfono de contacto *</Text>
          <TextInput
            style={styles.input}
            placeholder="6500-1234"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
          <Text style={styles.hint}>Este número será visible para los padres en el marketplace</Text>
        </>
      )}

      <TouchableOpacity
        style={styles.btnNext}
        onPress={() => { if (validarPaso1()) setPaso(2); }}
      >
        <Text style={styles.btnNextText}>Continuar →</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ── PASO 2: OCR CÉDULA ───────────────────────────────────
  const renderPaso2 = () => (
    <ScrollView style={styles.form}>
      <Text style={styles.pasoTitulo}>Verificación de cédula</Text>
      <Text style={styles.pasoDesc}>
        Escanea tu cédula para verificar tu identidad. El sistema confirmará que coincida con el nombre y apellido que ingresaste.
      </Text>

      <View style={styles.ocrCard}>
        <Text style={styles.ocrIcon}>🪪</Text>
        <Text style={styles.ocrTitle}>Cédula de identidad</Text>
        <Text style={styles.ocrDesc}>
          Asegúrate de tener buena iluminación y que la cédula esté enfocada y completa en la pantalla
        </Text>

        {cedulaOcrValidada ? (
          <View style={styles.validadoBadge}>
            <Text style={styles.validadoText}>✅ Cédula verificada — {cedula}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.btnOcr} onPress={() => escanearDocumento('cedula')}>
            <Text style={styles.btnOcrText}>📷 Escanear cédula</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.botonesNav}>
        <TouchableOpacity style={styles.btnBack} onPress={() => setPaso(1)}>
          <Text style={styles.btnBackText}>← Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnNext, { flex: 1 }, !cedulaOcrValidada && styles.btnDisabled]}
          onPress={() => {
            if (cedulaOcrValidada) setPaso(3);
            else Alert.alert('Requerido', 'Debes escanear tu cédula para continuar');
          }}
        >
          <Text style={styles.btnNextText}>Continuar →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ── PASO 3: OCR LICENCIA o FACIAL ───────────────────────
  const renderPaso3 = () => (
    <ScrollView style={styles.form}>
      {tipo === 'conductor' ? (
        <>
          <Text style={styles.pasoTitulo}>Verificación de licencia</Text>
          <Text style={styles.pasoDesc}>La ATTT exige licencia Tipo B para conducir buses escolares en Panamá</Text>

          <View style={styles.ocrCard}>
            <Text style={styles.ocrIcon}>🪪</Text>
            <Text style={styles.ocrTitle}>Licencia de conducir</Text>
            <Text style={styles.ocrDesc}>
              El sistema verificará automáticamente que tu licencia sea de Tipo B según los requisitos de la ATTT
            </Text>
            {licenciaOcrValidada ? (
              <View style={styles.validadoBadge}>
                <Text style={styles.validadoText}>✅ Licencia Tipo B verificada</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.btnOcr} onPress={() => escanearDocumento('licencia')}>
                <Text style={styles.btnOcrText}>📷 Escanear licencia</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.pasoTitulo}>Verificación de identidad</Text>
          <Text style={styles.pasoDesc}>Necesitamos verificar tu identidad mediante reconocimiento facial</Text>

          <View style={styles.ocrCard}>
            <Text style={styles.ocrIcon}>🤳</Text>
            <Text style={styles.ocrTitle}>Reconocimiento facial</Text>
            <Text style={styles.ocrDesc}>
              Colócate en un lugar bien iluminado y mira directamente a la cámara frontal
            </Text>
            {facialVerificado ? (
              <View style={styles.validadoBadge}>
                <Text style={styles.validadoText}>✅ Identidad verificada</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.btnOcr} onPress={verificarRostro}>
                <Text style={styles.btnOcrText}>🤳 Verificar identidad</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      <View style={styles.botonesNav}>
        <TouchableOpacity style={styles.btnBack} onPress={() => setPaso(2)}>
          <Text style={styles.btnBackText}>← Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.btnNext, { flex: 1 },
            !(tipo === 'conductor' ? licenciaOcrValidada : facialVerificado) && styles.btnDisabled
          ]}
          onPress={() => {
            const validado = tipo === 'conductor' ? licenciaOcrValidada : facialVerificado;
            if (validado) setPaso(4);
            else Alert.alert(
              'Requerido',
              tipo === 'conductor'
                ? 'Debes escanear tu licencia para continuar'
                : 'Debes verificar tu identidad para continuar'
            );
          }}
        >
          <Text style={styles.btnNextText}>Continuar →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ── PASO 4: VEHÍCULO o RESUMEN ───────────────────────────
  const renderPaso4 = () => (
    <ScrollView style={styles.form}>
      {tipo === 'conductor' ? (
        <>
          <Text style={styles.pasoTitulo}>Datos del bus</Text>
          <Text style={styles.pasoDesc}>
            Esta información será verificada por el sistema según los registros de la ATTT
          </Text>

          <Text style={styles.label}>Placa *</Text>
          <TextInput
            style={styles.input}
            placeholder="BC-1234"
            value={placa}
            onChangeText={setPlaca}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Marca *</Text>
          <TextInput style={styles.input} placeholder="Toyota" value={marca} onChangeText={setMarca} />

          <Text style={styles.label}>Modelo *</Text>
          <TextInput style={styles.input} placeholder="Coaster" value={modelo} onChangeText={setModelo} />

          <Text style={styles.label}>Año *</Text>
          <TextInput
            style={styles.input}
            placeholder="2018"
            value={anio}
            onChangeText={setAnio}
            keyboardType="numeric"
            maxLength={4}
          />

          <Text style={styles.label}>Número de asientos *</Text>
          <TextInput
            style={styles.input}
            placeholder="20"
            value={numAsientos}
            onChangeText={setNumAsientos}
            keyboardType="numeric"
          />

          <View style={styles.infoBadge}>
            <Text style={styles.infoText}>
              {'ℹ️ Tu registro quedará en estado "Pendiente de verificación" hasta que el sistema valide tus datos con la ATTT'}
            </Text>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.pasoTitulo}>¡Todo listo!</Text>
          <Text style={styles.pasoDesc}>
            Tu cuenta está lista para ser creada. Podrás agregar a tus hijos después de iniciar sesión.
          </Text>

          <View style={styles.resumenCard}>
            <Text style={styles.resumenItem}>✅ Datos personales</Text>
            <Text style={styles.resumenItem}>✅ Cédula verificada — {cedula}</Text>
            <Text style={styles.resumenItem}>✅ Identidad verificada</Text>
            <Text style={styles.resumenItem}>💳 Tarjeta — se registra al contratar servicio</Text>
          </View>
        </>
      )}

      <View style={styles.botonesNav}>
        <TouchableOpacity style={styles.btnBack} onPress={() => setPaso(3)}>
          <Text style={styles.btnBackText}>← Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnRegister, cargando && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={cargando}
        >
          {cargando
            ? <ActivityIndicator color="#0D1B3E" />
            : <Text style={styles.btnRegisterText}>Crear cuenta</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B3E" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {tipo === 'conductor' ? 'Registro — Conductor' : 'Registro — Padre de familia'}
        </Text>
        <View style={styles.pasos}>
          {Array.from({ length: totalPasos }).map((_, i) => (
            <View key={i} style={[styles.pasoDot, paso >= i + 1 && styles.pasoDotActivo]} />
          ))}
        </View>
        <Text style={styles.pasoLabel}>Paso {paso} de {totalPasos}</Text>
      </View>

      {paso === 1 && renderPaso1()}
      {paso === 2 && renderPaso2()}
      {paso === 3 && renderPaso3()}
      {paso === 4 && renderPaso4()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#0D1B3E',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  back: { color: '#fff', fontSize: 14, marginBottom: 6 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  pasos: { flexDirection: 'row', gap: 6, marginTop: 12 },
  pasoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  pasoDotActivo: { backgroundColor: '#FFD700' },
  pasoLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  form: { flex: 1, padding: 20 },
  pasoTitulo: { fontSize: 22, fontWeight: 'bold', color: '#0D1B3E', marginBottom: 6 },
  pasoDesc: { fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 20 },
  label: { fontSize: 14, color: '#333', marginBottom: 6, marginTop: 12 },
  hint: { fontSize: 12, color: '#888', marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 16,
    fontSize: 15, backgroundColor: '#f9f9f9',
  },
  btnNext: {
    backgroundColor: '#FFD700', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 24,
  },
  btnNextText: { color: '#0D1B3E', fontSize: 16, fontWeight: 'bold' },
  btnBack: {
    backgroundColor: '#f0f0f0', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center',
  },
  btnBackText: { color: '#333', fontSize: 15 },
  btnDisabled: { opacity: 0.4 },
  botonesNav: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 40 },
  btnRegister: {
    flex: 1, backgroundColor: '#FFD700', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  btnRegisterText: { color: '#0D1B3E', fontSize: 16, fontWeight: 'bold' },
  ocrCard: {
    backgroundColor: '#f8f9fa', borderRadius: 16,
    padding: 24, alignItems: 'center', marginTop: 12,
    borderWidth: 1, borderColor: '#eee',
  },
  ocrIcon: { fontSize: 48, marginBottom: 12 },
  ocrTitle: { fontSize: 18, fontWeight: 'bold', color: '#0D1B3E', marginBottom: 8 },
  ocrDesc: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
  btnOcr: {
    backgroundColor: '#0D1B3E', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 28, marginTop: 20,
  },
  btnOcrText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  validadoBadge: {
    backgroundColor: '#E6F9EE', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 20, marginTop: 20,
  },
  validadoText: { color: '#085041', fontSize: 15, fontWeight: '600' },
  infoBadge: {
    backgroundColor: '#FFF8DC', borderRadius: 10,
    padding: 14, marginTop: 16, borderWidth: 1, borderColor: '#FFD700',
  },
  infoText: { color: '#633806', fontSize: 13, lineHeight: 18 },
  resumenCard: {
    backgroundColor: '#f8f9fa', borderRadius: 16,
    padding: 20, marginTop: 16, gap: 12,
  },
  resumenItem: { fontSize: 15, color: '#333' },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 40,
  },
  cameraTitle: {
    color: '#fff', fontSize: 18, fontWeight: 'bold',
    textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12, borderRadius: 10,
  },
  cameraFrame: {
    width: 280, height: 180,
    borderWidth: 2, borderColor: '#FFD700', borderRadius: 12,
  },
  btnCapturar: {
    backgroundColor: '#FFD700', borderRadius: 50,
    paddingVertical: 16, paddingHorizontal: 40,
  },
  btnCapturarText: { color: '#0D1B3E', fontSize: 16, fontWeight: 'bold' },
  btnCancelar: { paddingVertical: 10 },
  btnCancelarText: { color: '#fff', fontSize: 15 },
});