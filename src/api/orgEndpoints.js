import { baseUrl } from './api';

// Org module endpoints — mirrors the shape of src/api/api.js so the org
// pages stay self-contained and never collide with the user/admin surface.
export const orgEndpoints = {
  register: `${baseUrl}/org/register`,
  login: `${baseUrl}/org/login`,
  validate: (code) => `${baseUrl}/org/validate/${code}`,
  dashboard: `${baseUrl}/org/dashboard`,
  qr: `${baseUrl}/org/qr`,
  deleteData: (id) => `${baseUrl}/org/data/${id}`,
  previewData: (id) => `${baseUrl}/org/preview/${id}`,
  previewDataRaw: (id) => `${baseUrl}/org/preview/${id}?raw=1`,
  previewDataPdf: (id) => `${baseUrl}/org/preview/${id}?pdf=1`,
  previewStatus: (id) => `${baseUrl}/org/preview/${id}/status`,
  downloadData: (id) => `${baseUrl}/org/download/${id}`,
  submitText: (code) => `${baseUrl}/org/submit/${code}`,
  uploadFile: (code) => `${baseUrl}/org/upload/${code}`,
  searchDashboard: `${baseUrl}/org/dashboard/search`,
  autoPrint: `${baseUrl}/org/auto-print`,
  printQueue: `${baseUrl}/org/print/queue`,
  printMove: (id) => `${baseUrl}/org/print/queue/${id}/move`,
  printCancel: (id) => `${baseUrl}/org/print/queue/${id}/cancel`,
  printRetry: (id) => `${baseUrl}/org/print/queue/${id}/retry`,
};

export default { orgEndpoints };
