const sidebarSections = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
      { label: 'Buy Code', icon: 'credit-card', path: '/buy' },
    ],
  },
  {
    label: 'Share',
    items: [
      { label: 'Share Text', icon: 'message-square', path: '/share' },
      { label: 'Share Image', icon: 'image', path: '/share-image' },
      { label: 'Share File', icon: 'file', path: '/share-file' },
    ],
  },
  {
    label: 'Receive',
    items: [
      { label: 'Receive Content', icon: 'download', path: '/receive' },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Public Rooms', icon: 'users', path: '/public-room' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Admin Panel', icon: 'shield', path: '/admin/panel' },
    ],
  },
  {
    label: 'Organization',
    items: [
      { label: 'Login as Org', icon: 'shield', path: '/org/login' },
      { label: 'Register as Org', icon: 'user', path: '/org/register' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Texts', icon: 'message-square', path: '/admin/panel?tab=texts' },
      { label: 'Images', icon: 'image', path: '/admin/panel?tab=images' },
      { label: 'Files', icon: 'file', path: '/admin/panel?tab=files' },
      { label: 'Public Rooms', icon: 'users', path: '/admin/panel?tab=public-rooms' },
      { label: 'Users', icon: 'user', path: '/admin/panel?tab=users' },
      { label: 'Premium Codes', icon: 'credit-card', path: '/admin/panel?tab=premium-codes' },
      { label: 'Premium Users', icon: 'user-check', path: '/admin/panel?tab=premium-users' },
      { label: 'Settings', icon: 'settings', path: '/admin/panel?tab=settings' },
    ],
  },
  {
    label: 'More',
    items: [
      { label: 'About', icon: 'info', path: '/about' },
      { label: 'Contact', icon: 'mail', path: '/contact' },
      { label: 'Privacy Policy', icon: 'file-text', path: '/privacy-policy' },
      { label: 'Terms of Service', icon: 'file-text', path: '/terms-of-service' },
    ],
  },
];

export default sidebarSections;
