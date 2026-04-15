from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.ensemble import RandomForestClassifier
import numpy as np
import pandas as pd
import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime, timedelta
import json
import logging
import random

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

# Database configuration - Supports Docker (via env) and Manual (default localhost)
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

# Threat Prediction Model using Scikit-Learn (Lighter and better alternative to PyTorch)
class ThreatPredictionModel:
    def __init__(self):
        # We use a Random Forest as it's more stable for SOC data and doesn't require PyTorch
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.is_trained = False
        self._initialize_dummy_training()

    def _initialize_dummy_training(self):
        # Initialize with dummy data so the model can predict immediately
        X = np.random.rand(10, 10)
        y = [0, 1, 2, 3, 4, 0, 1, 2, 3, 4] # Classes: LOW, MEDIUM, HIGH, CRITICAL, INFO
        self.model.fit(X, y)
        self.is_trained = True

    def predict(self, features):
        features_array = np.array(features).reshape(1, -1)
        probabilities = self.model.predict_proba(features_array)[0]
        return probabilities

# Initialize model
ai_model = ThreatPredictionModel()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'ai-service'})

@app.route('/api/predict/threat', methods=['POST'])
def predict_threat():
    try:
        data = request.get_json()
        features = extract_features(data)

        # Make prediction using Scikit-Learn model
        probabilities = ai_model.predict(features)

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

@app.route('/api/analyze/incidents', methods=['GET'])
def analyze_incidents():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)

        # Get incident statistics
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

        # Get daily incident counts
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

        # Get attack vector distribution
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

        cursor.close()
        connection.close()

        # Calculate trends
        trend_analysis = calculate_trends(daily_counts)

        return jsonify({
            'severity_stats': severity_stats,
            'daily_counts': daily_counts,
            'attack_vectors': attack_vectors,
            'trend_analysis': trend_analysis
        })
    except Exception as e:
        logger.error(f"Error analyzing incidents: {e}")
        return jsonify({'error': str(e)}), 500

def calculate_trends(daily_counts):
    """Calculate trend analysis from daily incident counts"""
    if len(daily_counts) < 2:
        return {'trend': 'insufficient_data', 'change_percent': 0}

    counts = [d['count'] for d in daily_counts]
    x = np.arange(len(counts))
    slope = np.polyfit(x, counts, 1)[0]

    if slope > 0.5: trend = 'increasing'
    elif slope < -0.5: trend = 'decreasing'
    else: trend = 'stable'

    change_percent = ((counts[-1] - counts[0]) / counts[0] * 100) if counts[0] > 0 else 0

    return {'trend': trend, 'change_percent': round(change_percent, 2), 'slope': round(slope, 4)}

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    try:
        connection = get_db_connection()
        if not connection: return jsonify({'error': 'Database connection failed'}), 500
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT COUNT(*) as count FROM incidents WHERE severity = 'CRITICAL' AND status != 'RESOLVED'")
        critical_count = cursor.fetchone()['count']
        cursor.execute("SELECT COUNT(*) as count FROM incidents WHERE assigned_to IS NULL AND status = 'OPEN'")
        unassigned_count = cursor.fetchone()['count']
        cursor.execute("SELECT COUNT(*) as count FROM incidents WHERE status = 'OPEN' AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)")
        stale_count = cursor.fetchone()['count']
        cursor.execute("SELECT COUNT(*) as count FROM alerts WHERE status = 'NEW'")
        new_alerts = cursor.fetchone()['count']

        cursor.close()
        connection.close()

        recommendations = []
        if critical_count > 0:
            recommendations.append({'id': 'rec_critical_' + str(int(datetime.now().timestamp())), 'priority': 'high', 'title': f'Fix {critical_count} Critical Incident(s)', 'description': 'Critical incidents require immediate attention.', 'action': 'review_critical', 'action_label': 'View Critical', 'count': critical_count})
        if new_alerts > 0:
            recommendations.append({'id': 'rec_alerts_' + str(int(datetime.now().timestamp())), 'priority': 'high', 'title': f'Check {new_alerts} New Alert(s)', 'description': 'New alerts need to be acknowledged.', 'action': 'review_alerts', 'action_label': 'View Alerts', 'count': new_alerts})
        if unassigned_count > 0:
            recommendations.append({'id': 'rec_assign_' + str(int(datetime.now().timestamp())), 'priority': 'medium', 'title': f'Assign {unassigned_count} Unassigned Incident(s)', 'description': 'Unassigned incidents should be assigned to analysts.', 'action': 'assign_incidents', 'action_label': 'Assign Now', 'count': unassigned_count})
        if stale_count > 0:
            recommendations.append({'id': 'rec_stale_' + str(int(datetime.now().timestamp())), 'priority': 'medium', 'title': f'Review {stale_count} Stale Incident(s)', 'description': 'Incidents open for more than 7 days need review.', 'action': 'review_stale', 'action_label': 'Review Stale', 'count': stale_count})

        if len(recommendations) == 0:
            recommendations.append({'id': 'rec_none_' + str(int(datetime.now().timestamp())), 'priority': 'low', 'title': 'No Immediate Actions Required', 'description': 'All clear.', 'action': 'none', 'action_label': 'View Dashboard', 'count': 0})

        return jsonify({'recommendations': recommendations})
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations/<recommendation_id>/apply', methods=['POST'])
def apply_recommendation(recommendation_id):
    try:
        data = request.get_json() or {}
        action = data.get('action', '')

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        result_message = ""

        if action == 'review_critical':
            # Get critical incidents for review
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

        cursor.close()
        connection.close()

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

