import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alert } from '../models/alert.model';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private apiUrl = 'http://localhost:8080/api/alerts';

  constructor(private http: HttpClient) {}

  getAllAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(this.apiUrl);
  }

  getNewAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.apiUrl}/new`);
  }

  getAlertById(id: number): Observable<Alert> {
    return this.http.get<Alert>(`${this.apiUrl}/${id}`);
  }

  createAlert(alert: Partial<Alert>): Observable<Alert> {
    return this.http.post<Alert>(this.apiUrl, alert);
  }

  updateAlert(id: number, alert: Partial<Alert>): Observable<Alert> {
    return this.http.put<Alert>(`${this.apiUrl}/${id}`, alert);
  }

  deleteAlert(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // NEW: Acknowledge alert
  acknowledgeAlert(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/acknowledge`, {});
  }

  // NEW: Resolve alert
  resolveAlert(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/resolve`, {});
  }

  getCriticalAlertsCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/stats/critical`);
  }
}