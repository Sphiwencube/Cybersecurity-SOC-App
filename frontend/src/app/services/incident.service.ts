import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, Incident } from '../models/incident.model';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private apiUrl = 'http://localhost:8080/api/incidents';

  constructor(private http: HttpClient) {}

  getAllIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.apiUrl);
  }

  getActiveIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}/active`);
  }

  getIncidentById(id: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.apiUrl}/${id}`);
  }

  createIncident(incident: Partial<Incident>): Observable<Incident> {
    return this.http.post<Incident>(this.apiUrl, incident);
  }

  updateIncident(id: number, incident: Partial<Incident>): Observable<Incident> {
    return this.http.put<Incident>(`${this.apiUrl}/${id}`, incident);
  }

  deleteIncident(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats/dashboard`);
  }
}
