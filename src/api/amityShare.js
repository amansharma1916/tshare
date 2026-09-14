// Helpers for the public /amity/share upload funnel.
//
// Every Amity upload is tagged by prefixing the *file name* with a marker. The
// backend stores that name verbatim (`originalName`) and both admin list
// endpoints already support `?search=` as a case-insensitive regex on it, so
// the "Amity Shares" tab can find these uploads with no backend change.

export const AMITY_MARKER = 'amity_share_';

// Mirrors the backend limits (10MB for /image/upload, 50MB for /file/upload).
export const AMITY_MAX_IMAGE_MB = 10;
export const AMITY_MAX_FILE_MB = 50;

// The one type the upload whitelist accepts for anything it does not know about
// (videos included) while keeping the real extension in the file name.
export const AMITY_FALLBACK_MIME = 'application/octet-stream';

const VIDEO_EXTENSIONS = ['mp4', 'm4v', 'webm', 'mov', 'qt', 'ogv', 'avi', 'mkv', '3gp'];

const VIDEO_MIME_BY_EXT = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  qt: 'video/quicktime',
  ogv: 'video/ogg',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
  '3gp': 'video/3gpp',
};

export const getFileExtension = (name = '') => {
  const parts = String(name).split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

export const isVideoName = (name) => VIDEO_EXTENSIONS.includes(getFileExtension(name));

export const isImageFile = (file) =>
  file?.type ? file.type.startsWith('image/') : false;

export const isVideoFile = (file) =>
  (file?.type ? file.type.startsWith('video/') : false) || isVideoName(file?.name);

export const videoMimeForName = (name) =>
  VIDEO_MIME_BY_EXT[getFileExtension(name)] || 'video/mp4';

// Strip anything that could confuse the multipart parser or a signed URL.
export const sanitizeFileName = (name = '') =>
  String(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120) || 'upload';

// `amity_share_<epoch>_<original name>` — the epoch keeps names unique and
// gives a stable order alongside createdAt.
export const buildAmityFileName = (file) =>
  `${AMITY_MARKER}${Date.now()}_${sanitizeFileName(file?.name)}`;

export const stripAmityMarker = (name = '') =>
  String(name)
    .replace(new RegExp(`^${AMITY_MARKER}\\d+_`, 'i'), '')
    .replace(new RegExp(`^${AMITY_MARKER}`, 'i'), '');

// Wrap a picked file so its name carries the marker. Images keep their real
// mime type (images are whitelisted); everything else is relabelled as
// octet-stream so the existing /file/upload whitelist accepts it while the
// extension — and therefore the R2 key and originalName — stay intact.
export const buildAmityUploadFile = (file) => {
  const type = isImageFile(file) ? file.type : AMITY_FALLBACK_MIME;
  return new File([file], buildAmityFileName(file), { type });
};
