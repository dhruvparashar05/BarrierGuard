import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { NewReportScreen } from './src/screens/NewReportScreen';
import { ReportsListScreen } from './src/screens/ReportsListScreen';
import { AlertsScreen } from './src/screens/AlertsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

function MainApp() {
  const insets = useSafeAreaInsets();
  const [currentTab, setCurrentTab] = useState<'home' | 'reports' | 'new-report' | 'alerts' | 'profile'>('home');

  useEffect(() => {
    if (Platform.OS === 'android') {
      RNStatusBar.setTranslucent(true);
      RNStatusBar.setBackgroundColor('#0F172A');
    }
  }, []);

  // Dynamically compute safe-area top inset, ensuring content starts below Android status bar/camera notch
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0
  );

  // Dynamically compute safe-area bottom inset to respect Android gesture line or soft navigation buttons
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <View style={styles.rootContainer}>
      {/* Light status bar icons over the dark navy header with matching background */}
      <RNStatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={true} />

      {/* Top Mobile Bar - Safe Area Top Inset ensures logo/text never collide with system status bar */}
      <View style={[styles.topBar, { paddingTop: topInset + 8 }]}>
        <Text style={styles.brandTitle}>🛡️ BarrierGuard</Text>
        <Text style={styles.brandOrg}>OIL Field App</Text>
      </View>

      {/* Screen Body */}
      <View style={styles.screenContainer}>
        {currentTab === 'home' && <HomeScreen onNavigateTab={(tab) => setCurrentTab(tab as any)} />}
        {currentTab === 'reports' && <ReportsListScreen />}
        {currentTab === 'new-report' && <NewReportScreen />}
        {currentTab === 'alerts' && <AlertsScreen />}
        {currentTab === 'profile' && <ProfileScreen />}
      </View>

      {/* Bottom Navigation Bar with dynamic safe-area bottom inset */}
      <View style={[styles.bottomNav, { paddingBottom: bottomInset }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('home')}
        >
          <Text style={[styles.navIcon, currentTab === 'home' && styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navLabel, currentTab === 'home' && styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('reports')}
        >
          <Text style={[styles.navIcon, currentTab === 'reports' && styles.navIconActive]}>📋</Text>
          <Text style={[styles.navLabel, currentTab === 'reports' && styles.navLabelActive]}>Reports</Text>
        </TouchableOpacity>

        {/* Center Prominent (+) Button */}
        <TouchableOpacity
          style={styles.centerFab}
          onPress={() => setCurrentTab('new-report')}
        >
          <View style={styles.fabInner}>
            <Text style={styles.fabText}>+</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('alerts')}
        >
          <Text style={[styles.navIcon, currentTab === 'alerts' && styles.navIconActive]}>🔔</Text>
          <Text style={[styles.navLabel, currentTab === 'alerts' && styles.navLabelActive]}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('profile')}
        >
          <Text style={[styles.navIcon, currentTab === 'profile' && styles.navIconActive]}>👤</Text>
          <Text style={[styles.navLabel, currentTab === 'profile' && styles.navLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.provider}>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  provider: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  rootContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topBar: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandOrg: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  centerFab: {
    top: -14,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  fabInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 28,
  },
});
