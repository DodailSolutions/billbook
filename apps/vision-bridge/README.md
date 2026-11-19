# BillBooky Desktop Vision AI Bridge Runner

A lightweight companion service for Windows and macOS that connects local office CCTV / IP cameras and DVRs (CP Plus, Dahua, Hikvision, Tapo) directly to BillBooky touchless attendance.

---

## Key Features

1. **P2P Serial Number Support (CP Plus / Dahua EasyViewer)**:
   - Connect directly using your DVR device Serial Number (e.g. `7M0AE22PCA5725A`), username, and password.
   - Bypasses the need for static public IPs, router firewall port forwards, or dynamic DNS setups.

2. **Automated Subnet Discovery**:
   - Automatically probes your office Wi-Fi / local LAN for ONVIF Profile S cameras and Dahua media ports (`37777` / `554`).

3. **100% DPDP Act Compliant Edge Processing**:
   - Face detection and 512-D vector extraction occur in-memory on your local computer.
   - **Zero raw video or image frames are ever transmitted or stored**—only mathematical coordinate embeddings and check-in timestamp logs are synced.

4. **Local Loopback API**:
   - Exposes `http://127.0.0.1:8989` with CORS support, allowing your browser on BillBooky to test handshakes and query active camera streams in real-time.

---

## Quick Start

### Windows
Double-click `billbooky-vision-bridge-setup.bat` or run:
```bash
npx @billbooky/vision-bridge
```

### macOS
Double-click `billbooky-vision-bridge-mac.command` or run:
```bash
npx @billbooky/vision-bridge
```
