import React, { useState, useEffect } from 'react';
import { getPayload } from '../services/api.js';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';

const AdminPanel = ({
  events,
  connected,
  onClearEvents,
  socketUrl,
  soundService,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [response, setResponse] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayload = async () => {
      try {
        const data = await getPayload();
        setResponse(data.data || []); // ✅ Pick array only
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      }
    };
    fetchPayload();
  }, []);

  const formatTime = timestamp => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const clearEvents = () => {
    Alert.alert('Clear Events', 'Are you sure you want to clear all events?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', onPress: () => onClearEvents && onClearEvents() },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.bellIcon}>🔔</Text>
          <View>
            <Text style={styles.adminText}>Admin</Text>
            <Text style={styles.alertsText}>Alerts</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.socketStatus}>
            Socket: {connected ? `connected ` : 'disconnected'}
          </Text>
          <View style={styles.soundStatusContainer}>
            <Text style={styles.soundStatus}>
              Sound: {soundEnabled ? 'enabled' : 'disabled'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Sound Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sound Settings</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.soundButton}
              onPress={() => {
                setSoundEnabled(true);
                soundService?.setEnabled(true);
              }}
            >
              <Text style={styles.buttonText}>Enable Sound</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.soundButton, styles.testButton]}
              onPress={() => {
                soundService?.testSound();
              }}
            >
              <Text style={styles.buttonText}>Test Sound</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.soundButton, styles.muteButton]}
              onPress={() => {
                setSoundEnabled(false);
                soundService?.setEnabled(false);
              }}
            >
              <Text style={styles.buttonText}>Mute</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.volumeContainer}>
            <Text style={styles.volumeLabel}>Volume</Text>
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={value => {
                setVolume(value);
                soundService?.setVolume(value);
              }}
              minimumTrackTintColor="#8B5CF6"
              maximumTrackTintColor="#374151"
              thumbStyle={styles.sliderThumb}
            />
          </View>
          <Text style={styles.soundDescription}>
            Chime will play only for events with type call_click.
          </Text>
        </View>

        {/* Connection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <Text style={styles.connectionLabel}>Socket Server URL</Text>
          <View style={styles.urlContainer}>
            <Text style={styles.urlText}>
              {socketUrl || 'https://socket-realtime-notification'}
            </Text>
            <TouchableOpacity style={styles.reconnectButton}>
              <Text style={styles.buttonText}>Reconnect</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.urlExample}>Example: http://localhost:9085.</Text>
        </View>

        {/* Recent Events Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Events</Text>
          {events.length === 0 ? (
            <View style={styles.emptyEvents}>
              <Text style={styles.emptyText}>No recent events</Text>
            </View>
          ) : (
            <ScrollView style={styles.eventsList} nestedScrollEnabled>
              {events.map((event, index) => (
                <View key={index} style={styles.eventItem}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventType}>{event.type}</Text>
                    <Text style={styles.eventTime}>{formatTime(event.at)}</Text>
                  </View>
                  <Text style={styles.eventWho}>From: {event.who}</Text>
                  {event.meta && Object.keys(event.meta).length > 0 && (
                    <View style={styles.metaContainer}>
                      {Object.entries(event.meta).map(([key, value]) => (
                        <Text key={key} style={styles.metaText}>
                          {key}: {JSON.stringify(value)}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Events</Text>
          {response.length === 0 ? (
            <View style={styles.emptyEvents}>
              <Text style={styles.emptyText}>No recent events</Text>
            </View>
          ) : (
            <ScrollView style={styles.eventsList} nestedScrollEnabled>
              {response.map((event, index) => (
                <View key={index} style={styles.eventItem}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventType}>{event.type}</Text>
                    <Text style={styles.eventTime}>
                      {formatTime(event.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.eventWho}>From: {event.who}</Text>
                  {event.meta && Object.keys(event.meta).length > 0 && (
                    <View style={styles.metaContainer}>
                      {Object.entries(event.meta).map(([key, value]) => (
                        <Text key={key} style={styles.metaText}>
                          {key}: {JSON.stringify(value)}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  adminText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  alertsText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  socketStatus: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
  },
  soundStatusContainer: {
    borderWidth: 1,
    borderColor: '#6B7280',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  soundStatus: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#1E293B', // Dark blue card background
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  soundButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  testButton: {
    borderColor: '#10B981', // Green border
  },
  muteButton: {
    borderColor: '#F59E0B', // Yellow border
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  volumeLabel: {
    fontSize: 14,
    color: 'white',
    marginRight: 16,
    minWidth: 60,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
  sliderThumb: {
    backgroundColor: 'white',
    width: 20,
    height: 20,
  },
  soundDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  connectionLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  urlText: {
    flex: 1,
    fontSize: 14,
    color: 'white',
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  reconnectButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  urlExample: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyEvents: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  eventsList: {
    maxHeight: 200,
  },
  eventItem: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5CF6', // Purple color
  },
  eventTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  eventWho: {
    fontSize: 12,
    color: '#D1D5DB',
    marginBottom: 4,
  },
  metaContainer: {
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
});

export default AdminPanel;
