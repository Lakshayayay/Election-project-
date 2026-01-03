export const endpoints = {
  submitVoterRequest: "/api/voter/request",
  trackStatus: "/api/voter/track-status",
  getVoterByEpic: (epicId: string) => `/api/voter/epic/${epicId}`,
  electionResults: "/api/election/results"
};
