# VisionAI CCTV & Multi-Person P2P Tracking Service

Lightweight high-performance Python bridge for CCTV cameras (RTSP/ONVIF), multi-person detection, ByteTrack tracking, facial recognition matching, and WebRTC P2P live stream relay.

## Architecture

```
[ CCTV / IP Cameras (RTSP) ]
            │
            ▼
[ Python CCTV Bridge (port 5000) ]
  ├── RTSP Video Ingestion (OpenCV / PyAV)
  ├── Multi-Person Detection & ByteTrack
  ├── 512-D Face Biometric Matching
  ├── P2P WebRTC / MJPEG Streamer (aiortc / FastAPI)
  └── Supabase Auto-Attendance Punch Poster
            │
            ▼
[ BillBook Next.js Web App (Dashboard & Kiosk) ]
```

## Quick Start

```bash
cd billbook/cctv-bridge
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server.py --port 5000
```
