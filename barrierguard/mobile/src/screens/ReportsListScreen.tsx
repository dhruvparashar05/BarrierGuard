import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from 'react-native';
import { mobileApi } from '../services/api';

export const ReportsListScreen: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sif'>('all');

  useEffect(() => {
    fetchList();
  }, [filter]);

  const fetchList = () => {
    setLoading(true);
    const params: Record<string, any> = { page: 1, page_size: 20 };
    if (filter === 'sif') params.sif = true;

    mobileApi.getReports(params)
      .then((res) => setReports(res.items || []))
      .catch((err) => console.log('Mobile reports err:', err))
      .finally(() => setLoading(false));
  };

  return (
    <View style={styles.container}>
      {/* Header & Filter */}
      <View style={styles.header}>
        <Text style={styles.title}>Field Observations Feed</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'sif' && styles.filterBtnActiveRed]}
            onPress={() => setFilter('sif')}
          >
            <Text style={[styles.filterText, filter === 'sif' && styles.filterTextActiveRed]}>🚨 SIF Only</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {reports.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.reportId}>{item.report_id}</Text>
                <View style={[styles.badge, item.sif_potential ? styles.badgeRed : styles.badgeSlate]}>
                  <Text style={[styles.badgeText, item.sif_potential ? styles.badgeTextRed : styles.badgeTextSlate]}>
                    {item.sif_potential ? 'SIF POTENTIAL' : 'NON-SIF'}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

              <View style={styles.cardBottom}>
                <Text style={styles.siteText}>📍 {item.site}</Text>
                <Text style={styles.ruleText}>🛡️ {item.life_saving_rule || 'Rule'}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F1F5F9' },
  filterBtnActive: { backgroundColor: '#1D4ED8' },
  filterBtnActiveRed: { backgroundColor: '#DC2626' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  filterTextActive: { color: '#FFFFFF' },
  filterTextActiveRed: { color: '#FFFFFF' },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reportId: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeRed: { backgroundColor: '#FEE2E2' },
  badgeSlate: { backgroundColor: '#F1F5F9' },
  badgeText: { fontSize: 10, fontWeight: '800' },
  badgeTextRed: { color: '#DC2626' },
  badgeTextSlate: { color: '#64748B' },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  cardDesc: { fontSize: 11, color: '#64748B', lineHeight: 15, marginBottom: 8 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 6 },
  siteText: { fontSize: 11, color: '#475569', fontWeight: '500' },
  ruleText: { fontSize: 11, color: '#1D4ED8', fontWeight: '600' },
});
