import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ThreatIntelligence } from '../models/threat-intel.model';

@Injectable({
  providedIn: 'root'
})
export class ThreatIntelService {
  private apiUrl = 'http://localhost:8080/api/threat-intel';

  constructor(private http: HttpClient) {}

  getAllIndicators(): Observable<ThreatIntelligence[]> {
    return this.http.get<ThreatIntelligence[]>(this.apiUrl);
  }

  getActiveIndicators(): Observable<ThreatIntelligence[]> {
    return this.http.get<ThreatIntelligence[]>(`${this.apiUrl}/active`);
  }

  getHighConfidenceIndicators(minConfidence: number = 80): Observable<ThreatIntelligence[]> {
    return this.http.get<ThreatIntelligence[]>(`${this.apiUrl}/high-confidence`, {
      params: { minConfidence: minConfidence.toString() }
    });
  }

  getIndicatorById(id: number): Observable<ThreatIntelligence> {
    return this.http.get<ThreatIntelligence>(`${this.apiUrl}/${id}`);
  }

  createIndicator(indicator: Partial<ThreatIntelligence>): Observable<ThreatIntelligence> {
    return this.http.post<ThreatIntelligence>(this.apiUrl, indicator);
  }

  updateIndicator(id: number, indicator: Partial<ThreatIntelligence>): Observable<ThreatIntelligence> {
    return this.http.put<ThreatIntelligence>(`${this.apiUrl}/${id}`, indicator);
  }

  deleteIndicator(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getActiveIndicatorsCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/stats/count`);
  }
}
