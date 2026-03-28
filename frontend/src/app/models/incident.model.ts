export interface Incident {
  id: number;
  incidentId: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  incidentType: string;
  sourceIp: string;
  destinationIp: string;
  attackVector: string;
  malwareFamily: string;
  affectedAssets: string;
  assignedToId: number;
  assignedToName: string;
  createdById: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string;
}

export interface DashboardStats {
  totalIncidents: number;
  openIncidents: number;
  criticalAlerts: number;
  resolvedToday: number;
  threatIndicators: number;
  incidentsBySeverity: { [key: string]: number };
  incidentsByStatus: { [key: string]: number };
  incidentsByType: { [key: string]: number };
  incidentTrends: IncidentTrend[];
  recentActivities: RecentActivity[];
}

export interface IncidentTrend {
  date: string;
  count: number;
}

export interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
  severity: string;
}
