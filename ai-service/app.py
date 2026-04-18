from flask import Flask, jsonify, request
from flask_cors import CORS
import torch
import torch.nn as nn
import numpy as np
import pandas as pd
import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime, timedelta
import json
import logging
import random
import math

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.route("/")
def home():
    return {"message": "AI service is running", "status": "healthy"}

# Database configuration
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'soc_user'),
    'password': os.getenv('DB_PASSWORD', 'soc_password'),
    'database': os.getenv('DB_NAME', 'soc_db')
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        logger.error(f"Error connecting to database: {e}")
        return None

# Threat Prediction Model
class ThreatPredictionModel(nn.Module):
    def __init__(self, input_size=10, hidden_size=64, num_classes=5):
        super(ThreatPredictionModel, self).__init__()
        self.layer1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.3)
        self.layer2 = nn.Linear(hidden_size, hidden_size)
        self.layer3 = nn.Linear(hidden_size, num_classes)
        self.softmax = nn.Softmax(dim=1)
    
    def forward(self, x):
        x = self.layer1(x)
        x = self.relu(x)
        x = self.dropout(x)
        x = self.layer2(x)
        x = self.relu(x)
        x = self.layer3(x)
        return self.softmax(x)

# Initialize model
model = ThreatPredictionModel()
model.eval()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'ai-service'})

@app.route('/api/predict/threat', methods=['POST'])
def predict_threat():
    try:
        data = request.get_json() or {}
        
        # Extract features from input
        features = extract_features(data)
        
        # Convert to tensor
        input_tensor = torch.FloatTensor(features).unsqueeze(0)
        
        # Make prediction
        with torch.no_grad():
            prediction = model(input_tensor)
            probabilities = prediction.numpy()[0]
        
        # Get threat classes
        threat_classes = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'INFO']
        predicted_class = threat_classes[np.argmax(probabilities)]
        confidence = float(np.max(probabilities))
        
        return jsonify({
            'prediction': predicted_class,
            'confidence': confidence,
            'probabilities': {
                threat_classes[i]: float(probabilities[i]) 
                for i in range(len(threat_classes))
            }
        })
    
    except Exception as e:
        logger.error(f"Error in threat prediction: {e}")
        return jsonify({'error': str(e)}), 500

def extract_features(data):
    """Extract features from incident data for prediction"""
    features = [
        data.get('severity_score', 0),
        data.get('time_of_day', 12),
        data.get('day_of_week', 0),
        data.get('source_ip_reputation', 0.5),
        data.get('destination_port_risk', 0.5),
        data.get('attack_vector_score', 0.5),
        data.get('historical_similarity', 0.5),
        data.get('affected_assets_count', 1),
        data.get('previous_incidents', 0),
        data.get('threat_intel_match', 0)
    ]
    return features

from datetime import datetime, timedelta

