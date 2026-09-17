import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { mobileApi } from '../services/api';

export const NewReportScreen: React.FC = () => {
  const [description, setDescription] = useState(
    'During pump maintenance at Site A, technician started work before confirming complete electrical isolation. Live 440V detected.'
  );
  const [site, setSite] = useState('Site A - Duliajan');
  const [reportType, setReportType] = useState('Near-Miss');
  const [activity, setActivity] = useState('Pump Maintenance');
  const [photoAttached, setPhotoAttached] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const SITES = [
    'Site A - Duliajan',
    'Site B - Moran',
    'Site C - Digboi',
    'Site D - Jorhat',
    'Site E - Naharkatiya'
  ];

  const REPORT_TYPES = ['Near-Miss', 'Unsafe Condition', 'Unsafe Act', 'Incident'];

  const ACTIVITIES = [
    'Pump Maintenance',
    'Vessel Entry & Cleaning',
    'Working at Height',
    'Hot Work & Welding',
    'Crane & Lifting',
    'Driving & Transport'
  ];

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    try {
      setAnalyzing(true);
      setSubmitMessage(null);
      const data = await mobileApi.analyzeReport({
        description,
        site,
        report_type: reportType
      });
      setResult(data);
    } catch (err) {
      Alert.alert('Analysis Failed', 'Could not reach BarrierGuard FastAPI backend.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;
    try {
      setSubmitting(true);
      const saved = await mobileApi.submitReport({
        description,
        site,
        report_type: reportType,
        department: 'Field HSE',
        submitted_by: 'Mobile Field Officer'
      });
      setSubmitMessage(`Report logged with ID: ${saved.report_id}`);
      Alert.alert('Report Submitted', `Logged to OIL central repository as ${saved.report_id}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to save report to backend database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>+ New Safety Observation</Text>
      <Text style={styles.subtitle}>Field Precursor Logging & On-Device AI Classification</Text>

      {/* Site Selector */}
      <Text style={styles.fieldLabel}>OIL Site / Asset</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {SITES.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSite(s)}
            style={[styles.chip, site === s && styles.chipActive]}
          >
            <Text style={[styles.chipText, site === s && styles.chipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Activity Selector */}
      <Text style={styles.fieldLabel}>Operational Activity</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {ACTIVITIES.map((act) => (
          <TouchableOpacity
            key={act}
            onPress={() => setActivity(act)}
            style={[styles.chip, activity === act && styles.chipActive]}
          >
            <Text style={[styles.chipText, activity === act && styles.chipTextActive]}>{act}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Report Type */}
      <Text style={styles.fieldLabel}>Report Classification</Text>
      <View style={styles.typeRow}>
        {REPORT_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setReportType(t)}
            style={[styles.typeBtn, reportType === t && styles.typeBtnActive]}
          >
            <Text style={[styles.typeText, reportType === t && styles.typeTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Free Text Narrative */}
      <Text style={styles.fieldLabel}>Safety Observation Narrative</Text>
      <TextInput
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter field details: equipment, unsafe acts, barriers missing, voltage/pressure exposure..."
        style={styles.textArea}
      />

      {/* Photo Attachment Picker */}
      <TouchableOpacity
        style={styles.photoButton}
        onPress={() => setPhotoAttached(!photoAttached)}
      >
        <Text style={styles.photoButtonText}>
          {photoAttached ? '✓ Photo Attached (rig_hazard_pic01.jpg)' : '📷 Attach Field Photo / Inspection Evidence'}
        </Text>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          disabled={analyzing}
          style={styles.analyzeBtn}
          onPress={handleAnalyze}
        >
          {analyzing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.analyzeBtnText}>⚡ Analyze with AI</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          disabled={submitting}
          style={styles.submitBtn}
          onPress={handleSubmit}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </View>

      {submitMessage && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✓ {submitMessage}</Text>
        </View>
      )}

      {/* Live AI Analysis Results Display */}
      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View>
              <Text style={styles.resultCategory}>
                {result.sif_potential ? '🚨 SIF-POTENTIAL DETECTED' : '✅ NON-SIF ROUTINE OBSERVATION'}
              </Text>
              <Text style={styles.resultRisk}>
                Risk Level: {result.risk_level} ({result.risk_score})
              </Text>
            </View>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{(result.confidence * 100).toFixed(0)}% Conf.</Text>
            </View>
          </View>

          <View style={styles.resultDivider} />

          <Text style={styles.subHead}>IOGP Life-Saving Rule</Text>
          <Text style={styles.ruleName}>{result.life_saving_rule}</Text>

          <Text style={styles.subHead}>Detected Precursors</Text>
          <View style={styles.precursorGrid}>
            <Text style={styles.precursorItem}>• <Text style={styles.bold}>Activity:</Text> {result.precursors.activity}</Text>
            <Text style={styles.precursorItem}>• <Text style={styles.bold}>Hazard:</Text> {result.precursors.hazard}</Text>
            <Text style={styles.precursorItem}>• <Text style={styles.bold}>Barrier Failure:</Text> {result.precursors.barrier_failure}</Text>
            <Text style={styles.precursorItem}>• <Text style={styles.bold}>Worst Consequence:</Text> {result.precursors.potential_consequence}</Text>
          </View>

          <Text style={styles.subHead}>AI Feature Attribution</Text>
          {(result.explanation || []).map((exp: string, idx: number) => (
            <Text key={idx} style={styles.explanationText}>
              {idx + 1}. {exp}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 50 },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#64748B', marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: 6, marginTop: 8 },
  chipRow: { flexDirection: 'row', marginBottom: 12 },
  chip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 6 },
  chipActive: { backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' },
  chipText: { fontSize: 12, color: '#334155', fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  typeRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  typeBtn: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  typeText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  typeTextActive: { color: '#FFFFFF' },
  textArea: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, fontSize: 13, color: '#0F172A', textAlignVertical: 'top', minHeight: 90, marginBottom: 12 },
  photoButton: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 16 },
  photoButtonText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  analyzeBtn: { flex: 1, backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  analyzeBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  submitBtn: { flex: 1, backgroundColor: '#15803D', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  submitBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  successBanner: { backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#86EFAC', borderRadius: 8, padding: 10, marginBottom: 16 },
  successText: { color: '#166534', fontSize: 12, fontWeight: '700' },
  resultCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultCategory: { fontSize: 14, fontWeight: '800', color: '#DC2626' },
  resultRisk: { fontSize: 12, fontWeight: '700', color: '#B91C1C', marginTop: 2 },
  confidenceBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  confidenceText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  resultDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
  subHead: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: 4, marginTop: 6 },
  ruleName: { fontSize: 14, fontWeight: '700', color: '#1D4ED8', marginBottom: 6 },
  precursorGrid: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 8 },
  precursorItem: { fontSize: 12, color: '#334155', marginBottom: 3 },
  bold: { fontWeight: '700' },
  explanationText: { fontSize: 11, color: '#475569', lineHeight: 16, marginBottom: 3 },
});
