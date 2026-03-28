export interface Alert {
  id: number;
  alertName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_POSITIVE';
  source: string;
  description: string;
  relatedIncidentId: number;
  rawData: any;
  createdAt: string;
  acknowledgedAt: string;
  resolvedAt: string;
}
