"""
CCTV Device Discovery & Serial Number (SN) Resolver
Supports Dahua/CP Plus (UDP 37810), ONVIF WS-Discovery (UDP 3702), and Uniview/Hikvision discovery.
Automatically discovers DVR/NVR devices on the local network and maps Serial Numbers to live IPs & RTSP URLs.
"""

import json
import socket
import struct
import time
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("cctv_discovery")


def discover_dahua_devices(timeout: float = 3.0) -> List[Dict[str, Any]]:
    """
    Broadcasts Dahua/CP Plus UDP discovery packet on port 37810 and collects device responses.
    Returns list of discovered devices with their SN, IP, Port, and Model.
    """
    devices: List[Dict[str, Any]] = []
    seen_sns = set()

    # Dahua search broadcast payload (JSON-RPC)
    search_payload = json.dumps({
        "method": "client.search",
        "params": {
            "mac": ""
        }
    }).encode('utf-8')

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.settimeout(timeout)

    try:
        sock.sendto(search_payload, ('255.255.255.255', 37810))
        start_time = time.time()

        while time.time() - start_time < timeout:
            try:
                data, addr = sock.recvfrom(4096)
                text = data.decode('utf-8', errors='ignore').strip()
                if not text:
                    continue

                # Dahua returns JSON response
                try:
                    res = json.loads(text)
                    params = res.get("params", {}) or res.get("result", {})
                    device_info = params.get("device", {}) if isinstance(params.get("device"), dict) else params
                    
                    sn = device_info.get("sn") or device_info.get("serialNumber") or device_info.get("SerialNo") or ""
                    ip = device_info.get("ip") or device_info.get("IPv4Address", {}).get("IP") or addr[0]
                    port = device_info.get("port") or 37777
                    device_type = device_info.get("deviceType") or device_info.get("machineName") or "Dahua/CP Plus DVR"

                    if sn and sn not in seen_sns:
                        seen_sns.add(sn)
                        devices.append({
                            "brand": "dahua",
                            "sn": sn,
                            "ip": ip,
                            "port": port,
                            "rtsp_port": 554,
                            "name": device_type,
                            "raw": device_info
                        })
                except json.JSONDecodeError:
                    # Some Dahua firmware returns raw XML or header
                    if "serialNumber" in text or "SerialNo" in text:
                        devices.append({
                            "brand": "dahua",
                            "sn": "detected_dahua",
                            "ip": addr[0],
                            "port": 37777,
                            "rtsp_port": 554,
                            "name": "Dahua/CP Plus DVR",
                            "raw": text[:200]
                        })
            except socket.timeout:
                break
            except Exception as e:
                logger.debug("Dahua recv error: %s", e)
                break
    except Exception as e:
        logger.error("Dahua discovery error: %s", e)
    finally:
        sock.close()

    return devices


def discover_onvif_devices(timeout: float = 3.0) -> List[Dict[str, Any]]:
    """
    Standard ONVIF WS-Discovery probe across UDP port 3702.
    Works across Hikvision, Uniview, Dahua, CP Plus, and generic ONVIF devices.
    """
    devices: List[Dict[str, Any]] = []
    seen_ips = set()

    probe_xml = (
        '<?xml version="1.0" encoding="utf-8"?>'
        '<Envelope xmlns:dn="http://www.onvif.org/ver10/network/wsdl" '
        'xmlns="http://www.w3.org/2003/05/soap-envelope">'
        '<Header>'
        '<wsa:MessageID xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing">'
        'uuid:d8cf01b0-449e-4c7b-8266-993d59663806'
        '</wsa:MessageID>'
        '<wsa:To xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing">'
        'urn:schemas-xmlsoap-org:ws:2005:04:discovery'
        '</wsa:To>'
        '<wsa:Action xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing">'
        'http://schemas.xmlsoap.org/ws/2005/04/discovery/Probe'
        '</wsa:Action>'
        '</Header>'
        '<Body>'
        '<Probe xmlns="http://schemas.xmlsoap.org/ws/2005/04/discovery">'
        '<Types>dn:NetworkVideoTransmitter</Types>'
        '</Probe>'
        '</Body>'
        '</Envelope>'
    ).encode('utf-8')

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.settimeout(timeout)

    try:
        sock.sendto(probe_xml, ('239.255.255.250', 3702))
        start_time = time.time()

        while time.time() - start_time < timeout:
            try:
                data, addr = sock.recvfrom(4096)
                ip = addr[0]
                if ip not in seen_ips:
                    seen_ips.add(ip)
                    text = data.decode('utf-8', errors='ignore')
                    
                    # Extract XAddrs or endpoint
                    devices.append({
                        "brand": "onvif",
                        "sn": f"ONVIF-{ip.replace('.', '')}",
                        "ip": ip,
                        "port": addr[1],
                        "rtsp_port": 554,
                        "name": f"ONVIF Camera/DVR ({ip})",
                        "raw": text[:200]
                    })
            except socket.timeout:
                break
            except Exception as e:
                logger.debug("ONVIF recv error: %s", e)
                break
    except Exception as e:
        logger.error("ONVIF discovery error: %s", e)
    finally:
        sock.close()

    return devices


def scan_network_for_dvrs() -> List[Dict[str, Any]]:
    """
    Runs multi-protocol local network discovery (Dahua/CP Plus UDP 37810 + ONVIF 3702).
    """
    # Increased timeout to 3s for slower DVRs on congested networks
    dahua_devs = discover_dahua_devices(timeout=3.0)
    onvif_devs = discover_onvif_devices(timeout=3.0)

    # Merge and deduplicate by IP
    merged: Dict[str, Dict[str, Any]] = {}
    for d in dahua_devs:
        merged[d["ip"]] = d
    for o in onvif_devs:
        if o["ip"] not in merged:
            merged[o["ip"]] = o

    return list(merged.values())


def resolve_sn_to_rtsp(sn: str, brand: str = "dahua", user: str = "admin", password: str = "", channel: str = "1") -> Optional[str]:
    """
    Attempts to match a user-entered Serial Number (SN) against active network DVRs
    and generates the appropriate RTSP URL.
    """
    clean_sn = sn.strip().upper()
    active_devices = scan_network_for_dvrs()

    target_ip = None
    target_rtsp_port = 554

    for dev in active_devices:
        dev_sn = str(dev.get("sn", "")).upper()
        if clean_sn in dev_sn or dev_sn in clean_sn:
            target_ip = dev.get("ip")
            target_rtsp_port = dev.get("rtsp_port", 554)
            break

    # If exact SN match found on network, assemble the RTSP stream URL
    if target_ip:
        u = user.strip() or "admin"
        p = password.strip()
        auth = f"{u}:{p}@" if p else f"{u}@"
        ch = channel.strip() or "1"

        if brand.lower() in ["dahua", "cpplus"]:
            # Dahua realmonitor URL
            return f"rtsp://{auth}{target_ip}:{target_rtsp_port}/cam/realmonitor?channel={ch}&subtype=0"
        elif brand.lower() in ["hikvision", "hilook"]:
            return f"rtsp://{auth}{target_ip}:{target_rtsp_port}/Streaming/Channels/{ch}01"
        elif brand.lower() in ["uniview", "unv"]:
            return f"rtsp://{auth}{target_ip}:{target_rtsp_port}/unicast/c{ch}/s0/live"
        else:
            return f"rtsp://{auth}{target_ip}:{target_rtsp_port}/live/ch{ch}"

    return None
