export const endpoints = {
  authorityStats: "/api/authority/stats",
  voterRequests: "/api/authority/voter-requests",
  requestStatus: (requestId: string) => `/api/authority/voter-request/${requestId}/status`,
  flags: "/api/authority/flags",
  resolveFlag: (flagId: string) => `/api/authority/flag/${flagId}/resolve`,
  boothRisk: (boothId: string) => `/api/authority/booth/${boothId}/risk`,
  integrityCertificate: (constituencyId: string) => `/api/audit/certificate/${constituencyId}`
};
