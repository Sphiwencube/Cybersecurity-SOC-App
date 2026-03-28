export interface ThreatIntelligence {
  id: number;
  indicator: string;
  indicatorType: 'IP' | 'DOMAIN' | 'URL' | 'HASH' | 'EMAIL';
  threatType: string;
  confidenceScore: number;
  source: string;
  firstSeen: string;
  lastSeen: string;
  isActive: boolean;
  description: string;
  createdAt: string;
}
