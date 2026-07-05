import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function IndicadorParada({ tipoViaje, student }) {
  if (!student) return null;

  const textoParada = tipoViaje === 'ida'
    ? `Recoger a ${student.nombre}`
    : `Entregar a ${student.nombre} en su hogar`;

  return (
    <View style={styles.paradaCard}>
      <View style={styles.paradaHeaderRow}>
        <Ionicons name="location-outline" size={18} color="#00AEEF" />
        <Text style={styles.paradaLabel}>Parada Actual</Text>
      </View>
      <Text style={styles.paradaTexto}>{textoParada}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  paradaCard: {
    backgroundColor: '#F5F8FC',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#00AEEF',
    padding: 16,
    marginBottom: 16,
    flexDirection: 'column',
    gap: 8,
  },
  paradaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paradaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00AEEF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paradaTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
});
