import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity
} from 'react-native';

export const ProfileScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AK</Text>
        </View>
        <Text style={styles.name}>A. K. Sharma</Text>
        <Text style={styles.role}>HSE Field Analyst • Badge #OIL-7041</Text>
        <Text style={styles.dept}>Oil India Limited • Corporate HSE Intelligence</Text>
      </View>

      <Text style={styles.sectionTitle}>Field System Status</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>AI Intelligence Engine</Text>
          <Text style={styles.infoVal}>v1.2 (Hybrid ML+NLP)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Backend REST API</Text>
          <Text style={[styles.infoVal, { color: '#16A34A' }]}>● Online (FastAPI 8000)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Field Asset Station</Text>
          <Text style={styles.infoVal}>Site A - Duliajan Central</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Offline Queue Sync</Text>
          <Text style={styles.infoVal}>Synced (0 pending)</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>About BarrierGuard</Text>
      <View style={styles.infoCard}>
        <Text style={styles.aboutText}>
          BarrierGuard is an AI/NLP-powered HSE intelligence platform designed for Oil India Limited (OIL) for Smart India Hackathon Problem Statement 26165.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16 },
  profileCard: { backgroundColor: '#0F172A', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  name: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  role: { color: '#93C5FD', fontSize: 12, marginTop: 2 },
  dept: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  infoVal: { fontSize: 12, color: '#0F172A', fontWeight: '700' },
  aboutText: { fontSize: 12, color: '#475569', lineHeight: 18 }
});
