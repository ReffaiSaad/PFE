import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// ⚡ Configuration Firebase
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAO2ytoHv94HL6TasdaHdXA3z9qAYyhKtA",
  authDomain: "pfe-app-df97d.firebaseapp.com",
  projectId: "pfe-app-df97d",
  storageBucket: "pfe-app-df97d.firebasestorage.app",
  messagingSenderId: "877772826760",
  appId: "1:877772826760:web:57ae8d79a69ad710d1173d",
  measurementId: "G-3W53FL9SJ3"
};
// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Nom de la tâche de suivi
const LOCATION_TASK_NAME = 'background-location-task';

// Définition de la tâche d'arrière-plan
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('❌ Erreur tâche arrière-plan:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    if (locations.length > 0) {
      const { coords } = locations[0];
      if (!coords) return;

      console.log('📍 Localisation:', coords.latitude, coords.longitude);

      const deviceId = await AsyncStorage.getItem('device_id');
      if (deviceId) {
        try {
          await setDoc(doc(db, 'localisations', deviceId), {
            latitude: coords.latitude,
            longitude: coords.longitude,
            timestamp: new Date().toISOString(),
          }, { merge: true });
          console.log('✅ Localisation envoyée à Firestore');
        } catch (firebaseError) {
          console.error('🔥 Erreur Firebase:', firebaseError);
        }
      }
    }
  }
});

export default function App() {
  const [deviceId, setDeviceId] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      let id = await AsyncStorage.getItem('device_id');

      if (!id) {
        // ⚡ Première utilisation → Générer un ID unique et afficher l'écran de bienvenue
        id = uuid.v4();
        await AsyncStorage.setItem('device_id', id);
        setIsNewUser(true);
      } else {
        setIsNewUser(false);
      }

      setDeviceId(id);
      await registerDevice(id);
      await requestPermissions();
      await fetchLocation(id);
      setLoading(false);
    };

    initApp();
  }, []);

  const registerDevice = async (id) => {
    try {
      await setDoc(doc(db, 'localisations', id), { id }, { merge: true });
      console.log('✅ Appareil enregistré dans Firestore');
    } catch (error) {
      console.error("❌ Erreur enregistrement:", error);
    }
  };

  const requestPermissions = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      Alert.alert('Permission refusée', 'Activez la localisation pour le suivi.');
      return;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      Alert.alert('Permission en arrière-plan refusée', 'Activez la localisation en arrière-plan.');
      return;
    }

    console.log('✅ Permissions accordées');
    startBackgroundLocation();
  };

  const startBackgroundLocation = async () => {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (!isRunning) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 300000, // 5 min
        distanceInterval: 50,
        foregroundService: {
          notificationTitle: 'Suivi actif',
          notificationBody: 'Votre position est mise à jour.',
        },
      });
      console.log('🚀 Suivi en arrière-plan activé');
    }
  };

  const fetchLocation = async (id) => {
    try {
      const docRef = doc(db, 'localisations', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLocation(docSnap.data());
      }
    } catch (error) {
      console.error("❌ Erreur récupération localisation:", error);
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(deviceId);
    Alert.alert('Succès', 'Code copié !');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (isNewUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Bienvenue sur l'App !</Text>
        <Text>Votre code unique :</Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#2c3e50' }}>{deviceId}</Text>
        <TouchableOpacity
          onPress={copyToClipboard}
          style={{ backgroundColor: '#3498db', padding: 10, borderRadius: 5, marginTop: 10 }}>
          <Text style={{ color: 'white' }}>Copier le code</Text>
        </TouchableOpacity>
        <Text style={{ marginTop: 20 }}>Votre position sera suivie automatiquement.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Localisation Actuelle</Text>
      {location ? (
        <>
          <Text>Latitude : {location.latitude}</Text>
          <Text>Longitude : {location.longitude}</Text>
          <Text style={{ marginTop: 10, color: '#7f8c8d' }}>Mis à jour : {new Date(location.timestamp).toLocaleTimeString()}</Text>
        </>
      ) : (
        <Text>Chargement de votre position...</Text>
      )}
      <TouchableOpacity
        onPress={copyToClipboard}
        style={{ backgroundColor: '#e67e22', padding: 10, borderRadius: 5, marginTop: 20 }}>
        <Text style={{ color: 'white' }}>Copier le code</Text>
      </TouchableOpacity>
    </View>
  );
}
