import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { mobileApi } from '../services/api';

export const AlertsScreen: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = () => {
    setLoading(true);
    mobileApi.getAlerts()
      .then((data) => setAlerts(data))
      .catch((err) => console.log('Mobile alerts err:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (id: number) => {
    try {
      await mobileApi.acknowledgeAlert(id);
      Alert.alert('Acknowledged', 'Alert acknowledged and forwarded to field supervisor log.');
      fetchAlerts();
    } catch (err) {
      Alert.alert('Error', 'Failed to acknowledge alert.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Field Hazard Alarms</Text>
      <Text style={styles.subtitle}>Critical SIF Precursor Violations & Risk Spikes</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#DC2626" style={{ marginTop: 40 }} />
      ) : (
        alerts.map((al) => (
          <View key={al.id} style={styles.alertCard}>
            <View style={styles.alertTop}>
              <View style={styles.severityBadge}>
                <Text style={styles.severityText}>{al.severity}</Text>
              </View>
              <Text style={styles.timeText}>{al.time}</Text>
            </View>

            <Text style={styles.alertTitle}>{al.title}</Text>
            <Text style={styles.alertDesc}>{al.description}</Text>

            <View style={styles.actionBox}>
              <Text style={styles.actionHead}>Recommended Countermeasure:</Text>
              <Text style={styles.actionText}>{al.recommended_action}</Text>
            </View>

            <View style={styles.cardBottom}>
              <Text style={styles.siteText}>📍 {al.site}</Text>
              {!al.acknowledged ? (
                <TouchableOpacity
                  style={styles.ackBtn}
                  onPress={() => handleAcknowledge(al.id)}
                >
                  <Text style={styles.ackText}>✓ Acknowledge</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.ackDone}>✓ Acknowledged</Text>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#64748B', marginBottom: 16 },
  alertCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FCA5A5', marginBottom: 12 },
  alertTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  severityBadge: { backgroundColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  severityText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  timeText: { fontSize: 10, color: '#94A3B8' },
  alertTitle: { fontSize: 13, fontWeight: '800', color: '#991B1B', marginBottom: 4 },
  alertDesc: { fontSize: 11, color: '#475569', lineHeight: 15, marginBottom: 8 },
  actionBox: { backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8, marginBottom: 10 },
  actionHead: { fontSize: 10, fontWeight: '700', color: '#991B1B', marginBottom: 2 },
  actionText: { fontSize: 11, color: '#7F1D1D' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  siteText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  ackBtn: { backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  ackText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  ackDone: { color: '#16A34A', fontSize: 11, fontWeight: '700' }
});