@app.route('/api/analytics/incident-forest', methods=['GET'])
def get_incident_forest():
    try:
        connection = get_db_connection()
        if not connection: return jsonify({'error': 'Database connection failed'}), 500
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT i.id, i.incident_id, i.title, i.severity, i.status, i.incident_type, i.source_ip, i.destination_ip, i.attack_vector, i.created_at
            FROM incidents i WHERE i.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) ORDER BY i.created_at DESC LIMIT 50
        """)
        incidents = cursor.fetchall()

        nodes = []
        for i in incidents:
            nodes.append({'id': str(i['id']), 'label': i['incident_id'], 'title': i['title'], 'severity': i['severity'], 'status': i['status'], 'type': i['incident_type'] or 'Unknown', 'group': i['severity']})

        edges = []
        for i, inc1 in enumerate(incidents):
            for j, inc2 in enumerate(incidents):
                if i >= j: continue
                weight = 0
                if inc1['source_ip'] and inc1['source_ip'] == inc2['source_ip']: weight += 3
                if inc1['destination_ip'] and inc1['destination_ip'] == inc2['destination_ip']: weight += 3
                if inc1['attack_vector'] and inc1['attack_vector'] == inc2['attack_vector']: weight += 2
                if weight >= 3:
                    edges.append({'from': str(inc1['id']), 'to': str(inc2['id']), 'value': weight, 'label': 'Related'})

        cursor.execute("SELECT attack_vector, COUNT(*) as count, GROUP_CONCAT(DISTINCT severity) as severities FROM incidents WHERE attack_vector IS NOT NULL GROUP BY attack_vector LIMIT 10")
        attack_patterns = cursor.fetchall()
        cursor.execute("SELECT source_ip, COUNT(*) as incident_count FROM incidents WHERE source_ip IS NOT NULL GROUP BY source_ip HAVING incident_count > 1 LIMIT 10")
        threat_actors = cursor.fetchall()

        cursor.close()
        connection.close()
        return jsonify({'nodes': nodes, 'edges': edges, 'attack_patterns': [{'vector': p['attack_vector'], 'count': p['count'], 'severities': p['severities'].split(',')} for p in attack_patterns], 'threat_actors': threat_actors, 'summary': {'total_incidents': len(nodes), 'relationships_found': len(edges), 'attack_patterns_identified': len(attack_patterns), 'threat_actors_identified': len(threat_actors)}})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/forecast', methods=['GET'])
def get_forecast():
    try:
        connection = get_db_connection()
        if not connection: return jsonify({'error': 'Database connection failed'}), 500
        cursor = connection.cursor(dictionary=True)
        now = datetime.now().replace(minute=0, second=0, microsecond=0)
        hours = [(now - timedelta(hours=i)).strftime('%Y-%m-%d %H:00:00') for i in range(11, -1, -1)]
        cursor.execute("SELECT DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as timestamp, COUNT(*) as count FROM incidents WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 HOUR) GROUP BY timestamp")
        actual_counts = {row['timestamp']: row['count'] for row in cursor.fetchall()}
        forecast = [{'label': datetime.strptime(hr, '%Y-%m-%d %H:00:00').strftime('%I%p'), 'value': actual_counts.get(hr, 0)} for hr in hours]
        cursor.close()
        connection.close()
        return jsonify({'forecast': forecast})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/threat-intel', methods=['GET'])
def get_threat_intel():
    try:
        connection = get_db_connection()
        if not connection: return jsonify({'error': 'Database connection failed'}), 500
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT indicator_type, COUNT(*) as count, AVG(confidence_score) as avg_confidence FROM threat_intelligence GROUP BY indicator_type")
        indicator_stats = cursor.fetchall()
        cursor.close()
        connection.close()
        return jsonify({'indicator_stats': indicator_stats})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
