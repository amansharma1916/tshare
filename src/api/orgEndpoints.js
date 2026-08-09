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
  submitText: (code) => `${baseUrl}/org/submit/${code}`,
  uploadFile: (code) => `${baseUrl}/org/upload/${code}`,
};

export default { orgEndpoints };
