# BillBook CCTV & Hybrid Attendance User Manual

This guide explains how to connect **Uniview (EZView) / Hikvision / Dahua / CP Plus** DVRs and NVRs to BillBook for automated facial-recognition attendance—**without installing any software on office PCs**—and how to scale this across many customers without visiting every site.

---

## Part 1: Will I Have to Visit Every Customer's Office? (SaaS Scaling Answer)

**No.** When selling BillBook to dozens or hundreds of businesses, you should **not** manually configure routers on-site. Use a **3-tier onboarding model** based on each customer's setup:

| Customer Type | Recommended Setup | Who Does the Setup? | On-Site Visit Needed? |
|---|---|---|---|
| **1. Has CCTV + Public IP** | **DDNS + Port 554 → Cloud Worker** | Customer's existing CCTV technician enters the RTSP URL in BillBook | **No** (10-min remote/phone setup) |
| **2. Has CGNAT / No IT Staff** | **Entrance Tablet Kiosk** (browser camera + rotating QR) | Customer opens a URL on any spare Android tablet/phone | **No** (60-sec self-serve) |
| **3. Enterprise / Multi-Branch CCTV + CGNAT** | **Pre-Configured Plug-and-Play Edge Box** (`go2rtc` + Tunnel) | Ship a pre-flashed mini-box; customer plugs in power + Ethernet | **No** (plug-and-play) |

> [!TIP]
> For **field sales & traveling staff**, pair any of the above with BillBook's **Geofenced Mobile Selfie Check-In** so both office staff and field reps feed into the exact same `attendance_records` table and payroll LOP/overtime engine.

---

## Part 2: Step-by-Step Setup (DVR/NVR → Cloud Python Worker)

Use this checklist for any office or customer site that wants to connect existing CCTV cameras with **zero local PC software**.

### Step 1: Check for a Public IP (Not CGNAT)
1. Log in to the office router admin panel (commonly `192.168.1.1` or `192.168.0.1`).
2. Find the **WAN IP** address on the router status page.
3. From a browser on the same office Wi-Fi, open [whatismyipaddress.com](https://whatismyipaddress.com).
4. **Compare both IPs:**
   - **Match:** You have a public IP. Proceed to Step 2.
   - **Mismatch (CGNAT):** Port forwarding will not work. Either ask the ISP to enable a public IP, use the **Tablet Kiosk** option, or plug in a pre-configured `go2rtc` + Cloudflare Tunnel box.

### Step 2: Assign a Static Local IP to the DVR/NVR
1. Open your router's **DHCP Reservation / Address Reservation** settings (or the DVR's local `Network → TCP/IP` menu).
2. Bind the DVR's MAC address to a fixed local IP (e.g., `192.168.1.200`).
   - *Why:* Prevents the DVR IP from changing after a power outage or router reboot.

### Step 3: Enable Free DDNS (Dynamic DNS)
1. Create a free hostname on **DuckDNS.org** or **No-IP.com** (e.g., `clientname-cam.duckdns.org`).
2. Enter the DDNS domain and token/credentials into the router's **DDNS** page (or the Uniview NVR's `Network → DDNS` tab).
3. Verify the DDNS status shows **Connected / Updated**.

### Step 4: Forward Port `554` (RTSP) Safely
1. Open the router's **Port Forwarding / Virtual Server** settings.
2. Add a rule (or verify your CCTV installer's existing rule includes `554`):
   - **Service Name:** `CCTV_RTSP`
   - **External Port:** `554` *(or a non-standard external port like `1554` mapped to internal `554`)*
   - **Internal IP:** `192.168.1.200` *(your DVR's static IP)*
   - **Internal Port:** `554`
   - **Protocol:** `TCP`
3. **Security Hardening (Mandatory):**
   - Create a **dedicated read-only user** on the DVR for RTSP (do not use `admin` with a weak password).
   - In the router firewall, restrict inbound traffic on port `554` (or `1554`) to **only your Cloud Python Worker's static IP**.

### Step 5: Build & Test the Low-Bandwidth Sub-Stream URL
Always pull the **sub-stream** (`360p/480p`), not the 4K main stream, to save bandwidth and CPU:

- **Uniview (EZView) NVR/DVR:**
  ```text
  rtsp://<user>:<password>@<ddns-host>:554/unicast/c<channel>/s1/live
  ```
  *(Example: `rtsp://billbook:StrongPass!@clientname-cam.duckdns.org:554/unicast/c1/s1/live` — use `c1`, `c2`, etc. per camera.)*

- **Hikvision / CP Plus / Dahua DVR:**
  ```text
  rtsp://<user>:<password>@<ddns-host>:554/cam/realmonitor?channel=1&subtype=1
  ```
  *(Or for Hikvision: `/Streaming/Channels/102` where `102` = Camera 1 sub-stream.)*

**Test externally before deploying:**
1. Turn off office Wi-Fi on your phone (use **4G/5G mobile data**).
2. Open **VLC Media Player → Open Network Stream**.
3. Paste the RTSP URL and verify live video plays smoothly.

### Step 6: Connect to the Cloud Python Worker
1. Host the Python face-recognition worker (`cctv-bridge/server.py` + `tracker.py`) on an always-on cloud VM (e.g., **Oracle Cloud Always Free VM** or a ~$5/mo Linux VPS—Vercel serverless functions cannot hold 24/7 RTSP connections).
2. Configure the worker's environment variables:
   - `RTSP_URL` = the verified `rtsp://...` sub-stream URL
   - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY` = your BillBook project credentials
   - `FRAME_SAMPLE_FPS` = `2` or `3` (keeps CPU usage low—no GPU required)
3. When an enrolled employee's face is matched, the worker posts a check-in/out event directly to BillBook's `attendance_records` table.

---

## Part 3: Customer Self-Service Rollout Checklist (For Selling at Scale)

Send this 4-line checklist to every new customer's CCTV installer—no on-site visit from your team required:

1. Ensure the DVR/NVR has a static local IP and DDNS enabled.
2. Forward RTSP port `554` (or custom port) to the DVR and whitelist BillBook's cloud server IP.
3. Create a read-only DVR user for BillBook.
4. Paste the tested `rtsp://...` sub-stream URL into **BillBook → Payroll → Attendance → Camera Settings**.

If the customer's ISP blocks port forwarding (CGNAT), instruct them to open **BillBook Kiosk Mode** on a reception tablet instead—it takes 60 seconds and requires zero router configuration.
