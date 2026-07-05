import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { inicializarNotificaciones } from './src/utils/notifications';

export default function App() {
  useEffect(() => {
    inicializarNotificaciones().catch(err =>
      console.warn('[FCM] Error no crítico:', err)
    );
  }, []);

  return <AppNavigator />;
}