// App.jsx (full file)
// - Ensures registerDeviceForRemoteMessages() happens BEFORE getAPNSToken()
// - Shows APNs READY/WAITING/ERROR banner
// - Persists tokens in AsyncStorage
// - Keeps your SocketClient + AdminPanel usage intact

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SocketClient from './components/SocketClient';
import AdminPanel from './components/AdminPanel';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [events, setEvents] = useState([]);

  // ====== APNs status UI ======
  const isIOS = Platform.OS === 'ios';
  const [apnsStatus, setApnsStatus] = useState('idle'); // idle | waiting | ready | error
  const [apnsToken, setApnsToken] = useState(null);
  const [apnsError, setApnsError] = useState(null);

  // ====== Permission helper ======
  const requestUserPermission = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!enabled) console.log('Notifications not authorized:', authStatus);
      return enabled;
    } catch (err) {
      console.log('Permission request error:', err);
      return false;
    }
  };

  // ====== Register for remote messages (must happen BEFORE getAPNSToken) ======
  const ensureRemoteRegistration = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      return true;
    } catch (e) {
      console.log('registerDeviceForRemoteMessages failed:', e);
      return false;
    }
  };

  // ====== Poll APNs token for a short window (iOS can be slightly delayed) ======
  const pollAPNSToken = async (timeoutMs = 12000, intervalMs = 800) => {
    setApnsStatus('waiting');
    setApnsError(null);
    const start = Date.now();
    let lastErr = null;

    while (Date.now() - start < timeoutMs) {
      try {
        const t = await messaging().getAPNSToken();
        if (t) {
          setApnsToken(t);
          setApnsStatus('ready');
          await AsyncStorage.setItem('apnToken', t);
          console.log('🍏 APNs Token (hex):', t);
          return t;
        }
      } catch (e) {
        lastErr = e;
      }
      await new Promise(r => setTimeout(r, intervalMs));
    }

    setApnsStatus('error');
    setApnsError(
      lastErr ? String(lastErr) : 'Timed out waiting for APNs token.'
    );
    return null;
  };

  // ====== Foreground message listener ======
  useEffect(() => {
    const unsub = messaging().onMessage(async msg => {
      console.log('>>> FCM foreground message:', msg);
    });
    return unsub;
  }, []);

  // ====== One-time init to avoid “unregistered” error ======
  useEffect(() => {
    (async () => {
      // 1) Ask permission first (iOS)
      await requestUserPermission();

      // 2) Register for remote messages (CRITICAL before getAPNSToken)
      const regOk = await ensureRemoteRegistration();

      // 3) iOS only: try immediate APNs, else poll
      if (isIOS && regOk) {
        // Try once quickly
        try {
          const t = await messaging().getAPNSToken();
          if (t) {
            setApnsToken(t);
            setApnsStatus('ready');
            await AsyncStorage.setItem('apnToken', t);
            console.log('🍏 APNs Token (hex):', t);
          } else {
            await pollAPNSToken(); // do a short poll window
          }
        } catch (e) {
          // If you see [messaging/unregistered] here, it means registerDeviceForRemoteMessages() wasn’t awaited.
          setApnsStatus('error');
          setApnsError(String(e));
          console.log('APNs immediate fetch error:', e);
        }
      }

      // 4) Optionally send tokens to your backend (kept from your code)
      try {
        await sendTokensToBackend();
      } catch (e) {
        console.log('sendTokensToBackend failed:', e?.message || e);
      }
    })();
  }, []);

  // ====== Your original backend sender (refined to be order-safe) ======
  const sendTokensToBackend = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages(); // safe second call (no-op if already)
      let apns = null;

      if (isIOS) {
        apns = apnsToken || (await messaging().getAPNSToken());
        if (apns) await AsyncStorage.setItem('apnToken', apns);
      }

      let fcm = null;
      if (Platform.OS === 'android') {
        fcm = await messaging().getToken();
        if (fcm) await AsyncStorage.setItem('fcmToken', fcm);
      }

      await axios.post('https://benefit-notification.onrender.com/save-token', {
        fcmToken: fcm,
        apnToken: apns || null,
      });

      console.log('✅ Tokens sent to backend');
    } catch (error) {
      console.error('Error sending token:', error);
      throw error;
    }
  };

  // ====== APNs Debug UI ======
  const APNsBadge = useMemo(() => {
    if (!isIOS) return null;
    let bg = '#475569', label = 'APNs: idle';
    if (apnsStatus === 'waiting') { bg = '#f59e0b'; label = 'APNs: WAITING'; }
    if (apnsStatus === 'ready')   { bg = '#10b981'; label = 'APNs: READY'; }
    if (apnsStatus === 'error')   { bg = '#ef4444'; label = 'APNs: ERROR'; }
    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={styles.badgeText}>{label}</Text>
      </View>
    );
  }, [apnsStatus, isIOS]);

  const refreshAPNs = async () => {
    if (!isIOS) return Alert.alert('APNs', 'APNs is iOS-only.');
    const ok = await ensureRemoteRegistration(); // <—— critical
    if (ok) await pollAPNSToken();
  };

  const showAPNs = () => {
    Alert.alert('APNs Token', apnsToken || 'No token yet.');
  };

  // ====== Your existing socket/admin UI ======
  const handleEvent = (eventData) => setEvents(prev => [eventData, ...prev]);
  const clearEvents = () => setEvents([]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        {isIOS && (
          <View style={styles.apnsBar}>
            <View style={styles.apnsRow}>
              {APNsBadge}
              <TouchableOpacity onPress={refreshAPNs} style={styles.btn}>
                <Text style={styles.btnText}>Refresh</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={showAPNs} style={[styles.btn, styles.btnOutline]}>
                <Text style={styles.btnText}>Show</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.apnsToken} numberOfLines={1} ellipsizeMode="middle">
              {apnsToken ? `APNs: ${apnsToken}` : 'APNs token pending…'}
            </Text>
            {apnsStatus === 'error' && !!apnsError && (
              <Text style={styles.apnsErr}>Error: {apnsError}</Text>
            )}
          </View>
        )}

        <SocketClient onEvent={handleEvent}>
          {({ connected, socketUrl, checkConnection, soundService }) => (
            <AdminPanel
              events={events}
              connected={connected}
              onClearEvents={clearEvents}
              socketUrl={socketUrl}
              checkConnection={checkConnection}
              soundService={soundService}
            />
          )}
        </SocketClient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  apnsBar: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0B1220',
  },
  apnsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  badgeText: { color: '#fff', fontWeight: '700' },
  btn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#334155' },
  btnOutline: { borderWidth: 1, borderColor: '#64748b', backgroundColor: 'transparent' },
  btnText: { color: '#fff', fontWeight: '600' },
  apnsToken: { color: '#cbd5e1', fontSize: 12 },
  apnsErr: { color: '#FCA5A5', fontSize: 12, marginTop: 4 },
});
