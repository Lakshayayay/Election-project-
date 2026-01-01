// WebSocket Service for Authority Dashboard

import { io, Socket } from 'socket.io-client';
import type { VoterRequest, Flag } from './api';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

export class AuthorityWebSocketService {
  private socket: Socket | null = null;
  private callbacks: Map<string, ((data: any) => void)[]> = new Map();

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Authority WebSocket connected');
      this.emit('authority_connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Authority WebSocket disconnected');
    });

    // Register all event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('authority:new_voter_request_received', (data: VoterRequest) => {
      this.triggerCallbacks('new_voter_request_received', data);
    });

    this.socket.on('authority:risk_score_updated', (data: { request_id: string; risk_score: string; explanation: string }) => {
      this.triggerCallbacks('risk_score_updated', data);
    });

    this.socket.on('authority:flag_generated', (data: Flag) => {
      this.triggerCallbacks('flag_generated', data);
    });

    this.socket.on('authority:audit_alert_raised', (data: { alert_id: string; type: string; message: string; severity: string }) => {
      this.triggerCallbacks('audit_alert_raised', data);
    });

    this.socket.on('authority:request_queue_updated', (data: { pending_count: number; high_risk_count: number }) => {
      this.triggerCallbacks('request_queue_updated', data);
    });

    this.socket.on('authority:form17a_uploaded', (data: { upload_id: string; booth_id: string; record_count: number }) => {
      this.triggerCallbacks('form17a_uploaded', data);
    });

    this.socket.on('authority:request_status_updated', (data: VoterRequest) => {
      this.triggerCallbacks('request_status_updated', data);
    });

    this.socket.on('authority:audit_flag_detected', (data: Flag) => {
      this.triggerCallbacks('audit_flag_detected', data);
    });

    this.socket.on('authority:count_mismatch_alert', (data: { booth_id: string; form17a_count: number; form17c_count: number }) => {
      this.triggerCallbacks('count_mismatch_alert', data);
    });

    this.socket.on('authority:booth_risk_updated', (data: { booth_id: string; risk_level: string; flag_count: number }) => {
      this.triggerCallbacks('booth_risk_updated', data);
    });
  }

  private triggerCallbacks(event: string, data: any): void {
    const callbacks = this.callbacks.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    if (!callback) {
      this.callbacks.delete(event);
      return;
    }

    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.callbacks.clear();
    }
  }
}

export const authorityWS = new AuthorityWebSocketService();
