/**
 * ClearQueue API Client
 * Connects frontend clinical interface with FastAPI + SQLite backend.
 * Provides resilient communication with automatic reconnection and fallback.
 */

class ClearQueueApiClient {
  constructor() {
    // If hosted directly on FastAPI (e.g. port 8000), use same-origin; otherwise target localhost:8000
    const isFastApiOrigin = window.location.port === '8000';
    this.baseUrl = isFastApiOrigin ? '' : 'http://localhost:8000';
    this.isConnected = false;
    this.lastCheckedAt = null;
    this.listeners = new Set();
  }

  onStatusChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyStatus(connected) {
    const changed = this.isConnected !== connected;
    this.isConnected = connected;
    this.lastCheckedAt = new Date();
    if (changed) {
      this.listeners.forEach(cb => {
        try { cb(this.isConnected); } catch (e) { console.error(e); }
      });
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          errorDetail = errJson.detail || JSON.stringify(errJson);
        } catch (_) {
          errorDetail = await response.text();
        }
        throw new Error(errorDetail);
      }

      this.notifyStatus(true);
      return await response.json();
    } catch (err) {
      // If network failure / connection refused
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        this.notifyStatus(false);
      }
      throw err;
    }
  }

  async checkHealth() {
    try {
      const res = await this.request('/api/health');
      this.notifyStatus(true);
      return res;
    } catch (e) {
      this.notifyStatus(false);
      return null;
    }
  }

  async getPatients() {
    return await this.request('/api/patients');
  }

  async createPatient(patientData) {
    return await this.request('/api/patients', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
  }

  async updatePatient(patientId, updatePayload) {
    return await this.request(`/api/patients/${encodeURIComponent(patientId)}`, {
      method: 'PUT',
      body: JSON.stringify(updatePayload)
    });
  }

  async markPatientSeen(patientId, { reason, seen_by }) {
    return await this.request(`/api/patients/${encodeURIComponent(patientId)}/seen`, {
      method: 'POST',
      body: JSON.stringify({ reason, seen_by })
    });
  }

  async reassessPatient(patientId, { action, justification, reassessed_by }) {
    return await this.request(`/api/patients/${encodeURIComponent(patientId)}/reassess`, {
      method: 'POST',
      body: JSON.stringify({ action, justification, reassessed_by })
    });
  }

  async getRooms(category = null) {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return await this.request(`/api/rooms${query}`);
  }

  async allocateRoom(roomId, patientId, notes = '', allocated_by = 'Room Coordinator') {
    return await this.request(`/api/rooms/${encodeURIComponent(roomId)}/allocate`, {
      method: 'POST',
      body: JSON.stringify({ patient_id: patientId, notes, allocated_by })
    });
  }

  async vacateRoom(roomId, markSeen = true, discharged_by = null) {
    return await this.request(`/api/rooms/${encodeURIComponent(roomId)}/vacate`, {
      method: 'POST',
      body: JSON.stringify({ mark_seen: markSeen, discharged_by })
    });
  }

  async transferRoom(fromRoomId, toRoomId, patientId, transferred_by = 'Room Coordinator') {
    return await this.request('/api/rooms/transfer', {
      method: 'POST',
      body: JSON.stringify({
        from_room_id: fromRoomId,
        to_room_id: toRoomId,
        patient_id: patientId,
        transferred_by
      })
    });
  }

  async advanceWaitTimes(minutes = 5) {
    return await this.request('/api/patients/advance-wait', {
      method: 'POST',
      body: JSON.stringify({ minutes })
    });
  }

  async resetDatabase() {
    return await this.request('/api/patients/reset', {
      method: 'POST'
    });
  }
}

export const api = new ClearQueueApiClient();
