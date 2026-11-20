# VisionAI CCTV & Multi-Person P2P Tracking Service

Lightweight high-performance Python bridge for CCTV cameras (RTSP/ONVIF), multi-person detection, ByteTrack tracking, facial recognition matching, WebSocket frame streaming, and WebRTC P2P live stream relay.

## Architecture

```
[ CCTV / IP Cameras (RTSP / P2P) ]
            │ (Local LAN / RTSP port 554)
            ▼
[ Local Vision Bridge (port 5050) ]
  ├── RTSP Video Ingestion (OpenCV / PyAV)
  ├── Multi-Person Detection & ByteTrack
  ├── 512-D Face Biometric Matching
  ├── WebSocket Frame Relay (/ws/stream) - Mixed Content safe for HTTPS
  ├── Direct LAN Probe (/camera/probe)
  ├── Chrome Private Network Access (PNA) Headers
  └── Supabase Auto-Attendance Punch Poster
            │ (Secure WebSocket / Local Loopback)
            ▼
[ BillBook Next.js Web App (https://billbooky.dodail.com) ]
```

## 1-Click Quick Start

### macOS
Double-click `start-bridge.command` or run in terminal:
```bash
./start-bridge.command
```

### Windows
Double-click `start-bridge.bat` or run:
```cmd
start-bridge.bat
```

### Manual Setup
```bash
cd cctv-bridge
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server.py --port 5050
```
