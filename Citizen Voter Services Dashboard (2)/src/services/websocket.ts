// WebSocket Service for Citizen Dashboard

import { io, Socket } from 'socket.io-client';
import type { VoterRequest, ElectionResult } from './api';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

export class WebSocketService {
  private socket: Socket | null = null;
  private statusCallbacks: Array<(request: VoterRequest) => void> = [];

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('citizen:request_status_updated', (data: { request: VoterRequest } | VoterRequest) => {
      const request = 'request' in data ? data.request : data;
      this.statusCallbacks.forEach(cb => cb(request));
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.statusCallbacks = [];
    }
  }

  onRequestStatusUpdate(callback: (request: VoterRequest) => void): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  // Submit voter request via WebSocket
  submitVoterRequest(
    requestType: string,
    submittedData: Record<string, any>,
    epicId?: string,
    onResponse?: (request: VoterRequest) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.socket) {
      this.connect();
    }

    this.socket!.emit('submit_voter_request', {
      request_type: requestType,
      submitted_data: submittedData,
      epic_id: epicId,
    });

    this.socket!.once('citizen:voter_request_submitted', (data: { request: VoterRequest }) => {
      onResponse?.(data.request);
    });

    this.socket!.once('citizen:error', (data: { message: string }) => {
      onError?.(data.message);
    });
  }

  // Track EPIC status via WebSocket
  trackEpicStatus(
    requestId?: string,
    epicId?: string,
    mobile?: string,
    onUpdate?: (request: VoterRequest) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.socket) {
      this.connect();
    }

    this.socket!.emit('track_epic_status', {
      request_id: requestId,
      epic_id: epicId,
      mobile: mobile,
    });

    this.socket!.once('citizen:epic_status_update', (data: { request: VoterRequest }) => {
      onUpdate?.(data.request);
    });

    this.socket!.once('citizen:error', (data: { message: string }) => {
      onError?.(data.message);
    });
  }

  // Fetch live results via WebSocket
  fetchLiveResults(
    constituency?: string,
    onResults?: (results: ElectionResult[]) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.socket) {
      this.connect();
    }

    this.socket!.emit('fetch_live_results', { constituency });

    this.socket!.once('citizen:live_results', (data: { results: ElectionResult[] }) => {
      onResults?.(data.results);
    });

    this.socket!.once('citizen:error', (data: { message: string }) => {
      onError?.(data.message);
    });
  }

  // Download EPIC via WebSocket
  downloadEpic(
    epicId: string,
    securityCode: string,
    onReady?: (data: { epic_id: string; download_url: string }) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.socket) {
      this.connect();
    }

    this.socket!.emit('download_epic', { epic_id: epicId, security_code: securityCode });

    this.socket!.once('citizen:epic_download_ready', (data: { epic_id: string; download_url: string }) => {
      onReady?.(data);
    });

    this.socket!.once('citizen:error', (data: { message: string }) => {
      onError?.(data.message);
    });
  }
}

export const wsService = new WebSocketService();
