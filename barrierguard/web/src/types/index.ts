export interface Precursors {
  activity?: string;
  location?: string;
  equipment?: string;
  hazard?: string;
  barrier_failure?: string;
  unsafe_act?: string;
  unsafe_condition?: string;
  potential_consequence?: string;
  life_saving_rule?: string;
  explanation?: string[];
}

export interface AIPrediction {
  sif_potential: boolean;
  probability: number;
  risk_score: number;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  model_version: string;
  reviewed_by_human?: boolean;
  human_override?: boolean;
  reviewer_name?: string;
  human_sif_label?: boolean;
  human_comments?: string;
}

export interface ReportItem {
  id: number;
  report_id: string;
  title: string;
  description: string;
  report_type: string;
  date: string;
  site: string;
  department?: string;
  submitted_by?: string;
  priority: string;
  status: string;
  sif_potential: boolean;
  risk_score: number;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  life_saving_rule?: string;
  barrier_failure?: string;
}

export interface ReportDetail extends ReportItem {
  precursors?: Precursors;
  prediction?: AIPrediction;
  similar_reports?: SimilarReport[];
}

export interface SimilarReport {
  id: string;
  report_id: string;
  title: string;
  description: string;
  similarity_score: number;
  similarity_percentage: number;
  sif_potential: boolean;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  risk_score: number;
  site: string;
  date: string;
  life_saving_rule?: string;
}

export interface AnalyzeResult {
  sif_potential: boolean;
  probability: number;
  risk_score: number;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  life_saving_rule: string;
  rule_confidence: number;
  precursors: Precursors;
  explanation: string[];
  mandatory_barriers: string[];
  recommended_action: string;
  similar_historical_reports: SimilarReport[];
}

export interface PatternItem {
  id: string;
  pattern_id: string;
  name: string;
  activity: string;
  barrier_failure: string;
  life_saving_rule: string;
  site: string;
  equipment?: string;
  occurrences: number;
  sif_count: number;
  sif_percentage: number;
  average_risk_score: number;
  risk_tier: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  trend: string;
  recommended_action?: string;
  sample_reports?: Array<{
    id: string;
    title: string;
    date: string;
    risk_score: number;
  }>;
}

export interface AlertItem {
  id: number;
  alert_id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  alert_type: string;
  site: string;
  time: string;
  recommended_action?: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface InterventionItem {
  id: number;
  intervention_id: string;
  report_id?: string;
  pattern_id?: string;
  title: string;
  stage: 'Detected' | 'Under Review' | 'Action Assigned' | 'Corrective Action' | 'Resolved';
  assigned_to: string;
  site: string;
  priority: string;
  corrective_action: string;
  due_date?: string;
  created_at?: string;
}

export interface DashboardSummary {
  total_reports: number;
  sif_potential_reports: number;
  sif_percentage: number;
  high_risk_patterns: number;
  priority_sites_count: number;
  recent_alerts_count: number;
  sif_trend_direction: string;
  disclaimer: string;
}

export interface DashboardTrends {
  monthly_trend: Array<{
    month: string;
    total_reports: number;
    sif_reports: number;
    non_sif_reports: number;
    sif_rate: number;
  }>;
  rules_distribution: Array<{
    name: string;
    value: number;
  }>;
  top_high_risk_sites: Array<{
    rank: number;
    site: string;
    total_reports: number;
    sif_reports: number;
    sif_density: string;
    risk: 'HIGH' | 'MEDIUM' | 'LOW';
    trend: string;
  }>;
  recent_alerts: AlertItem[];
}

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  organization?: string;
  department?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}
