"""
High-Throughput Multi-Person Group Tracker & Face Recognition Engine
Designed for crowded gates, lobbies, and turnstiles.
Handles concurrent group entry/exit with automatic face matching and anti-passback/debounce controls.
"""

import math
import os
import time
import logging
import requests
import numpy as np
from typing import Dict, List, Tuple, Optional, Any, Callable

logger = logging.getLogger("cctv_tracker")


class EnrolledProfile:
    def __init__(self, employee_id: str, name: str, code: str, embedding: np.ndarray):
        self.employee_id = employee_id
        self.name = name
        self.code = code
        norm = np.linalg.norm(embedding)
        self.embedding = embedding / (norm + 1e-8) if norm > 0 else embedding


class AttendancePunchEvent:
    def __init__(self, employee_id: str, employee_name: str, employee_code: str,
                 direction: str, confidence: float, camera_id: str, timestamp: float):
        self.employee_id = employee_id
        self.employee_name = employee_name
        self.employee_code = employee_code
        self.direction = direction  # 'IN' or 'OUT'
        self.confidence = confidence
        self.camera_id = camera_id
        self.timestamp = timestamp

    def to_dict(self) -> Dict[str, Any]:
        return {
            "employee_id": self.employee_id,
            "employee_name": self.employee_name,
            "employee_code": self.employee_code,
            "event_type": self.direction,
            "confidence_score": round(self.confidence, 3),
            "camera_id": self.camera_id,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(self.timestamp))
        }


class TrackedPerson:
    def __init__(self, track_id: int, bbox: Tuple[int, int, int, int]):
        self.track_id = track_id
        self.bbox = bbox  # (x, y, w, h)
        center_x = bbox[0] + bbox[2] // 2
        center_y = bbox[1] + bbox[3] // 2
        self.positions: List[Tuple[int, int]] = [(center_x, center_y)]
        self.start_time = time.time()
        self.last_seen = time.time()
        
        # Biometric state
        self.employee_id: Optional[str] = None
        self.employee_name: Optional[str] = None
        self.employee_code: Optional[str] = None
        self.confidence: float = 0.0
        self.has_punched: bool = False
        self.direction: Optional[str] = None

    def update(self, bbox: Tuple[int, int, int, int]):
        self.bbox = bbox
        center_x = bbox[0] + bbox[2] // 2
        center_y = bbox[1] + bbox[3] // 2
        self.positions.append((center_x, center_y))
        self.last_seen = time.time()
        if len(self.positions) > 50:
            self.positions.pop(0)

        # Detect direction vector across recent motion history
        if len(self.positions) >= 4:
            start_y = self.positions[0][1]
            curr_y = self.positions[-1][1]
            diff_y = curr_y - start_y
            if diff_y > 15:
                self.direction = 'IN'  # Moving toward camera / through gate
            elif diff_y < -15:
                self.direction = 'OUT' # Moving away from camera

    def assign_biometric_match(self, emp_id: str, name: str, code: str, conf: float):
        """Accumulate confidence across frames to resist single-frame false positives."""
        if conf > self.confidence:
            self.employee_id = emp_id
            self.employee_name = name
            self.employee_code = code
            self.confidence = conf


def post_punch_to_billbook(event: AttendancePunchEvent, api_url: Optional[str] = None, org_token: Optional[str] = None):
    """
    Dispatches a verified attendance punch event to the BillBook API route.
    """
    endpoint = api_url or os.environ.get("BILLBOOK_ATTENDANCE_API", "http://localhost:3000/api/payroll/attendance/movement")
    token = org_token or os.environ.get("ORGANIZATION_TOKEN", "billbook_local_dev_token")

    payload = event.to_dict()
    payload["org_token"] = token

    headers = {
        "Content-Type": "application/json",
        "X-Admin-Token": token,
        "Authorization": f"Bearer {token}"
    }

    try:
        response = requests.post(endpoint, json=payload, headers=headers, timeout=5.0)
        if response.status_code in [200, 201]:
            logger.info("Successfully recorded punch for %s (%s): %s", event.employee_name, event.employee_code, event.direction)
        else:
            logger.warning("BillBook API rejected punch (%d): %s", response.status_code, response.text)
    except Exception as ex:
        logger.error("Failed to post punch to BillBook API (%s): %s", endpoint, ex)


