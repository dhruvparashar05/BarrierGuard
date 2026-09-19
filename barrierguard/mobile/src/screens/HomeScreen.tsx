import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl
} from 'react-native';
import { mobileApi } from '../services/api';

interface HomeScreenProps {
  onNavigateTab: (tab: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateTab }) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    mobileApi.getDashboardSummary()
      .then((data) => setSummary(data))
      .catch((err) => console.log('Mobile summary error:', err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchSummary(true)}
          tintColor="#2563EB"
          colors={['#2563EB']}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning, HSE Analyst</Text>
        <Text style={styles.subGreeting}>Oil India Limited • Field Surveillance</Text>
      </View>

      {/* Hero CTA Button */}
      <TouchableOpacity
        style={styles.primaryCta}
        activeOpacity={0.85}
        onPress={() => onNavigateTab('new-report')}
      >
        <View style={styles.ctaBadge}>
          <Text style={styles.ctaBadgeText}>FIELD INPUT</Text>
        </View>
        <Text style={styles.ctaTitle}>+ New Safety Observation</Text>
        <Text style={styles.ctaSub}>Log Unsafe Act, Condition, or Near-Miss with Live AI Precursor Analysis</Text>
      </TouchableOpacity>

      {/* Today's Overview */}
      <Text style={styles.sectionTitle}>Today's Operational Overview</Text>

      {loading && !summary ? (
        <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Reports</Text>
            <Text style={styles.kpiValue}>{summary?.total_reports ?? 751}</Text>
            <Text style={styles.kpiSub}>All OIL Assets</Text>
          </View>

          <View style={[styles.kpiCard, styles.kpiCardRed]}>
            <Text style={[styles.kpiLabel, { color: '#B91C1C' }]}>SIF Potential</Text>
            <Text style={[styles.kpiValue, { color: '#DC2626' }]}>
              {summary?.sif_potential_reports ?? 196}
            </Text>
            <Text style={[styles.kpiSub, { color: '#DC2626' }]}>
              {summary?.sif_percentage != null ? `${summary.sif_percentage}% Ratio` : '26.1% Ratio'}
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>High-Risk Sites</Text>
            <Text style={[styles.kpiValue, { color: '#B45309' }]}>
              {summary?.priority_sites_count ?? 5}
            </Text>
            <Text style={styles.kpiSub}>Priority Focus</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Active Alerts</Text>
            <Text style={[styles.kpiValue, { color: '#DC2626' }]}>
              {summary?.recent_alerts_count ?? 2}
            </Text>
            <Text style={styles.kpiSub}>Unacknowledged</Text>
          </View>
        </View>
      )}

      {/* Compact SIF Trend Bar */}
      <View style={styles.trendBox}>
        <View style={styles.trendHeader}>
          <Text style={styles.trendTitle}>Fatal Precursor Velocity</Text>
          <Text style={styles.trendBadge}>-4.2% MoM</Text>
        </View>
        <Text style={styles.trendText}>
          Safety isolation audits at Site A - Duliajan have stabilized recurring pump maintenance precursor spikes.
        </Text>
      </View>

      {/* Quick Navigation Rows */}
      <Text style={styles.sectionTitle}>Field Operations</Text>

      <TouchableOpacity
        style={styles.navRow}
        onPress={() => onNavigateTab('reports')}
      >
        <View>
          <Text style={styles.navRowTitle}>View Safety Reports Feed</Text>
          <Text style={styles.navRowSub}>Browse {summary?.total_reports ?? 751}+ field near-misses and precursor logs</Text>
        </View>
        <Text style={styles.navArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navRow}
        onPress={() => onNavigateTab('alerts')}
      >
        <View>
          <Text style={styles.navRowTitle}>Systemic Alarms & Alerts</Text>
          <Text style={styles.navRowSub}>Review urgent multi-barrier breakdowns</Text>
        </View>
        <Text style={styles.navArrow}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  primaryCta: {
    backgroundColor: '#1D4ED8',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  ctaBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  ctaSub: {
    color: '#BFDBFE',
    fontSize: 12,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiCardRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  kpiSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  trendBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  trendTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  trendBadge: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  navRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  navRowSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  navArrow: {
    fontSize: 22,
    color: '#94A3B8',
    fontWeight: '300',
  },
});
