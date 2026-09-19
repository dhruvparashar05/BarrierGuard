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

const SITES = [
  'All Sites',
  'Site A - Duliajan',
  'Site B - Moran',
  'Site C - Digboi',
  'Site D - Jorhat',
  'Site E - Naharkatiya'
];

export const ReportsListScreen: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sif'>('all');
  const [selectedSite, setSelectedSite] = useState<string>('All Sites');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [expandedCardId, setExpandedCardId] = useState<string | number | null>(null);

  useEffect(() => {
    setPage(1);
    fetchList(1, filter, selectedSite, false);
  }, [filter, selectedSite]);

  const fetchList = (
    pageNum: number,
    currentFilter: 'all' | 'sif',
    siteChoice: string,
    isAppend = false
  ) => {
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    const params: Record<string, any> = { page: pageNum, page_size: 50 };
    if (currentFilter === 'sif') params.sif = true;
    if (siteChoice && siteChoice !== 'All Sites') {
      params.site = siteChoice;
    }

    mobileApi.getReports(params)
      .then((res) => {
        if (isAppend) {
          setReports((prev) => [...prev, ...(res.items || [])]);
        } else {
          setReports(res.items || []);
        }
        setTotalCount(res.total || 0);
      })
      .catch((err) => console.log('Mobile reports err:', err))
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchList(1, filter, selectedSite, false);
  };

  const handleLoadMore = () => {
    if (loadingMore || reports.length >= totalCount) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchList(nextPage, filter, selectedSite, true);
  };

  const toggleExpand = (id: string | number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      {/* Header & Filter Controls */}
      <View style={styles.header}>
        <Text style={styles.title}>Field Observations Feed</Text>

        {/* Filter Row: All Reports vs SIF Only */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All Reports
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'sif' && styles.filterBtnActiveRed]}
            onPress={() => setFilter('sif')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, filter === 'sif' && styles.filterTextActiveRed]}>
              🚨 SIF Only
            </Text>
          </TouchableOpacity>
        </View>

        {/* Site Location Selector Section */}
        <View style={styles.siteHeaderRow}>
          <Text style={styles.siteSectionLabel}>FILTER BY SITE</Text>
          {selectedSite !== 'All Sites' && (
            <TouchableOpacity onPress={() => setSelectedSite('All Sites')}>
              <Text style={styles.resetSiteText}>Reset to All Sites</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.siteChipsScroll}
        >
          {SITES.map((s) => {
            const isSelected = selectedSite === s;
            return (
              <TouchableOpacity
                key={s}
                style={[
                  styles.siteChip,
                  isSelected && styles.siteChipActive
                ]}
                onPress={() => setSelectedSite(s)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.siteChipText,
                    isSelected && styles.siteChipTextActive
                  ]}
                >
                  {s === 'All Sites' ? '🌐 All Sites' : `📍 ${s}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Live Status Indicator Bar */}
        <View style={styles.metaStatusBar}>
          <Text style={styles.metaStatusText}>
            Showing <Text style={styles.metaHighlight}>{reports.length}</Text> of{' '}
            <Text style={styles.metaHighlight}>{totalCount}</Text>{' '}
            {filter === 'sif' ? 'SIF ' : ''}reports
            {selectedSite !== 'All Sites' ? ` for ${selectedSite}` : ' across all sites'}
          </Text>
        </View>
      </View>

      {/* Reports Feed List */}
      {loading && reports.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Fetching field observations...</Text>
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No Observations Found</Text>
          <Text style={styles.emptySubtitle}>
            No {filter === 'sif' ? 'SIF potential ' : ''}reports match{' '}
            <Text style={{ fontWeight: '700', color: '#1E293B' }}>{selectedSite}</Text>.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => {
              setSelectedSite('All Sites');
              setFilter('all');
            }}
          >
            <Text style={styles.emptyBtnText}>Show All Sites & Reports</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563EB']}
              tintColor="#2563EB"
            />
          }
        >
          {reports.map((item) => {
            const isExpanded = expandedCardId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => toggleExpand(item.id)}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.reportId}>{item.report_id}</Text>
                  <View style={[styles.badge, item.sif_potential ? styles.badgeRed : styles.badgeSlate]}>
                    <Text style={[styles.badgeText, item.sif_potential ? styles.badgeTextRed : styles.badgeTextSlate]}>
                      {item.sif_potential ? 'SIF POTENTIAL' : 'NON-SIF'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text
                  style={styles.cardDesc}
                  numberOfLines={isExpanded ? undefined : 2}
                >
                  {item.description}
                </Text>

                <View style={styles.cardBottom}>
                  <Text style={styles.siteText}>📍 {item.site}</Text>
                  <Text style={styles.ruleText}>🛡️ {item.life_saving_rule || 'Rule'}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Load More Button */}
          {reports.length < totalCount && (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={handleLoadMore}
              disabled={loadingMore}
              activeOpacity={0.8}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <Text style={styles.loadMoreText}>
                  Load More ({totalCount - reports.length} remaining)
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* All Loaded Indicator */}
          {reports.length >= totalCount && reports.length > 0 && (
            <View style={styles.endOfListContainer}>
              <Text style={styles.endOfListText}>
                ✓ All {totalCount} reports loaded for {selectedSite === 'All Sites' ? 'all sites' : selectedSite}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 16,
    marginBottom: 10,
    letterSpacing: -0.3
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  filterBtnActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8'
  },
  filterBtnActiveRed: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626'
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },
  filterTextActive: {
    color: '#FFFFFF'
  },
  filterTextActiveRed: {
    color: '#FFFFFF'
  },
  siteHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6
  },
  siteSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6
  },
  resetSiteText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB'
  },
  siteChipsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8
  },
  siteChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1'
  },
  siteChipActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  siteChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155'
  },
  siteChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  metaStatusBar: {
    marginHorizontal: 16,
    marginTop: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 6
  },
  metaStatusText: {
    fontSize: 11,
    color: '#475569'
  },
  metaHighlight: {
    fontWeight: '700',
    color: '#0F172A'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60
  },
  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500'
  },
  list: {
    padding: 16,
    paddingBottom: 40
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  reportId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  badgeRed: {
    backgroundColor: '#FEE2E2'
  },
  badgeSlate: {
    backgroundColor: '#F1F5F9'
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  badgeTextRed: {
    color: '#DC2626'
  },
  badgeTextSlate: {
    color: '#64748B'
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4
  },
  cardDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 8
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 2
  },
  siteText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500'
  },
  ruleText: {
    fontSize: 11,
    color: '#1D4ED8',
    fontWeight: '600'
  },
  loadMoreBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16
  },
  loadMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB'
  },
  endOfListContainer: {
    alignItems: 'center',
    paddingVertical: 14
  },
  endOfListText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16
  },
  emptyBtn: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  }
});
