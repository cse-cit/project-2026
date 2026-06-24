import os
from datetime import datetime
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from flask_socketio import SocketIO, emit

# Explicitly find the templates directory path
base_dir = os.path.dirname(os.path.abspath(__file__))
template_dir = os.path.join(base_dir, 'templates')

app = Flask(__name__, template_folder=template_dir)
CORS(app) 
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def render_dashboard():
    return render_template('dashboard.html')

@app.route('/api/crash', methods=['POST'])
def receive_crash_data():
    incoming_payload = request.get_json() or {}
    
    # Extract keys and fall back to defaults if missing
    speed = incoming_payload.get('speed_kmh') or incoming_payload.get('speed', 0)
    timestamp = incoming_payload.get('timestamp', datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    
    # Structure the precise payload matching your dashboard.html JavaScript keys
    telemetry_packet = {
        "vehicle_id": incoming_payload.get('vehicle_id', 'VEHICLE_NODE_N'),
        "speed": speed,
        "latitude": float(incoming_payload.get('latitude', 23.3441)),
        "longitude": float(incoming_payload.get('longitude', 85.3096)),
        "timestamp": timestamp
    }
    
    print(f"\n[🚨 CRASH INCIDENT LOGGED]: Vehicle {telemetry_packet['vehicle_id']} at {speed} km/h")
    
    # Simultaneously emit to WebSockets dashboard
    socketio.emit('emergency_dispatch', telemetry_packet)
    print("📢 Telemetry and tracking metrics broadcasted to dashboard nodes.")
    
    return jsonify({"status": "processed", "message": "ResQNet orchestration complete"}), 200

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
