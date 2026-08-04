const API_URL = import.meta.env.VITE_BACKEND_URL;
if (!API_URL) {
    throw new Error('Missing VITE_BACKEND_URL. Set it in your frontend .env file.');
}

export const baseUrl = API_URL;

export const endpoints = {
    wakeServer: `${API_URL}/wake-server`,
    save: `${API_URL}/save`,
    get: (id) => `${API_URL}/get/${id}`,
    uploadImage: `${API_URL}/image/upload`,
    getImage: (id) => `${API_URL}/image/${id}`,
    downloadImage: (id) => `${API_URL}/image/download/${id}`,
    uploadPdf: `${API_URL}/pdf/upload`,
    getPdf: (id) => `${API_URL}/pdf/${id}`,
    previewPdf: (id) => `${API_URL}/pdf/preview/${id}`,
    downloadPdf: (id) => `${API_URL}/pdf/download/${id}`,
    getData: (id) => `${API_URL}/data/${id}`,
    uploadFile: `${API_URL}/file/upload`,
    getFile: (id) => `${API_URL}/file/${id}`,
    previewFile: (id) => `${API_URL}/file/preview/${id}`,
    downloadFile: (id) => `${API_URL}/file/download/${id}`,
    adminLogin: `${API_URL}/admin/login`,
    adminTexts: `${API_URL}/admin/texts`,
    adminImages: `${API_URL}/admin/images`,
    adminDeleteText: (id) => `${API_URL}/admin/texts/${id}`,
    adminDeleteImage: (id) => `${API_URL}/admin/images/${id}`,
    adminDeleteAllTexts: `${API_URL}/admin/texts`,
    adminDeleteAllImages: `${API_URL}/admin/images`,
    adminUpdateText: (id) => `${API_URL}/admin/texts/${id}`,
    adminChangePassword: `${API_URL}/admin/password`,
    adminUpdateCode: (id) => `${API_URL}/admin/texts/${id}/code`,
    adminRegenerateCode: (id) => `${API_URL}/admin/texts/${id}/regenerate-code`,
    adminCheckCode: (code) => `${API_URL}/admin/check-code/${code}`,
    adminUpdateImageCode: (id) => `${API_URL}/admin/images/${id}/code`,
    adminRegenerateImageCode: (id) => `${API_URL}/admin/images/${id}/regenerate-code`,
    adminCheckImageCode: (code) => `${API_URL}/admin/check-image-code/${code}`,

    // File Management
    adminFiles: `${API_URL}/admin/files`,
    adminDeleteFile: (id) => `${API_URL}/admin/files/${id}`,
    adminDeleteAllFiles: `${API_URL}/admin/files`,
    adminUpdateFileCode: (id) => `${API_URL}/admin/files/${id}/code`,
    adminRegenerateFileCode: (id) => `${API_URL}/admin/files/${id}/regenerate-code`,
    adminCheckFileCode: (code) => `${API_URL}/admin/files/check-code/${code}`,

    adminPublicRooms: `${API_URL}/admin/public-rooms`,
    adminDeletePublicRoom: (code) => `${API_URL}/admin/public-rooms/${code}`,
    adminTogglePublicRoomStatus: (code) => `${API_URL}/admin/public-rooms/${code}/toggle-status`,
    adminUsers: `${API_URL}/admin/users`,
    adminDeleteUser: (id) => `${API_URL}/admin/users/${id}`,
    adminDeleteAllUsers: `${API_URL}/admin/users`,
    validatePublicRoom: (code) => `${API_URL}/public-room/validate/${code}`,
    getPublicRoomMessages: (code) => `${API_URL}/public-room/${code}/messages`,
    register: `${API_URL}/register`,
    login: `${API_URL}/login`,
    userMap: `${API_URL}/user/map`,
    userItems: (username) => `${API_URL}/user/${username}/items`,
    userHistory: (username) => `${API_URL}/user/${username}/history`,
};

export default {
    API_URL,
    baseUrl,
    endpoints,
};