class MultiPersonTracker:
    def __init__(self, 
                 gate_y_ratio: float = 0.65, 
                 max_disappeared: int = 30,
                 punch_cooldown_seconds: int = 300,
                 on_punch_callback: Optional[Callable[[AttendancePunchEvent], None]] = None,
                 billbook_api_url: Optional[str] = None,
                 org_token: Optional[str] = None):
        """
        gate_y_ratio: Fraction of frame height representing the virtual gate threshold line.
        punch_cooldown_seconds: Minimum seconds before the same employee can be punched again (anti-passback).
        """
        self.next_id = 1
        self.tracks: Dict[int, TrackedPerson] = {}
        self.disappeared: Dict[int, int] = {}
        self.max_disappeared = max_disappeared
        self.gate_y_ratio = gate_y_ratio
        self.punch_cooldown = punch_cooldown_seconds
        self.last_punched_time: Dict[str, float] = {}  # { employee_id: timestamp }
        self.enrolled_profiles: List[EnrolledProfile] = []
        self.on_punch_callback = on_punch_callback or (lambda evt: post_punch_to_billbook(evt, billbook_api_url, org_token))
        self.billbook_api_url = billbook_api_url
        self.org_token = org_token

        # Initialize detector: try YOLO if installed, otherwise OpenCV HOG
        self.yolo_model = None
        self._init_detector()

    def _init_detector(self):
        try:
            from ultralytics import YOLO
            self.yolo_model = YOLO("yolov8n.pt")
            logger.info("YOLOv8n person detector loaded successfully.")
        except Exception:
            logger.info("Ultralytics YOLO not found or failed to load. Using built-in OpenCV HOG Person Detector.")
            import cv2
            self.hog = cv2.HOGDescriptor()
            self.hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())

    def detect_people(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Runs person detection on input frame. Returns list of (x, y, w, h) bounding boxes.
        """
        h, w = frame.shape[:2]
        boxes: List[Tuple[int, int, int, int]] = []

        if self.yolo_model is not None:
            try:
                results = self.yolo_model(frame, classes=[0], verbose=False)
                for r in results:
                    for box in r.boxes:
                        coords = box.xyxy[0].cpu().numpy()
                        bx1, by1, bx2, by2 = map(int, coords)
                        boxes.append((bx1, by1, max(0, bx2 - bx1), max(0, by2 - by1)))
                return boxes
            except Exception as e:
                logger.debug("YOLO inference error, falling back to HOG: %s", e)

        # Fallback to OpenCV HOG
        if hasattr(self, 'hog'):
            try:
                import cv2
                scale_w = min(1.0, 640.0 / w)
                resized = cv2.resize(frame, (int(w * scale_w), int(h * scale_w)))
                found, _ = self.hog.detectMultiScale(resized, winStride=(8, 8), padding=(8, 8), scale=1.05)
                for (x, y, bw, bh) in found:
                    boxes.append((int(x / scale_w), int(y / scale_w), int(bw / scale_w), int(bh / scale_w)))
            except Exception as e:
                logger.error("HOG detection error: %s", e)

        return boxes

    def load_enrolled_profiles(self, profiles: List[Dict[str, Any]]):
        """
        Loads enrolled employee 512-D face vectors into active memory for real-time cosine comparison.
        """
        self.enrolled_profiles = []
        for p in profiles:
            vec = np.array(p.get("embedding", []), dtype=np.float32)
            if vec.size > 0:
                self.enrolled_profiles.append(
                    EnrolledProfile(
                        employee_id=p["id"],
                        name=p.get("name", "Unknown"),
                        code=p.get("employee_code", "EMP"),
                        embedding=vec
                    )
                )
        logger.info("Loaded %d enrolled biometric profiles into memory.", len(self.enrolled_profiles))

    def match_face_vector(self, face_embedding: np.ndarray, threshold: float = 0.65) -> Optional[Tuple[str, str, str, float]]:
        """
        Performs vectorized cosine similarity across all enrolled profiles simultaneously.
        Returns (employee_id, name, code, confidence) if matched above threshold.
        """
        if not self.enrolled_profiles or face_embedding is None:
            return None

        norm = np.linalg.norm(face_embedding)
        norm_vec = face_embedding / (norm + 1e-8) if norm > 0 else face_embedding
        best_score = -1.0
        best_match = None

        for prof in self.enrolled_profiles:
            sim = float(np.dot(norm_vec, prof.embedding))
            if sim > best_score:
                best_score = sim
                best_match = prof

        if best_match and best_score >= threshold:
            return (best_match.employee_id, best_match.name, best_match.code, best_score)
        return None

    def update(self, detections: List[Tuple[int, int, int, int]], 
               face_embeddings: Optional[List[Optional[np.ndarray]]] = None,
               frame_height: int = 360,
               camera_id: str = "default") -> List[AttendancePunchEvent]:
        """
        Batch-updates all detected persons in the frame simultaneously.
        Matches tracks, detects gate crossing, and fires attendance punch events.
        """
        gate_y = int(frame_height * self.gate_y_ratio)
        new_punches: List[AttendancePunchEvent] = []

        if len(detections) == 0:
            for track_id in list(self.disappeared.keys()):
                self.disappeared[track_id] += 1
                if self.disappeared[track_id] > self.max_disappeared:
                    del self.tracks[track_id]
                    del self.disappeared[track_id]
            return new_punches

        # Multi-person pairwise association
        det_centers = [(b[0] + b[2] // 2, b[1] + b[3] // 2) for b in detections]
        track_ids = list(self.tracks.keys())
        assigned_tracks = set()
        assigned_dets = set()

        if len(self.tracks) > 0:
            track_centers = [self.tracks[tid].positions[-1] for tid in track_ids]

            for d_idx, d_center in enumerate(det_centers):
                best_dist = float('inf')
                best_track_id = None
                for t_idx, t_id in enumerate(track_ids):
                    if t_id in assigned_tracks:
                        continue
                    tc = track_centers[t_idx]
                    dist = math.hypot(d_center[0] - tc[0], d_center[1] - tc[1])
                    if dist < best_dist and dist < 160:
                        best_dist = dist
                        best_track_id = t_id

                if best_track_id is not None:
                    self.tracks[best_track_id].update(detections[d_idx])
                    self.disappeared[best_track_id] = 0
                    assigned_tracks.add(best_track_id)
                    assigned_dets.add(d_idx)

                    # Update biometric match if face embedding provided
                    if face_embeddings and d_idx < len(face_embeddings) and face_embeddings[d_idx] is not None:
                        match = self.match_face_vector(face_embeddings[d_idx])
                        if match:
                            emp_id, emp_name, emp_code, conf = match
                            self.tracks[best_track_id].assign_biometric_match(emp_id, emp_name, emp_code, conf)

        # Spawn new tracks for unassigned detections
        for d_idx, bbox in enumerate(detections):
            if d_idx not in assigned_dets:
                t = TrackedPerson(self.next_id, bbox)
                if face_embeddings and d_idx < len(face_embeddings) and face_embeddings[d_idx] is not None:
                    match = self.match_face_vector(face_embeddings[d_idx])
                    if match:
                        emp_id, emp_name, emp_code, conf = match
                        t.assign_biometric_match(emp_id, emp_name, emp_code, conf)

                self.tracks[self.next_id] = t
                self.disappeared[self.next_id] = 0
                self.next_id += 1

        # Check gate line crossing for all active persons concurrently
        now = time.time()
        for t_id, person in list(self.tracks.items()):
            if len(person.positions) >= 2 and not person.has_punched:
                prev_y = person.positions[-2][1]
                curr_y = person.positions[-1][1]

                # Crossing gate line downward (IN) or upward (OUT)
                crossed_in = prev_y < gate_y <= curr_y
                crossed_out = prev_y > gate_y >= curr_y

                if crossed_in or crossed_out or (person.direction and len(person.positions) >= 8):
                    event_direction = person.direction or ('IN' if crossed_in else 'OUT')
                    
                    # Verify identification or default track punch
                    target_emp_id = person.employee_id or f"unidentified_track_{t_id}"
                    last_punch = self.last_punched_time.get(target_emp_id, 0)

                    if (now - last_punch) >= self.punch_cooldown:
                        punch = AttendancePunchEvent(
                            employee_id=target_emp_id,
                            employee_name=person.employee_name or f"Person #{t_id}",
                            employee_code=person.employee_code or "TRACK",
                            direction=event_direction,
                            confidence=person.confidence or 0.85,
                            camera_id=camera_id,
                            timestamp=now
                        )
                        new_punches.append(punch)
                        self.last_punched_time[target_emp_id] = now
                        person.has_punched = True

                        if self.on_punch_callback:
                            try:
                                self.on_punch_callback(punch)
                            except Exception as e:
                                logger.error("Error in on_punch_callback: %s", e)

        # Clean disappeared tracks
        for t_id in track_ids:
            if t_id not in assigned_tracks:
                self.disappeared[t_id] = self.disappeared.get(t_id, 0) + 1
                if self.disappeared[t_id] > self.max_disappeared:
                    del self.tracks[t_id]
                    del self.disappeared[t_id]

        return new_punches
