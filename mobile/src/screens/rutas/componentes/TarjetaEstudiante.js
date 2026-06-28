import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TarjetaEstudiante({ student }) {
  const nombreEst = student?.nombre || 'Estudiante';
  const zonaEst = student?.zona || 'Arraiján';
  const estadoEst = student?.estado || 'pendiente';
  
  const cfg = {
    pendiente: { color: '#F59E0B' },
    abordo:    { color: '#16A34A' },
    ausente:   { color: '#DC2626' },
    entregado: { color: '#0D1B3E' },
  }[estadoEst] || { color: '#F59E0B' };

  return (
    <View style={styles.asistenciaCard}>
      <View style={styles.asistenciaLeft}>
        <View style={[styles.asistenciaAvatar, { backgroundColor: cfg.color }]}> 
          <Text style={styles.asistenciaAvatarText}>{nombreEst.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.asistenciaNombre}>{nombreEst}</Text>
          <Text style={styles.asistenciaZona}>{zonaEst}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  asistenciaCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#F5F8FC', 
    borderRadius: 14, 
    borderWidth: 1.5, 
    borderColor: '#E3ECF7', 
    padding: 12, 
    marginBottom: 8 
  },
  asistenciaLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    flex: 1 
  },
  asistenciaAvatar: { 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  asistenciaAvatarText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  asistenciaNombre: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#0D1B3E' 
  },
  asistenciaZona: { 
    fontSize: 11, 
    color: '#888', 
    marginTop: 1 
  },
});
