// ─────────────────────────────────────────────────────────────
// TRASH — unused API endpoints removed from api.js
//
// These were never referenced by any component. They're kept here
// for reference; restore by copying back into `endpoints` in
// ./api.js and updating the backend route if needed.
// ─────────────────────────────────────────────────────────────

// const API_URL = import.meta.env.VITE_BACKEND_URL;

// const trashEndpoints = {
//   // Legacy text retrieval — RecievePage uses getData() instead.
//   get: (id) => `${API_URL}/get/${id}`,

//   // Raw image object — UI only ever uses download/preview variants.
//   getImage: (id) => `${API_URL}/image/${id}`,

//   // PDF-specific endpoints — unified with the generic File endpoints
//   // (uploadFile / previewFile / downloadFile) since the file migration.
//   uploadPdf: `${API_URL}/pdf/upload`,
//   getPdf: (id) => `${API_URL}/pdf/${id}`,
//   previewPdf: (id) => `${API_URL}/pdf/preview/${id}`,
//   downloadPdf: (id) => `${API_URL}/pdf/download/${id}`,

//   // Raw file object — UI uses previewFile() instead.
//   getFile: (id) => `${API_URL}/file/${id}`,

//   // Public room endpoints — PublicRoom.jsx calls the validate URL
//   // directly (${baseUrl}/public-room/validate/${code}) and room
//   // messages arrive over Socket.IO, not this REST endpoint.
//   validatePublicRoom: (code) => `${API_URL}/public-room/validate/${code}`,
//   getPublicRoomMessages: (code) => `${API_URL}/public-room/${code}/messages`,

//   // Username mapping — UsernameMapper now persists to localStorage only.
//   userMap: `${API_URL}/user/map`,
//   userItems: (username) => `${API_URL}/user/${username}/items`,
// };

// export { trashEndpoints };
