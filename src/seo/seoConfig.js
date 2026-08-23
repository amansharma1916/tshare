// Per-route SEO configuration.
//
// SLOGAN: "One 4-character key. Anything inside." — the core TShare idea:
// any content locked behind a short key, openable anywhere.
export const SLOGAN = 'One 4-character key. Anything inside.'
export const BRAND = 'TShare'
export const SITE_URL = 'https://tshare.in'
export const SITE_IMAGE = 'https://tshare.in/s2.svg'

// Shared description base — every page description carries the slogan.
const baseDesc = (tail) =>
  `${SLOGAN} ${tail}`

// Defaults used for any route without an explicit entry (e.g. org pages).
const defaults = {
  title: `${BRAND} — ${SLOGAN} | Share Text, Images & Files with 4-Digit Codes`,
  description: baseDesc(
    'Share text, images and files instantly using 4-digit codes. No registration required. Premium plans with custom codes, password protection and a content dashboard.'
  ),
  keywords:
    'file sharing, 4-digit code, text sharing, image sharing, file transfer, secure sharing, no registration, instant sharing, premium file sharing, quick share, tshare',
  canonical: '/',
  jsonLd: 'WebSite',
}

// Route → SEO entry. Keys are path prefixes matched by the current location.
// `match` may contain a single ':' placeholder replaced with the URL param.
export const seoConfig = [
  {
    path: '/',
    exact: true,
    title: `${BRAND} — ${SLOGAN} | Share Text, Images & Files`,
    description: baseDesc(
      'The easiest way to share anything. Lock text, images or files behind a 4-digit key — anyone can open it on any device, no account needed.'
    ),
    keywords:
      'file sharing, 4-digit code, text sharing, image sharing, file transfer, secure sharing, no registration, instant sharing, tshare',
    canonical: '/',
    jsonLd: 'WebSite',
  },
  {
    path: '/share',
    title: `Share Text Online | ${BRAND} — ${SLOGAN}`,
    description: baseDesc(
      'Paste any text — notes, links, passwords — and lock it behind a 4-digit key. No registration, works on any device.'
    ),
    keywords: 'share text, text sharing, 4-digit code, anonymous text share, paste and share, tshare',
    canonical: '/share',
  },
  {
    path: '/share-image',
    title: `Share Images Instantly | ${BRAND} — ${SLOGAN}`,
    description: baseDesc(
      'Upload a photo or image and get a 4-digit key instantly. Recipients open it on any device without signing up.'
    ),
    keywords: 'share image, image sharing, photo sharing, 4-digit code, instant image upload, tshare',
    canonical: '/share-image',
  },
  {
    path: '/share-file',
    title: `Share Files Fast | ${BRAND} — ${SLOGAN}`,
    description: baseDesc(
      'Send PDFs, documents and more with a 4-digit key. Up to 50MB, no registration required, openable anywhere.'
    ),
    keywords: 'share files, file sharing, file transfer, send pdf, document sharing, 4-digit code, tshare',
    canonical: '/share-file',
  },
  {
    path: '/receive',
    title: `Receive & Open Any Share | ${BRAND} — ${SLOGAN}`,
    description: baseDesc(
      'Enter a 4-digit key to open shared text, images or files instantly on any device.'
    ),
    keywords: 'receive file, open share, enter code, 4-digit code, view shared content, tshare',
    canonical: '/receive',
  },
  {
    path: '/login',
    title: `Login | ${BRAND}`,
    description: 'Log in to TShare to track your shared content and access your premium dashboard.',
    keywords: 'tshare login, user login',
    canonical: '/login',
  },
  {
    path: '/register',
    title: `Create Account | ${BRAND}`,
    description: 'Register on TShare to keep a history of everything you have shared and received.',
    keywords: 'tshare register, create account, sign up',
    canonical: '/register',
  },
  {
    path: '/auth',
    title: `Get Started | ${BRAND} — ${SLOGAN}`,
    description: baseDesc('Choose how you want to use TShare — share, receive or go premium.'),
    canonical: '/auth',
  },
  {
    path: '/buy',
    title: `Buy Premium Code | ${BRAND} — ${SLOGAN}`,
    description:
      'Buy a premium TShare code — custom 4 or 6 character keys, password protection, display names, public marquee listing and a content dashboard.',
    keywords: 'buy premium code, premium file sharing, custom share code, password protected sharing, tshare premium',
    canonical: '/buy',
  },
  {
    path: '/premium/login',
    title: `Premium Login | ${BRAND}`,
    description: 'Log in to your TShare premium account to manage your codes and content.',
    canonical: '/premium/login',
  },
  {
    path: '/premium/dashboard',
    title: `Premium Dashboard | ${BRAND}`,
    description: 'Manage your premium codes — update content, set passwords, control visibility and renew before expiry.',
    canonical: '/premium/dashboard',
  },
  {
    path: '/dashboard',
    title: `My Shares & History | ${BRAND}`,
    description: 'View your TShare sharing history — everything you shared and received, all in one place.',
    canonical: '/dashboard',
  },
  {
    path: '/public-room',
    title: `Public Room Chat | ${BRAND} — ${SLOGAN}`,
    description: 'Join a public room on TShare and chat in real time with anyone who has the 4-digit room code.',
    keywords: 'public room, chat room, real-time chat, group chat, 4-digit room code, tshare',
    canonical: '/public-room',
  },
  {
    path: '/about',
    title: `About | ${BRAND} — ${SLOGAN}`,
    description: 'Learn how TShare makes sharing simple — one 4-digit key, anything inside, openable on any device.',
    canonical: '/about',
  },
  {
    path: '/contact',
    title: `Contact | ${BRAND}`,
    description: 'Get in touch with the TShare team — questions, feedback or support.',
    canonical: '/contact',
  },
  {
    path: '/privacy-policy',
    title: `Privacy Policy | ${BRAND}`,
    description: 'Read the TShare privacy policy to understand how your data and shared content are handled.',
    canonical: '/privacy-policy',
  },
  {
    path: '/terms-of-service',
    title: `Terms of Service | ${BRAND}`,
    description: 'The terms that govern your use of TShare.',
    canonical: '/terms-of-service',
  },
  {
    path: '/org/register',
    title: `Organization Registration | ${BRAND} — ${SLOGAN}`,
    description: 'Register your organization on TShare to receive files and messages from customers through a public code and QR.',
    canonical: '/org/register',
  },
  {
    path: '/org/login',
    title: `Organization Login | ${BRAND}`,
    description: 'Log in to your TShare organization dashboard to view received files and messages.',
    canonical: '/org/login',
  },
  {
    path: '/org/dashboard',
    title: `Organization Dashboard | ${BRAND}`,
    description: 'Manage your TShare organization — view received files, messages and your public QR.',
    canonical: '/org/dashboard',
  },
  {
    path: '/org/submit/',
    title: `Send a Message | ${BRAND} — ${SLOGAN}`,
    description: 'Send a text message to an organization through TShare using its public code. No account needed.',
    canonical: '/org/submit/:code',
  },
  {
    path: '/org/upload/',
    title: `Send a File | ${BRAND} — ${SLOGAN}`,
    description: 'Hand over a photo or document to an organization through TShare using its public code. No account needed.',
    canonical: '/org/upload/:code',
  },
  {
    path: '/admin/login',
    title: `Admin Login | ${BRAND}`,
    description: 'Restricted admin access for TShare.',
    canonical: '/admin/login',
    noindex: true,
  },
  {
    path: '/admin',
    title: `Admin Panel | ${BRAND}`,
    description: 'Restricted admin panel for TShare.',
    canonical: '/admin/panel',
    noindex: true,
  },
]

// Resolve the best matching entry for a location path.
export const getSeoForPath = (pathname) => {
  const clean = pathname.split('?')[0]
  let best = null
  for (const entry of seoConfig) {
    if (entry.exact) {
      if (clean === entry.path) best = entry
    } else if (clean.startsWith(entry.path)) {
      // Prefer the longest matching prefix
      if (!best || entry.path.length > best.path.length) best = entry
    }
  }
  return best || defaults
}
