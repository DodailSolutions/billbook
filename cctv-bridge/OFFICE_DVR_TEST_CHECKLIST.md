# Office DVR Testing & Setup Checklist

**DVR Detected:** Dahua / CP Plus (`SN: 7M0AE22PCA5725A`)  
**Active Wi-Fi Network:** `Dodail`  
**DVR Local IP:** `192.168.0.193` (Router Gateway: `192.168.0.1`)  
**RTSP Port:** `554` (Already enabled on DVR)

---

## Step 1: Fix Wi-Fi Auto-Connect on the DVR
1. On your DVR monitor, go to **Setting → Network → WiFi**.
2. Check the **`WIFI Auto Connect`** box so the DVR automatically reconnects to `Dodail` after any power cut.
3. Click **Save / Apply**.

---

## Step 2: Test Live Video Locally (On `Dodail` Wi-Fi)
1. Connect your laptop or phone to the **`Dodail`** Wi-Fi.
2. Open **VLC Media Player** → **Media → Open Network Stream** (or *Network Stream* on mobile).
3. Paste your DVR's sub-stream URL (replace `<username>` and `<password>` with your DVR login):
   ```text
   rtsp://<username>:<password>@192.168.0.193:554/cam/realmonitor?channel=1&subtype=1
   ```
   - Change `channel=1` to `channel=2`, `3`, `4` to test your other cameras.
   - `subtype=1` is the low-bandwidth sub-stream (best for face recognition).
4. **Result:** If the video plays, your DVR's RTSP stream is 100% working locally.

---

## Step 3: Verify Port Forwarding & Public IP on Router (`192.168.0.1`)
1. Open a browser on `Dodail` Wi-Fi and log in to your router at `http://192.168.0.1`.
2. **Reserve Static IP:** Under **DHCP / Address Reservation**, bind your DVR (`192.168.0.193`) so its IP never changes.
3. **Check Port Forwarding (Virtual Server):**
   - Confirm there is a rule forwarding **External Port `554` (TCP)** → **Internal IP `192.168.0.193`**, **Internal Port `554`**.
   - If your installer only forwarded ports `80` or `37777`, add port `554` right alongside them.
4. **Check Public IP vs CGNAT:**
   - Compare your router's **WAN IP** against [whatismyipaddress.com](https://whatismyipaddress.com).
   - **If they match:** You have a public IP—set up free **DDNS** (e.g., DuckDNS) on the router or DVR (`Setting → Network → DDNS`).
   - **If they do NOT match (CGNAT):** Port forwarding from outside won't work; ask your ISP for a public IP or use a local relay (`go2rtc` + Cloudflare Tunnel).

---

## Step 4: Test From Outside the Office (Mobile Data)
1. Turn **OFF** Wi-Fi on your phone (switch to **4G/5G**).
2. Open **VLC → Open Network Stream** and test with your DDNS hostname (or public IP):
   ```text
   rtsp://<username>:<password>@<your-ddns-or-public-ip>:554/cam/realmonitor?channel=1&subtype=1
   ```
3. Once this plays over mobile data, your DVR is ready to connect directly to BillBook's cloud Python face-recognition worker and multi-camera attendance dashboard.