@app.route('/api/analyze/incidents', methods=['GET'])
def analyze_incidents():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                severity,
                COUNT(*) as count,
                AVG(TIMESTAMPDIFF(HOUR, created_at, COALESCE(resolved_at, NOW()))) as avg_resolution_time
            FROM incidents
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY severity
        """)
        severity_stats = cursor.fetchall()
        
        cursor.execute("""
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM incidents
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date
        """)
        daily_counts = cursor.fetchall()
        
        cursor.execute("""
            SELECT 
                attack_vector,
                COUNT(*) as count
            FROM incidents
            WHERE attack_vector IS NOT NULL
            GROUP BY attack_vector
            ORDER BY count DESC
            LIMIT 5
        """)
        attack_vectors = cursor.fetchall()
        
        cursor.execute("""
            SELECT 
                created_at
            FROM incidents
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ORDER BY created_at ASC
        """)
        
        incident_times = cursor.fetchall()
        two_hour_slots = calculate_two_hour_slots(incident_times)
        
        trend_analysis = calculate_trends(daily_counts)
        
        return jsonify({
            'severity_stats': severity_stats,
            'daily_counts': daily_counts,
            'attack_vectors': attack_vectors,
            'trend_analysis': trend_analysis,
            'two_hour_slots': two_hour_slots,  # 12 slots of 2 hours each
            'last_updated': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error analyzing incidents: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

def calculate_two_hour_slots(incident_times):
    """Group incidents into 2-hour slots for the last 24 hours"""
    now = datetime.now()
    slots = []
    
    for i in range(11, -1, -1):  
        slot_end = now - timedelta(hours=i * 2)
        slot_start = slot_end - timedelta(hours=2)
        
        count = sum(
            1 for incident in incident_times 
            if slot_start <= incident['created_at'] < slot_end
        )
        
        slots.append({
            'slot_start': slot_start.strftime('%Y-%m-%d %H:%M:%S'),
            'slot_end': slot_end.strftime('%Y-%m-%d %H:%M:%S'),
            'count': count,
            'is_current': i == 0  # True for the most recent slot
        })
    
    return slots

def calculate_trends(daily_counts):
    """Calculate trend analysis from daily incident counts"""
    if len(daily_counts) < 2:
        return {'trend': 'insufficient_data', 'change_percent': 0}
    
    counts = [d['count'] for d in daily_counts]
    x = np.arange(len(counts))
    slope = np.polyfit(x, counts, 1)[0]
    
    if slope > 0.5:
        trend = 'increasing'
    elif slope < -0.5:
        trend = 'decreasing'
    else:
        trend = 'stable'
    
    if counts[0] > 0:
        change_percent = ((counts[-1] - counts[0]) / counts[0]) * 100
    else:
        change_percent = 0
    
    return {
        'trend': trend,
        'change_percent': round(change_percent, 2),
        'slope': round(slope, 4)
    }

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Get open critical incidents
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM incidents 
            WHERE severity = 'CRITICAL' AND status != 'RESOLVED'
        """)
        critical_count = cursor.fetchone()['count']
        
        # Get unassigned incidents
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM incidents 
            WHERE assigned_to IS NULL AND status = 'OPEN'
        """)
        unassigned_count = cursor.fetchone()['count']
        
        # Get stale incidents (> 7 days)
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM incidents 
            WHERE status = 'OPEN' AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
        """)
        stale_count = cursor.fetchone()['count']
        
        # Get new alerts
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM alerts 
            WHERE status = 'NEW'
        """)
        new_alerts = cursor.fetchone()['count']
        
        recommendations = []
        
        if critical_count > 0:
            recommendations.append({
                'id': 'rec_critical_' + str(int(datetime.now().timestamp())),
                'priority': 'high',
                'title': f'Address {critical_count} Critical Incident(s)',
                'description': 'Critical incidents require immediate attention and investigation.',
                'action': 'review_critical',
                'action_label': 'View Critical',
                'count': critical_count
            })
        
        if new_alerts > 0:
            recommendations.append({
                'id': 'rec_alerts_' + str(int(datetime.now().timestamp())),
                'priority': 'high',
                'title': f'Review {new_alerts} New Alert(s)',
                'description': 'New alerts need to be acknowledged and investigated.',
                'action': 'review_alerts',
                'action_label': 'View Alerts',
                'count': new_alerts
            })
        
        if unassigned_count > 0:
            recommendations.append({
                'id': 'rec_assign_' + str(int(datetime.now().timestamp())),
                'priority': 'medium',
                'title': f'Assign {unassigned_count} Unassigned Incident(s)',
                'description': 'Unassigned incidents should be assigned to available analysts.',
                'action': 'assign_incidents',
                'action_label': 'Assign Now',
                'count': unassigned_count
            })
        
        if stale_count > 0:
            recommendations.append({
                'id': 'rec_stale_' + str(int(datetime.now().timestamp())),
                'priority': 'medium',
                'title': f'Review {stale_count} Stale Incident(s)',
                'description': 'Incidents open for more than 7 days need review and resolution.',
                'action': 'review_stale',
                'action_label': 'Review Stale',
                'count': stale_count
            })
        
        if len(recommendations) == 0:
            recommendations.append({
                'id': 'rec_none_' + str(int(datetime.now().timestamp())),
                'priority': 'low',
                'title': 'No Immediate Actions Required',
                'description': 'All incidents and alerts are properly managed. Great job!',
                'action': 'none',
                'action_label': 'View Dashboard',
                'count': 0
            })
        
        return jsonify({'recommendations': recommendations})
    
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.route('/api/recommendations/<recommendation_id>/apply', methods=['POST'])
def apply_recommendation(recommendation_id):
    connection = None
    cursor = None
    try:
        data = request.get_json() or {}
        action = data.get('action', '')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        result_message = ""
        
        if action == 'review_critical':
            cursor.execute("""
                SELECT id, incident_id, title, severity 
                FROM incidents 
                WHERE severity = 'CRITICAL' AND status != 'RESOLVED'
                LIMIT 5
            """)
            incidents = cursor.fetchall()
            result_message = f"Found {len(incidents)} critical incidents requiring review"
            
        elif action == 'review_alerts':
            # Get new alerts for review
            cursor.execute("""
                SELECT id, alert_name, severity, source 
                FROM alerts 
                WHERE status = 'NEW'
                LIMIT 5
            """)
            alerts = cursor.fetchall()
            result_message = f"Found {len(alerts)} new alerts requiring review"
            
        elif action == 'assign_incidents':
            # Auto-assign unassigned incidents to available analysts
            cursor.execute("SELECT id FROM users WHERE role IN ('ANALYST', 'ADMIN') AND is_active = TRUE")
            analysts = cursor.fetchall()
            
            if analysts:
                analyst_ids = [a['id'] for a in analysts]
                cursor.execute("""
                    SELECT id FROM incidents 
                    WHERE assigned_to IS NULL AND status = 'OPEN'
                    LIMIT 10
                """)
                unassigned = cursor.fetchall()
                
                for idx, incident in enumerate(unassigned):
                    analyst_id = analyst_ids[idx % len(analyst_ids)]
                    cursor.execute("""
                        UPDATE incidents 
                        SET assigned_to = %s, status = 'IN_PROGRESS' 
                        WHERE id = %s
                    """, (analyst_id, incident['id']))
                
                connection.commit()
                result_message = f"Auto-assigned {len(unassigned)} incidents to available analysts"
            else:
                result_message = "No active analysts available for assignment"
                
        elif action == 'review_stale':
            # Get stale incidents
            cursor.execute("""
                SELECT id, incident_id, title, created_at 
                FROM incidents 
                WHERE status = 'OPEN' AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
                LIMIT 10
            """)
            stale = cursor.fetchall()
            result_message = f"Found {len(stale)} stale incidents requiring review"
            
        else:
            result_message = "No specific action taken"
        
        return jsonify({
            'success': True,
            'message': result_message,
            'recommendation_id': recommendation_id,
            'action': action,
            'applied_at': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error applying recommendation: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.route('/api/analytics/incident-forest', methods=['GET'])
def get_incident_forest():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                i.id,
                i.incident_id,
                i.title,
                i.severity,
                i.status,
                i.incident_type,
                i.source_ip,
                i.destination_ip,
                i.attack_vector,
                i.created_at,
                u.username as created_by_name
            FROM incidents i
            LEFT JOIN users u ON i.created_by = u.id
            WHERE i.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY i.created_at DESC
            LIMIT 50
        """)
        
        incidents = cursor.fetchall()
    
        nodes = []
        for incident in incidents:
            nodes.append({
                'id': str(incident['id']),
                'label': incident['incident_id'],
                'title': incident['title'],
                'severity': incident['severity'],
                'status': incident['status'],
                'type': incident['incident_type'] or 'Unknown',
                'group': incident['severity'],
                'value': 1 if incident['severity'] == 'CRITICAL' else 
                        2 if incident['severity'] == 'HIGH' else 
                        3 if incident['severity'] == 'MEDIUM' else 4
            })
        
        # Build edges based on common attributes
        edges = []
        for i, incident1 in enumerate(incidents):
            for j, incident2 in enumerate(incidents):
                if i >= j:
                    continue
                
                # Check for relationships
                weight = 0
                label = None
                
                # Same source IP
                if incident1['source_ip'] and incident2['source_ip'] and incident1['source_ip'] == incident2['source_ip']:
                    weight += 3
                    label = 'Same Source'
                
                # Same destination IP
                if incident1['destination_ip'] and incident2['destination_ip'] and incident1['destination_ip'] == incident2['destination_ip']:
                    weight += 3
                    label = 'Same Target'
                
                # Same attack vector
                if incident1['attack_vector'] and incident2['attack_vector'] and incident1['attack_vector'] == incident2['attack_vector']:
                    weight += 2
                    label = label or 'Same Vector'
                
                # Same incident type
                if incident1['incident_type'] and incident2['incident_type'] and incident1['incident_type'] == incident2['incident_type']:
                    weight += 1
                
                # Time proximity (within 24 hours)
                time_diff = abs((incident1['created_at'] - incident2['created_at']).total_seconds()) if incident1['created_at'] and incident2['created_at'] else 86401
                if time_diff <= 86400:  # 24 hours
                    weight += 1
                
                if weight >= 3:
                    edges.append({
                        'from': str(incident1['id']),
                        'to': str(incident2['id']),
                        'value': weight,
                        'label': label or 'Related',
                        'title': f'Connection strength: {weight}'
                    })
        
        # Get attack patterns summary
        cursor.execute("""
            SELECT 
                attack_vector,
                COUNT(*) as count,
                GROUP_CONCAT(DISTINCT severity) as severities
            FROM incidents
            WHERE attack_vector IS NOT NULL
            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY attack_vector
            ORDER BY count DESC
            LIMIT 10
        """)
        
        attack_patterns = cursor.fetchall()
        
        # Get threat actors (source IPs with multiple incidents)
        cursor.execute("""
            SELECT 
                source_ip,
                COUNT(*) as incident_count,
                GROUP_CONCAT(DISTINCT incident_type) as types
            FROM incidents
            WHERE source_ip IS NOT NULL
            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY source_ip
            HAVING incident_count > 1
            ORDER BY incident_count DESC
            LIMIT 10
        """)
        
        threat_actors = cursor.fetchall()
        
        return jsonify({
            'nodes': nodes,
            'edges': edges,
            'attack_patterns': [
                {
                    'vector': p['attack_vector'],
                    'count': p['count'],
                    'severities': p['severities'].split(',') if p['severities'] else []
                } for p in attack_patterns
            ],
            'threat_actors': [
                {
                    'ip': t['source_ip'],
                    'incident_count': t['incident_count'],
                    'types': t['types'].split(',') if t['types'] else []
                } for t in threat_actors
            ],
            'summary': {
                'total_incidents': len(nodes),
                'relationships_found': len(edges),
                'attack_patterns_identified': len(attack_patterns),
                'threat_actors_identified': len(threat_actors)
            }
        })
    
    except Exception as e:
        logger.error(f"Error generating incident forest: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# NEW: Get threat intelligence insights
@app.route('/api/analytics/threat-intel', methods=['GET'])
def get_threat_intel():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Get threat intelligence stats
        cursor.execute("""
            SELECT 
                indicator_type,
                COUNT(*) as count,
                AVG(confidence_score) as avg_confidence
            FROM threat_intelligence
            WHERE is_active = TRUE
            GROUP BY indicator_type
        """)
        
        indicator_stats = cursor.fetchall()
        
        # Get high confidence threats
        cursor.execute("""
            SELECT 
                indicator,
                indicator_type,
                threat_type,
                confidence_score,
                source
            FROM threat_intelligence
            WHERE confidence_score >= 80
            AND is_active = TRUE
            ORDER BY confidence_score DESC
            LIMIT 10
        """)
        
        high_confidence_threats = cursor.fetchall()
        
        # Get recent additions
        cursor.execute("""
            SELECT 
                indicator,
                indicator_type,
                threat_type,
                first_seen
            FROM threat_intelligence
            WHERE first_seen >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY first_seen DESC
            LIMIT 10
        """)
        
        recent_threats = cursor.fetchall()
        
        return jsonify({
            'indicator_stats': indicator_stats,
            'high_confidence_threats': high_confidence_threats,
            'recent_threats': recent_threats,
            'total_active_indicators': sum(s['count'] for s in indicator_stats)
        })
    
    except Exception as e:
        logger.error(f"Error getting threat intel: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)