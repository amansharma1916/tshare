import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminPanel.css';
import AdminDashboard from './AdminDashboard';
import bannerText from './bannerText';
import { endpoints } from '../api/api';
import { Skeleton } from './common/Skeleton';

const PAGE_SIZE = 10;

// Admin panel internal navigation tabs
const ADMIN_TABS = [
    { key: 'dashboard', label: 'Analytics', icon: 'analytics' },
    { key: 'texts', label: 'Texts', icon: 'text' },
    { key: 'images', label: 'Images', icon: 'image' },
    { key: 'files', label: 'Files', icon: 'file' },
    { key: 'public-rooms', label: 'Rooms', icon: 'rooms' },
    { key: 'deletion-requests', label: 'Deletion Requests', icon: 'trash' },
    { key: 'users', label: 'Users', icon: 'users' },
    { key: 'premium-codes', label: 'Premium Codes', icon: 'codes' },
    { key: 'premium-users', label: 'Premium Users', icon: 'premium' },
    { key: 'settings', label: 'Settings', icon: 'settings' },
];

const AdminTabIcon = ({ name }) => {
    const props = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
    switch (name) {
        case 'analytics':
            return (
                <svg {...props}>
                    <path d="M3 3v18h18" />
                    <path d="M7 16l4-4 3 3 5-6" />
                </svg>
            );
        case 'text':
            return (
                <svg {...props}>
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
            );
        case 'image':
            return (
                <svg {...props}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </svg>
            );
        case 'file':
            return (
                <svg {...props}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
        case 'rooms':
            return (
                <svg {...props}>
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
            );
        case 'users':
            return (
                <svg {...props}>
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
            );
        case 'codes':
            return (
                <svg {...props}>
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
            );
        case 'premium':
            return (
                <svg {...props}>
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            );
        case 'trash':
            return (
                <svg {...props}>
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
            );
        default:
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
            );
    }
};

// Truncate text to a maximum number of words, appending an ellipsis
const truncateText = (text, maxWords = 50) => {
    if (!text) return '';
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
};

// Renders clamped text with a "View More" button that only appears when the
// content is *actually* visually truncated (i.e. the "..." ellipsis is shown
// by the line clamp), regardless of the raw word count.
const TruncatedText = ({ text, onViewText }) => {
    const contentRef = useRef(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useLayoutEffect(() => {
        const el = contentRef.current;
        if (el) {
            setIsOverflowing(el.scrollHeight > el.clientHeight);
        }
    }, [text]);

    return (
        <div>
            <div
                ref={contentRef}
                style={{
                    maxWidth: '400px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: '1.5'
                }}
            >
                {truncateText(text)}
            </div>
            {isOverflowing && (
                <motion.button
                    className="action-btn edit"
                    onClick={onViewText}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ marginTop: '6px', padding: '4px 10px', fontSize: '12px' }}
                >
                    View More
                </motion.button>
            )}
        </div>
    );
};

// ──────────────────────────────────────────
// Reusable Pagination Controls Component
// ──────────────────────────────────────────
const PaginationControls = ({ currentPage, totalPages, totalItems, onPageChange, pageSize, onPageSizeChange }) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= 0) return [1];
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('dots');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('dots');
            pages.push(totalPages);
        }
        return pages;
    };

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    if (totalPages <= 0) return null;

    return (
        <div className="pagination-controls">
            <div className="pagination-info">
                Showing {startItem}–{endItem} of {totalItems} items
            </div>
            <div className="pagination-buttons">
                <select
                    className="page-size-select"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    title="Items per page"
                >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    title="First page"
                >
                    ≪
                </button>
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    title="Previous"
                >
                    ‹
                </button>
                {getPageNumbers().map((page, index) =>
                    page === 'dots' ? (
                        <span key={index} className="pagination-ellipsis">…</span>
                    ) : (
                        <button
                            key={page}
                            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    )
                )}
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    title="Next"
                >
                    ›
                </button>
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                    title="Last page"
                >
                    ≫
                </button>
            </div>
        </div>
    );
};

const AdminPanel = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getAuthHeaders = (extraHeaders = {}) => {
        const token = sessionStorage.getItem('adminToken');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...extraHeaders,
        };
    };

    // ─── Data State ───
    const [texts, setTexts] = useState([]);
    const [images, setImages] = useState([]);
    const [publicRooms, setPublicRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [deletionRequests, setDeletionRequests] = useState([]);
    const [deletionRequestsLoading, setDeletionRequestsLoading] = useState(true);
    const [deletionRequestsError, setDeletionRequestsError] = useState('');
    const [deletionRequestsFilter, setDeletionRequestsFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [imagesLoading, setImagesLoading] = useState(true);
    const [publicRoomsLoading, setPublicRoomsLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState('');
    const [error, setError] = useState('');
    const [imagesError, setImagesError] = useState('');
    const [publicRoomsError, setPublicRoomsError] = useState('');
    const [files, setFiles] = useState([]);
    const [filesLoading, setFilesLoading] = useState(true);
    const [filesError, setFilesError] = useState('');

    // ─── Premium State ───
    const [premiumCodes, setPremiumCodes] = useState([]);
    const [premiumCodesLoading, setPremiumCodesLoading] = useState(true);
    const [premiumCodesError, setPremiumCodesError] = useState('');

    const [premiumUsers, setPremiumUsers] = useState([]);
    const [premiumUsersLoading, setPremiumUsersLoading] = useState(true);
    const [premiumUsersError, setPremiumUsersError] = useState('');

    // Pricing & Pre-sale Settings State
    const [price4Digit, setPrice4Digit] = useState(299);
    const [price6Digit, setPrice6Digit] = useState(99);
    const [slotPrice, setSlotPrice] = useState(30);
    const [newSaleCode, setNewSaleCode] = useState('');
    const [newSalePrice, setNewSalePrice] = useState(30);

    // Capacity editor state (premium-codes tab)
    const [editingCapacityCode, setEditingCapacityCode] = useState(null);
    const [capacityInput, setCapacityInput] = useState(1);

    // Stats Management State
    const [stats, setStats] = useState({
        visitors: 0,
        files_shared: 0,
        received: 0,
        premium_users: 0
    });
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState('');
    const [todayStats, setTodayStats] = useState({
        visitors: 0,
        files_shared: 0,
        received: 0,
        premium_users: 0,
        date: ''
    });
    const [todayStatsLoading, setTodayStatsLoading] = useState(false);
    const [todayStatsError, setTodayStatsError] = useState('');
    // Unified loading flag for the Settings tab (pricing + stats + today's stats)
    const [settingsLoading, setSettingsLoading] = useState(false);

    // ─── Pagination State ───
    // Page Size
    const [pageSize, setPageSize] = useState(10);
    
    // Texts
    const [textsPage, setTextsPage] = useState(1);
    const [textsPagination, setTextsPagination] = useState(null);
    const [textsSearchInput, setTextsSearchInput] = useState('');
    const [textsSearchTerm, setTextsSearchTerm] = useState('');

    // Images
    const [imagesPage, setImagesPage] = useState(1);
    const [imagesPagination, setImagesPagination] = useState(null);
    const [imagesSearchInput, setImagesSearchInput] = useState('');
    const [imagesSearchTerm, setImagesSearchTerm] = useState('');

    // Files
    const [filesPage, setFilesPage] = useState(1);
    const [filesPagination, setFilesPagination] = useState(null);
    const [filesSearchInput, setFilesSearchInput] = useState('');
    const [filesSearchTerm, setFilesSearchTerm] = useState('');

    // Public Rooms
    const [publicRoomsPage, setPublicRoomsPage] = useState(1);
    const [publicRoomsPagination, setPublicRoomsPagination] = useState(null);

    // Users
    const [usersPage, setUsersPage] = useState(1);
    const [usersPagination, setUsersPagination] = useState(null);

    // ─── Edit / Modal State ───
    const [editingText, setEditingText] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [editingCode, setEditingCode] = useState(null);
    const [newCode, setNewCode] = useState('');
    const [codeError, setCodeError] = useState('');
    const [showImageCodeModal, setShowImageCodeModal] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [newImageCode, setNewImageCode] = useState('');
    const [imageCodeError, setImageCodeError] = useState('');
    const [showFileCodeModal, setShowFileCodeModal] = useState(false);
    const [editingFile, setEditingFile] = useState(null);
    const [newFileCode, setNewFileCode] = useState('');
    const [fileCodeError, setFileCodeError] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [actionMessage, setActionMessage] = useState({ text: '', type: '' });
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
    const [showPublicRoomModal, setShowPublicRoomModal] = useState(false);
    const [publicRoomName, setPublicRoomName] = useState('');
    
    // Premium Code View Modal State
    const [showPremiumCodeModal, setShowPremiumCodeModal] = useState(false);
    const [viewingPremiumCode, setViewingPremiumCode] = useState(null);
    
    // Text View Modal State
    const [showTextViewModal, setShowTextViewModal] = useState(false);
    const [viewingText, setViewingText] = useState(null);

    // Delete-by-Date-Range Modal State
    const [showRangeDeleteModal, setShowRangeDeleteModal] = useState(false);
    const [rangeType, setRangeType] = useState('all');
    const [rangeFrom, setRangeFrom] = useState('');
    const [rangeTo, setRangeTo] = useState('');
    const [rangeCount, setRangeCount] = useState(null);
    const [rangePreviewLoading, setRangePreviewLoading] = useState(false);
    const [rangeDeleting, setRangeDeleting] = useState(false);
    const [rangeError, setRangeError] = useState('');

    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
        if (!isAuthenticated) {
            navigate('/admin/login');
        }
        // Read tab from query params
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['dashboard', 'texts', 'images', 'files', 'public-rooms', 'deletion-requests', 'users', 'premium-codes', 'premium-users', 'settings'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    // ─── Debounce Effects for Search ───
    useEffect(() => {
        const handler = setTimeout(() => {
            setTextsSearchTerm(textsSearchInput);
            setTextsPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [textsSearchInput]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setImagesSearchTerm(imagesSearchInput);
            setImagesPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [imagesSearchInput]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setFilesSearchTerm(filesSearchInput);
            setFilesPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [filesSearchInput]);

    // ─── Fetch Effects (one per tab) ───
    useEffect(() => {
        if (!sessionStorage.getItem('adminAuthenticated')) return;
        if (activeTab === 'texts') {
            fetchTexts(textsPage, textsSearchTerm);
        }
    }, [activeTab, textsPage, textsSearchTerm, pageSize]);

    useEffect(() => {
        if (!sessionStorage.getItem('adminAuthenticated')) return;
        if (activeTab === 'images') {
            fetchImages(imagesPage, imagesSearchTerm);
        }
    }, [activeTab, imagesPage, imagesSearchTerm, pageSize]);

    useEffect(() => {
        if (!sessionStorage.getItem('adminAuthenticated')) return;
        if (activeTab === 'files') {
            fetchFiles(filesPage, filesSearchTerm);
        }
    }, [activeTab, filesPage, filesSearchTerm, pageSize]);

    useEffect(() => {
        if (!sessionStorage.getItem('adminAuthenticated')) return;
        if (activeTab === 'public-rooms') {
            fetchPublicRooms(publicRoomsPage);
        }
    }, [activeTab, publicRoomsPage, pageSize]);

    useEffect(() => {
        if (!sessionStorage.getItem('adminAuthenticated')) return;
        if (activeTab === 'deletion-requests') {
            fetchDeletionRequests();
        }
    }, [activeTab, deletionRequestsFilter]);

    useEffect(() => {
        if (!sessionStorage.getItem('adminAuthenticated')) return;
        if (activeTab === 'users') {
            fetchUsers(usersPage);
        }
    }, [activeTab, usersPage, pageSize]);

    useEffect(() => {
        if (!sessionStorage.getItem('adminAuthenticated')) return;
        if (activeTab === 'premium-codes') {
            fetchPremiumCodes();
        }
    }, [activeTab]);

    useEffect(() => {
        if (!sessionStorage.getItem('adminAuthenticated')) return;
        if (activeTab === 'premium-users') {
            fetchPremiumUsers();
        }
    }, [activeTab]);

    useEffect(() => {
        if (!sessionStorage.getItem('adminAuthenticated')) return;
        if (activeTab === 'settings') {
            setSettingsLoading(true);
            Promise.all([fetchPricingSettings(), fetchStats(), fetchTodayStats()])
                .catch(() => {})
                .finally(() => setSettingsLoading(false));
        }
    }, [activeTab]);

    const refreshAll = () => {
        switch (activeTab) {
            case 'dashboard':
                setDashboardRefreshKey(k => k + 1);
                break;
            case 'texts':
                fetchTexts(textsPage, textsSearchTerm);
                break;
            case 'images':
                fetchImages(imagesPage, imagesSearchTerm);
                break;
            case 'files':
                fetchFiles(filesPage, filesSearchTerm);
                break;
            case 'public-rooms':
                fetchPublicRooms(publicRoomsPage);
                break;
            case 'deletion-requests':
                fetchDeletionRequests();
                break;
            case 'users':
                fetchUsers(usersPage);
                break;
            case 'premium-codes':
                fetchPremiumCodes();
                break;
            case 'premium-users':
                fetchPremiumUsers();
                break;
            default:
                break;
        }
    };

    // ─── Fetch Functions (with pagination + search) ───

    const fetchUsers = async (pageNum = 1) => {
        setUsersLoading(true);
        setUsersError('');

        try {
            const params = new URLSearchParams({ page: pageNum, limit: pageSize });
            const response = await fetch(`${endpoints.adminUsers}?${params}`, {
                headers: getAuthHeaders(),
            });
            const data = await response.json();

            if (data.success) {
                setUsers(data.users || []);
                setUsersPagination(data.pagination || null);
            } else {
                setUsersError('Failed to fetch users');
            }
            return data;
        } catch (error) {
            console.error('Error:', error);
            setUsersError('Failed to connect to server. Please try again.');
            return null;
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchDeletionRequests = async () => {
        setDeletionRequestsLoading(true);
        setDeletionRequestsError('');

        try {
            const params = new URLSearchParams();
            if (deletionRequestsFilter && deletionRequestsFilter !== 'all') {
                params.append('status', deletionRequestsFilter);
            }
            const query = params.toString() ? `?${params}` : '';
            const response = await fetch(`${endpoints.adminDeletionRequests}${query}`, {
                headers: getAuthHeaders(),
            });
            const data = await response.json();

            if (data.success) {
                setDeletionRequests(data.requests || []);
            } else {
                setDeletionRequestsError('Failed to fetch deletion requests');
            }
            return data;
        } catch (error) {
            console.error('Error:', error);
            setDeletionRequestsError('Failed to connect to server. Please try again.');
            return null;
        } finally {
            setDeletionRequestsLoading(false);
        }
    };

    const fetchPremiumCodes = async () => {
        setPremiumCodesLoading(true);
        setPremiumCodesError('');
        try {
            const response = await fetch(endpoints.adminPremiumCodes, { headers: getAuthHeaders() });
            const data = await response.json();
            if (data.success) {
                setPremiumCodes(data.codes || []);
            } else {
                setPremiumCodesError(data.message || 'Failed to fetch premium codes');
            }
        } catch (err) {
            setPremiumCodesError('Failed to connect to server');
        } finally {
            setPremiumCodesLoading(false);
        }
    };

    const fetchPremiumUsers = async () => {
        setPremiumUsersLoading(true);
        setPremiumUsersError('');
        try {
            const response = await fetch(endpoints.adminPremiumUsers, { headers: getAuthHeaders() });
            const data = await response.json();
            if (data.success) {
                setPremiumUsers(data.users || []);
            } else {
                setPremiumUsersError(data.message || 'Failed to fetch premium users');
            }
        } catch (err) {
            setPremiumUsersError('Failed to connect to server');
        } finally {
            setPremiumUsersLoading(false);
        }
    };

    const fetchPricingSettings = async () => {
        try {
            const response = await fetch(endpoints.adminGetPricing, { headers: getAuthHeaders() });
            const data = await response.json();
            if (data.success && data.settings) {
                setPrice4Digit(data.settings.premiumCodePrice4Digit);
                setPrice6Digit(data.settings.premiumCodePrice6Digit);
                setSlotPrice(data.settings.slotPrice ?? 30);
            }
        } catch (err) {
            console.error('Failed to fetch pricing:', err);
        }
    };

    const fetchStats = async () => {
        setStatsLoading(true);
        setStatsError('');
        try {
            const response = await fetch(endpoints.adminStats, { headers: getAuthHeaders() });
            const data = await response.json();
            if (data.success && data.stats) {
                setStats(data.stats);
            } else {
                setStatsError('Failed to fetch stats');
            }
        } catch (err) {
            setStatsError('Failed to connect to server');
        } finally {
            setStatsLoading(false);
        }
    };

    const handleUpdateStats = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(endpoints.adminStats, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(stats)
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
                showActionMessage('Stats updated successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to update stats', 'error');
            }
        } catch (err) {
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const fetchTodayStats = async () => {
        setTodayStatsLoading(true);
        setTodayStatsError('');
        try {
            const response = await fetch(endpoints.adminStatsToday, { headers: getAuthHeaders() });
            const data = await response.json();
            if (data.success && data.stats) {
                const s = data.stats;
                setTodayStats({
                    visitors: s.visitors || 0,
                    files_shared: s.files_shared || 0,
                    received: s.received || 0,
                    premium_users: s.premium_users || 0,
                    date: s.date || ''
                });
            } else {
                setTodayStatsError('Failed to fetch today\'s stats');
            }
        } catch {
            setTodayStatsError('Failed to connect to server');
        } finally {
            setTodayStatsLoading(false);
        }
    };

    const handleUpdateTodayStats = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(endpoints.adminStatsToday, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visitors: Number(todayStats.visitors),
                    files_shared: Number(todayStats.files_shared),
                    received: Number(todayStats.received),
                    premium_users: Number(todayStats.premium_users)
                })
            });
            const data = await response.json();
            if (data.success) {
                const s = data.stats;
                setTodayStats({
                    visitors: s.visitors || 0,
                    files_shared: s.files_shared || 0,
                    received: s.received || 0,
                    premium_users: s.premium_users || 0,
                    date: s.date || ''
                });
                showActionMessage('Today\'s stats updated successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to update today\'s stats', 'error');
            }
        } catch {
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleUpdatePricing = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(endpoints.adminUpdatePricing, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    premiumCodePrice4Digit: Number(price4Digit),
                    premiumCodePrice6Digit: Number(price6Digit),
                    slotPrice: Number(slotPrice)
                })
            });
            const data = await response.json();
            if (data.success) {
                showActionMessage('Pricing settings updated successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to update pricing', 'error');
            }
        } catch (err) {
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleClearCache = async () => {
        if (!window.confirm('Clear the application cache? This removes all cached premium codes, stats, and content responses. Data is re-fetched from the database on next request.')) return;
        try {
            const response = await fetch(endpoints.adminClearCache, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                showActionMessage(data.message || 'Cache cleared successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to clear cache', 'error');
            }
        } catch {
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleAddSaleCode = async (e) => {
        e.preventDefault();
        if (!newSaleCode || !/^[a-zA-Z0-9]{4}$|^[a-zA-Z0-9]{6}$/.test(newSaleCode.trim())) {
            showActionMessage('Code must be exactly 4 or 6 alphanumeric characters', 'error');
            return;
        }
        try {
            const response = await fetch(endpoints.adminAddPremiumCodeForSale, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: newSaleCode.trim(),
                    price: Number(newSalePrice)
                })
            });
            const data = await response.json();
            if (data.success) {
                showActionMessage('Code for sale added successfully!', 'success');
                setNewSaleCode('');
                setNewSalePrice(99);
                if (activeTab === 'premium-codes') {
                    fetchPremiumCodes();
                }
            } else {
                showActionMessage(data.message || 'Failed to add code', 'error');
            }
        } catch (err) {
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleDeletePremiumCode = async (code) => {
        if (!window.confirm(`Are you sure you want to delete premium code ${code}?`)) return;
        try {
            const response = await fetch(endpoints.adminDeletePremiumCode(code), {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setPremiumCodes(prev => prev.filter(item => item.code !== code));
                showActionMessage('Premium code deleted successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to delete premium code', 'error');
            }
        } catch (err) {
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleViewPremiumCode = (codeItem) => {
        setViewingPremiumCode(codeItem);
        setShowPremiumCodeModal(true);
    };

    const handleOpenCapacityEdit = (codeItem) => {
        setEditingCapacityCode(codeItem.code);
        setCapacityInput(codeItem.capacity ?? 2);
    };

    const handleUpdateCapacity = async (code) => {
        if (!Number.isInteger(Number(capacityInput)) || Number(capacityInput) < 1 || Number(capacityInput) > 100) {
            showActionMessage('Capacity must be an integer between 1 and 100', 'error');
            return;
        }
        try {
            const response = await fetch(endpoints.adminPremiumCodeCapacity(code), {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ capacity: Number(capacityInput) })
            });
            const data = await response.json();
            if (data.success) {
                showActionMessage(`Capacity updated to ${data.capacity} (${data.itemCount} items)`, 'success');
                setEditingCapacityCode(null);
                fetchPremiumCodes();
            } else {
                showActionMessage(data.message || 'Failed to update capacity', 'error');
            }
        } catch {
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const fetchTexts = async (pageNum = 1, searchTerm = '') => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({ page: pageNum, limit: pageSize });
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`${endpoints.adminTexts}?${params}`, {
                headers: getAuthHeaders(),
            });
            const data = await response.json();

            if (data.success) {
                setTexts(data.texts || []);
                setTextsPagination(data.pagination || null);
            } else {
                setError('Failed to fetch texts');
            }
            return data;
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to connect to server. Please try again.');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchImages = async (pageNum = 1, searchTerm = '') => {
        setImagesLoading(true);
        setImagesError('');

        try {
            const params = new URLSearchParams({ page: pageNum, limit: pageSize });
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`${endpoints.adminImages}?${params}`, {
                headers: getAuthHeaders(),
            });
            const data = await response.json();

            if (data.success) {
                setImages(data.images || []);
                setImagesPagination(data.pagination || null);
            } else {
                setImagesError('Failed to fetch images');
            }
            return data;
        } catch (error) {
            console.error('Error:', error);
            setImagesError('Failed to connect to server. Please try again.');
            return null;
        } finally {
            setImagesLoading(false);
        }
    };

    const fetchFiles = async (pageNum = 1, searchTerm = '') => {
        setFilesLoading(true);
        setFilesError('');

        try {
            const params = new URLSearchParams({ page: pageNum, limit: pageSize });
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`${endpoints.adminFiles}?${params}`, {
                headers: getAuthHeaders(),
            });
            const data = await response.json();

            if (data.success) {
                setFiles(data.files || []);
                setFilesPagination(data.pagination || null);
            } else {
                setFilesError('Failed to fetch files');
            }
            return data;
        } catch (error) {
            console.error('Error:', error);
            setFilesError('Failed to connect to server. Please try again.');
            return null;
        } finally {
            setFilesLoading(false);
        }
    };

    const fetchPublicRooms = async (pageNum = 1) => {
        setPublicRoomsLoading(true);
        setPublicRoomsError('');

        try {
            const params = new URLSearchParams({ page: pageNum, limit: pageSize });
            const response = await fetch(`${endpoints.adminPublicRooms}?${params}`, {
                headers: getAuthHeaders(),
            });
            const data = await response.json();

            if (data.success) {
                setPublicRooms(data.rooms || []);
                setPublicRoomsPagination(data.pagination || null);
            } else {
                setPublicRoomsError('Failed to fetch public rooms');
            }
            return data;
        } catch (error) {
            console.error('Error:', error);
            setPublicRoomsError('Failed to connect to server. Please try again.');
            return null;
        } finally {
            setPublicRoomsLoading(false);
        }
    };

    // ─── Text Handlers ───

    const handleDeleteText = async (id) => {
        if (!window.confirm('Are you sure you want to delete this text?')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteText(id), {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (data.success) {
                // Optimistically remove from current page
                setTexts(prev => prev.filter(text => text.id !== id));
                showActionMessage('Text deleted successfully', 'success');

                // Re-fetch to sync with updated pagination state
                const result = await fetchTexts(textsPage, textsSearchTerm);
                // If the page is now empty and not page 1, go back a page
                if (result && result.texts && result.texts.length === 0 && textsPage > 1) {
                    setTextsPage(textsPage - 1);
                }
            } else {
                showActionMessage(data.message || 'Failed to delete text', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleDeleteAllTexts = async () => {
        if (!window.confirm('Are you sure you want to delete ALL texts? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteAllTexts, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (data.success) {
                setTexts([]);
                setTextsPagination(null);
                setTextsPage(1);
                showActionMessage('All texts deleted successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to delete texts', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleViewText = (text) => {
        setViewingText(text);
        setShowTextViewModal(true);
    };

    const handleEditText = (text) => {
        setEditingText(text);
        setEditedContent(text.text);
    };

    const handleUpdateText = async () => {
        if (!editingText) return;

        try {
            const response = await fetch(endpoints.adminUpdateText(editingText.id), {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ text: editedContent }),
            });

            const data = await response.json();

            if (data.success) {
                setTexts(texts.map(text =>
                    text.id === editingText.id ? { ...text, text: editedContent } : text
                ));
                setEditingText(null);
                showActionMessage('Text updated successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to update text', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleCancelEdit = () => {
        setEditingText(null);
        setEditedContent('');
    };

    const handleEditCode = (text) => {
        setEditingCode(text);
        setNewCode(text.id.toString());
        setCodeError('');
        setShowCodeModal(true);
    };

    const handleUpdateCode = async () => {
        if (!editingCode) return;
        setCodeError('');

        if (!newCode || newCode.length !== 4 || !/^[a-zA-Z0-9]{4}$/.test(newCode)) {
            setCodeError('Code must be exactly 4 alphanumeric characters');
            return;
        }

        const codeValue = newCode.toUpperCase();

        try {
            const response = await fetch(endpoints.adminUpdateCode(editingCode.id), {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ newCode: codeValue }),
            });

            const data = await response.json();

            if (data.success) {
                setTexts(texts.map(text =>
                    text.id === editingCode.id ? { ...text, id: codeValue } : text
                ));
                setShowCodeModal(false);
                setEditingCode(null);
                setNewCode('');
                showActionMessage('Code updated successfully', 'success');
            } else {
                setCodeError(data.message || 'Failed to update code');
            }
        } catch (error) {
            console.error('Error:', error);
            setCodeError('Failed to connect to server');
        }
    };

    const handleRegenerateCode = async (id) => {
        if (!window.confirm('Are you sure you want to generate a new random code for this text?')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminRegenerateCode(id), {
                method: 'POST',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (data.success) {
                setTexts(texts.map(text =>
                    text.id === parseInt(data.oldCode) ? { ...text, id: data.newCode } : text
                ));
                showActionMessage(`Code regenerated successfully: ${data.newCode}`, 'success');
            } else {
                showActionMessage(data.message || 'Failed to regenerate code', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleCheckCodeAvailability = async () => {
        if (!newCode || newCode.length !== 4) return;

        try {
            const response = await fetch(endpoints.adminCheckCode(newCode.toUpperCase()), {
                headers: getAuthHeaders(),
            });
            const data = await response.json();

            if (data.success) {
                if (!data.isAvailable && newCode.toUpperCase() !== editingCode.id) {
                    setCodeError('This code is already in use. Please choose a different code.');
                } else {
                    setCodeError('');
                }
            }
        } catch (error) {
            console.error('Error checking code availability:', error);
        }
    };

    const handleCancelCodeEdit = () => {
        setShowCodeModal(false);
        setEditingCode(null);
        setNewCode('');
        setCodeError('');
    };

    // ─── Image Handlers ───

    const handleDeleteImage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteImage(id), {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (data.success) {
                setImages(prev => prev.filter(image => image.id !== id));
                showActionMessage('Image deleted successfully', 'success');

                const result = await fetchImages(imagesPage, imagesSearchTerm);
                if (result && result.images && result.images.length === 0 && imagesPage > 1) {
                    setImagesPage(imagesPage - 1);
                }
            } else {
                showActionMessage(data.message || 'Failed to delete image', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleDeleteAllImages = async () => {
        if (!window.confirm('Are you sure you want to delete ALL images? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteAllImages, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (data.success) {
                setImages([]);
                setImagesPagination(null);
                setImagesPage(1);
                showActionMessage('All images deleted successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to delete images', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleEditImageCode = (image) => {
        setEditingImage(image);
        setNewImageCode(image.id.toString());
        setImageCodeError('');
        setShowImageCodeModal(true);
    };

    const handleUpdateImageCode = async () => {
        if (!editingImage) return;
        setImageCodeError('');

        if (!newImageCode || newImageCode.length !== 4 || !/^[a-zA-Z0-9]{4}$/.test(newImageCode)) {
            setImageCodeError('Code must be exactly 4 alphanumeric characters');
            return;
        }

        const codeValue = newImageCode.toUpperCase();

        try {
            const response = await fetch(endpoints.adminUpdateImageCode(editingImage.id), {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ newCode: codeValue }),
            });

            const data = await response.json();

            if (data.success) {
                setImages(images.map(image =>
                    image.id === editingImage.id ? { ...image, id: codeValue } : image
                ));
                setShowImageCodeModal(false);
                setEditingImage(null);
                setNewImageCode('');
                showActionMessage('Image code updated successfully', 'success');
            } else {
                setImageCodeError(data.message || 'Failed to update code');
            }
        } catch (error) {
            console.error('Error:', error);
            setImageCodeError('Failed to connect to server');
        }
    };

    const handleCheckImageCodeAvailability = async () => {
        if (!newImageCode || newImageCode.length !== 4) return;

        try {
            const response = await fetch(endpoints.adminCheckImageCode(newImageCode.toUpperCase()), {
                headers: getAuthHeaders(),
            });
            const data = await response.json();

            if (data.success) {
                if (!data.isAvailable && newImageCode.toUpperCase() !== editingImage.id) {
                    setImageCodeError('This code is already in use. Please choose a different code.');
                } else {
                    setImageCodeError('');
                }
            }
        } catch (error) {
            console.error('Error checking image code availability:', error);
        }
    };

    const handleRegenerateImageCode = async (id) => {
        if (!window.confirm('Are you sure you want to generate a new random code for this image?')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminRegenerateImageCode(id), {
                method: 'POST',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (data.success) {
                setImages(images.map(image =>
                    image.id === parseInt(data.oldCode) ? { ...image, id: data.newCode } : image
                ));
                showActionMessage(`Image code regenerated successfully: ${data.newCode}`, 'success');
            } else {
                showActionMessage(data.message || 'Failed to regenerate image code', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    // ─── Password Handler ───

    const handleChangePassword = async () => {
        setPasswordError('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('Please fill in all password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }

        try {
            const response = await fetch(endpoints.adminChangePassword, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (data.success) {
                showActionMessage('Password changed successfully', 'success');
                setShowPasswordModal(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordError(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error:', error);
            setPasswordError('Failed to connect to server');
        }
    };

    // ─── Public Room Handlers ───

    const handleDeletePublicRoom = async (code) => {
        if (!window.confirm(`Are you sure you want to delete public room ${code}?`)) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeletePublicRoom(code), {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (data.success) {
                setPublicRooms(prev => prev.filter(room => room.code !== code));
                showActionMessage('Public room deleted successfully', 'success');

                const result = await fetchPublicRooms(publicRoomsPage);
                if (result && result.rooms && result.rooms.length === 0 && publicRoomsPage > 1) {
                    setPublicRoomsPage(publicRoomsPage - 1);
                }
            } else {
                showActionMessage(data.message || 'Failed to delete public room', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleTogglePublicRoomStatus = async (code) => {
        try {
            const response = await fetch(endpoints.adminTogglePublicRoomStatus(code), {
                method: 'PUT',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (data.success) {
                setPublicRooms(publicRooms.map(room =>
                    room.code === code ? { ...room, active: !room.active } : room
                ));
                showActionMessage('Room status updated successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to update room status', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleCreatePublicRoom = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(endpoints.adminPublicRooms, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ name: publicRoomName || undefined }),
            });

            const data = await response.json();

            if (data.success) {
                // New room is most recent, so it's on page 1
                setPublicRoomsPage(1);
                fetchPublicRooms(1);
                setShowPublicRoomModal(false);
                setPublicRoomName('');
                showActionMessage('Public room created successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to create public room', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    // ─── User Handlers ───

    // Approve a deletion request: permanently deletes the account + data.
    const handleProcessDeletionRequest = async (req) => {
        if (!window.confirm(`Permanently delete account "${req.username}" and all associated data? This cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminProcessDeletionRequest(req._id), {
                method: 'POST',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (data.success) {
                showActionMessage(`Account "${req.username}" deleted successfully`, 'success');
                await fetchDeletionRequests();
            } else {
                showActionMessage(data.message || 'Failed to process deletion request', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    // Reject a deletion request (cancels it; account stays intact).
    const handleRejectDeletionRequest = async (req) => {
        const note = window.prompt(`Rejecting deletion request for "${req.username}".\nAdd an optional note for the record (or leave empty):`, '');
        if (note === null) return; // user cancelled prompt

        try {
            const response = await fetch(endpoints.adminRejectDeletionRequest(req._id), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ note }),
            });

            const data = await response.json();

            if (data.success) {
                showActionMessage('Deletion request rejected', 'success');
                await fetchDeletionRequests();
            } else {
                showActionMessage(data.message || 'Failed to reject deletion request', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This will also delete all their mapped items.')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteUser(id), {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (data.success) {
                setUsers(prev => prev.filter(user => user.id !== id));
                showActionMessage('User deleted successfully', 'success');

                const result = await fetchUsers(usersPage);
                if (result && result.users && result.users.length === 0 && usersPage > 1) {
                    setUsersPage(usersPage - 1);
                }
            } else {
                showActionMessage(data.message || 'Failed to delete user', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleDeleteAllUsers = async () => {
        if (!window.confirm('Are you sure you want to delete ALL users? This will also delete all mapped items. This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteAllUsers, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (data.success) {
                setUsers([]);
                setUsersPagination(null);
                setUsersPage(1);
                showActionMessage(`All users deleted successfully (${data.deletedCount} users)`, 'success');
            } else {
                showActionMessage(data.message || 'Failed to delete users', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    // ─── File Handlers ───

    const handleDeleteFile = async (id) => {
        if (!window.confirm('Are you sure you want to delete this file?')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteFile(id), {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (data.success) {
                setFiles(prev => prev.filter(file => file.id !== id));
                showActionMessage('File deleted successfully', 'success');

                const result = await fetchFiles(filesPage, filesSearchTerm);
                if (result && result.files && result.files.length === 0 && filesPage > 1) {
                    setFilesPage(filesPage - 1);
                }
            } else {
                showActionMessage(data.message || 'Failed to delete file', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleDeleteAllFiles = async () => {
        if (!window.confirm('Are you sure you want to delete ALL files? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteAllFiles, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (data.success) {
                setFiles([]);
                setFilesPagination(null);
                setFilesPage(1);
                showActionMessage('All files deleted successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to delete files', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    // ─── Delete by Date Range Handlers ───
    const openRangeDeleteModal = () => {
        setShowRangeDeleteModal(true);
        setRangeError('');
        setRangeCount(null);
    };

    const closeRangeDeleteModal = () => {
        setShowRangeDeleteModal(false);
        setRangeError('');
        setRangeCount(null);
        setRangeFrom('');
        setRangeTo('');
    };

    const buildRangeParams = () => {
        const params = new URLSearchParams();
        if (rangeType) params.set('dataType', rangeType);
        if (rangeFrom) params.set('from', rangeFrom);
        if (rangeTo) params.set('to', rangeTo);
        return params;
    };

    const handlePreviewRange = async () => {
        setRangeError('');
        if (!rangeFrom && !rangeTo) {
            setRangeError('Please select a "from" and/or "to" date.');
            return;
        }
        if (rangeFrom && rangeTo && rangeFrom > rangeTo) {
            setRangeError('"From" cannot be later than "To".');
            return;
        }
        setRangePreviewLoading(true);
        try {
            const response = await fetch(`${endpoints.adminRangeCount}?${buildRangeParams()}`, {
                headers: getAuthHeaders(),
            });
            const data = await response.json();
            if (data.success) {
                setRangeCount(data.count);
            } else {
                setRangeError(data.message || 'Failed to preview count');
                setRangeCount(null);
            }
        } catch (error) {
            console.error('Error:', error);
            setRangeError('Failed to connect to server');
            setRangeCount(null);
        } finally {
            setRangePreviewLoading(false);
        }
    };

    const handleDeleteRange = async () => {
        setRangeError('');
        if (rangeCount === null) {
            setRangeError('Please preview the count first.');
            return;
        }
        if (rangeCount === 0) {
            setRangeError('No records match the selected range.');
            return;
        }
        if (!window.confirm(`Delete ${rangeCount} record(s) in this range? This action cannot be undone.`)) {
            return;
        }
        setRangeDeleting(true);
        try {
            const response = await fetch(`${endpoints.adminRangeDelete}?${buildRangeParams()}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            const data = await response.json();
            if (data.success) {
                showActionMessage(`Deleted ${data.deletedCount} record(s)`, 'success');
                closeRangeDeleteModal();
                refreshAll();
            } else {
                setRangeError(data.message || 'Failed to delete data');
            }
        } catch (error) {
            console.error('Error:', error);
            setRangeError('Failed to connect to server');
        } finally {
            setRangeDeleting(false);
        }
    };

    const handleEditFileCode = (file) => {
        setEditingFile(file);
        setNewFileCode(file.id.toString());
        setFileCodeError('');
        setShowFileCodeModal(true);
    };

    const handleUpdateFileCode = async () => {
        if (!editingFile) return;
        setFileCodeError('');

        if (!newFileCode || newFileCode.length !== 4 || !/^[a-zA-Z0-9]{4}$/.test(newFileCode)) {
            setFileCodeError('Code must be exactly 4 alphanumeric characters');
            return;
        }

        const codeValue = newFileCode.toUpperCase();

        try {
            const response = await fetch(endpoints.adminUpdateFileCode(editingFile.id), {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ newCode: codeValue }),
            });

            const data = await response.json();

            if (data.success) {
                setFiles(files.map(file =>
                    file.id === editingFile.id ? { ...file, id: codeValue } : file
                ));
                setShowFileCodeModal(false);
                setEditingFile(null);
                setNewFileCode('');
                showActionMessage('File code updated successfully', 'success');
            } else {
                setFileCodeError(data.message || 'Failed to update code');
            }
        } catch (error) {
            console.error('Error:', error);
            setFileCodeError('Failed to connect to server');
        }
    };

    const handleCheckFileCodeAvailability = async () => {
        if (!newFileCode || newFileCode.length !== 4) return;

        try {
            const response = await fetch(endpoints.adminCheckFileCode(newFileCode.toUpperCase()), {
                headers: getAuthHeaders(),
            });
            const data = await response.json();

            if (data.success) {
                if (!data.isAvailable && newFileCode.toUpperCase() !== editingFile.id) {
                    setFileCodeError('This code is already in use. Please choose a different code.');
                } else {
                    setFileCodeError('');
                }
            }
        } catch (error) {
            console.error('Error checking file code availability:', error);
        }
    };

    const handleRegenerateFileCode = async (id) => {
        if (!window.confirm('Are you sure you want to generate a new random code for this file?')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminRegenerateFileCode(id), {
                method: 'POST',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (data.success) {
                setFiles(files.map(file =>
                    file.id === parseInt(data.oldCode) ? { ...file, id: data.newCode } : file
                ));
                showActionMessage(`File code regenerated successfully: ${data.newCode}`, 'success');
            } else {
                showActionMessage(data.message || 'Failed to regenerate file code', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    // ─── Utility Handlers ───

    // Format date in 12-hour format with AM/PM
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        const minutesStr = minutes.toString().padStart(2, '0');
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}, ${hours12}:${minutesStr} ${ampm}`;
    };

    const showActionMessage = (text, type) => {
        setActionMessage({ text, type });
        setTimeout(() => {
            setActionMessage({ text: '', type: '' });
        }, 3000);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const handleAdminTabClick = (key) => {
        setActiveTab(key);
        navigate(`/admin/panel?tab=${key}`);
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        // Reset all pages to 1 when page size changes
        setTextsPage(1);
        setImagesPage(1);
        setFilesPage(1);
        setPublicRoomsPage(1);
        setUsersPage(1);
    };

    const handleTextsPageChange = (newPage) => {
        const totalPages = textsPagination?.pages || 1;
        const clampedPage = Math.max(1, Math.min(newPage, totalPages));
        setTextsPage(clampedPage);
    };

    const handleImagesPageChange = (newPage) => {
        const totalPages = imagesPagination?.pages || 1;
        const clampedPage = Math.max(1, Math.min(newPage, totalPages));
        setImagesPage(clampedPage);
    };

    const handleFilesPageChange = (newPage) => {
        const totalPages = filesPagination?.pages || 1;
        const clampedPage = Math.max(1, Math.min(newPage, totalPages));
        setFilesPage(clampedPage);
    };

    const handlePublicRoomsPageChange = (newPage) => {
        const totalPages = publicRoomsPagination?.pages || 1;
        const clampedPage = Math.max(1, Math.min(newPage, totalPages));
        setPublicRoomsPage(clampedPage);
    };

    const handleUsersPageChange = (newPage) => {
        const totalPages = usersPagination?.pages || 1;
        const clampedPage = Math.max(1, Math.min(newPage, totalPages));
        setUsersPage(clampedPage);
    };

    const clearTextsSearch = () => {
        setTextsSearchInput('');
        setTextsSearchTerm('');
    };

    const clearImagesSearch = () => {
        setImagesSearchInput('');
        setImagesSearchTerm('');
    };

    const clearFilesSearch = () => {
        setFilesSearchInput('');
        setFilesSearchTerm('');
    };

    // ─── Render ───

    return (
        <div className="admin-panel-container">
            <AnimatePresence>
                {actionMessage.text && (
                    <motion.div
                        className={`action-message ${actionMessage.type}`}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                    >
                        {actionMessage.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="admin-header">
                <div className="admin-header-left">
                    <h1 className="admin-title">Admin Panel</h1>
                    <p className="admin-subtitle">Manage all shared content and users</p>
                </div>
                <motion.button
                    className="admin-refresh-btn"
                    onClick={refreshAll}
                    title="Refresh All Data"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M8 16H3v5" />
                    </svg>
                </motion.button>
            </div>

            <motion.div
                className="admin-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <nav className="admin-tabs" aria-label="Admin sections">
                    {ADMIN_TABS.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            className={`tab-btn ${activeTab === t.key ? 'tab-btn--active' : ''}`}
                            onClick={() => handleAdminTabClick(t.key)}
                            aria-current={activeTab === t.key ? 'page' : undefined}
                        >
                            <AdminTabIcon name={t.icon} />
                            <span>{t.label}</span>
                        </button>
                    ))}
                </nav>

                {activeTab === 'dashboard' && (
                    <AdminDashboard getAuthHeaders={getAuthHeaders} refreshKey={dashboardRefreshKey} />
                )}
                {activeTab === 'texts' && (
                    <div>
                        <div className="tab-header">
                            <h1>Text Management</h1>
                            <div className="tab-header-actions">
                                <motion.button
                                    className="Btn delete-all"
                                    onClick={handleDeleteAllTexts}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Delete All Texts
                                </motion.button>
                                <motion.button
                                    className="Btn delete-all"
                                    onClick={openRangeDeleteModal}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Delete by Date Range
                                </motion.button>
                            </div>
                        </div>

                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search texts..."
                                value={textsSearchInput}
                                onChange={(e) => setTextsSearchInput(e.target.value)}
                                className="search-input"
                            />
                            {textsSearchInput && (
                                <button
                                    className="search-clear"
                                    onClick={clearTextsSearch}
                                    title="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        {loading ? (
                            <div className="loading">Loading texts...</div>
                        ) : texts.length === 0 ? (
                            <div className="no-data">No texts found</div>
                        ) : (
                            <div className="texts-table-container">
                                <table className="texts-table">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Content</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {texts.map((text) => (
                                            <tr key={text.id}>
                                                <td className="room-code">{text.id}</td>
                                        <td className="text-content">
                                            <TruncatedText text={text.text} onViewText={() => handleViewText(text)} />
                                        </td>
                                                <td>{formatDate(text.createdAt)}</td>
                                                <td className="actions">
                                                    <motion.button
                                                        className="action-btn edit"
                                                        onClick={() => handleEditText(text)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Edit
                                                    </motion.button>
                                                    <motion.button
                                                        className="action-btn edit-code"
                                                        onClick={() => handleEditCode(text)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Edit Code
                                                    </motion.button>
                                                    <motion.button
                                                        className="action-btn regenerate-code"
                                                        onClick={() => handleRegenerateCode(text.id)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Regenerate
                                                    </motion.button>
                                                    <motion.button
                                                        className="action-btn delete"
                                                        onClick={() => handleDeleteText(text.id)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Delete
                                                    </motion.button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {textsPagination && (
                            <PaginationControls
                                currentPage={textsPagination.page}
                                totalPages={textsPagination.pages}
                                totalItems={textsPagination.total}
                                onPageChange={handleTextsPageChange}
                                pageSize={pageSize}
                                onPageSizeChange={handlePageSizeChange}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'images' && (
                    <div>
                        <div className="tab-header">
                            <h1>Image Management</h1>
                            <div className="tab-header-actions">
                                <motion.button
                                    className="Btn delete-all"
                                    onClick={handleDeleteAllImages}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Delete All Images
                                </motion.button>
                                <motion.button
                                    className="Btn delete-all"
                                    onClick={openRangeDeleteModal}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Delete by Date Range
                                </motion.button>
                            </div>
                        </div>

                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search by original name..."
                                value={imagesSearchInput}
                                onChange={(e) => setImagesSearchInput(e.target.value)}
                                className="search-input"
                            />
                            {imagesSearchInput && (
                                <button
                                    className="search-clear"
                                    onClick={clearImagesSearch}
                                    title="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {imagesError && <div className="error-message">{imagesError}</div>}

                        {imagesLoading ? (
                            <div className="loading">Loading images...</div>
                        ) : images.length === 0 ? (
                            <div className="no-data">No images found</div>
                        ) : (
                            <div className="texts-table-container">
                                <table className="texts-table">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Preview</th>
                                            <th>Original Name</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {images.map((image) => (
                                            <tr key={image.id}>
                                                <td className="room-code">{image.id}</td>
                                                <td>
                                                    <div className="image-thumb">
                                                        <img src={image.url} alt={image.originalName} />
                                                    </div>
                                                </td>
                                                <td>{image.originalName}</td>
                                                <td>{formatDate(image.createdAt)}</td>
                                                <td className="actions">
                                                    <motion.button
                                                        className="action-btn edit"
                                                        onClick={() => window.open(image.url, '_blank')}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        View
                                                    </motion.button>
                                                    <motion.button
                                                        className="action-btn edit-code"
                                                        onClick={() => handleEditImageCode(image)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Edit Code
                                                    </motion.button>
                                                    <motion.button
                                                        className="action-btn regenerate-code"
                                                        onClick={() => handleRegenerateImageCode(image.id)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Regenerate
                                                    </motion.button>
                                                    <motion.button
                                                        className="action-btn delete"
                                                        onClick={() => handleDeleteImage(image.id)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Delete
                                                    </motion.button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {imagesPagination && (
                            <PaginationControls
                                currentPage={imagesPagination.page}
                                totalPages={imagesPagination.pages}
                                totalItems={imagesPagination.total}
                                onPageChange={handleImagesPageChange}
                                pageSize={pageSize}
                                onPageSizeChange={handlePageSizeChange}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'files' && (
                    <div>
                        <div className="tab-header">
                            <h1>File Management</h1>
                            <div className="tab-header-actions">
                                <motion.button
                                    className="Btn delete-all"
                                    onClick={handleDeleteAllFiles}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Delete All Files
                                </motion.button>
                                <motion.button
                                    className="Btn delete-all"
                                    onClick={openRangeDeleteModal}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Delete by Date Range
                                </motion.button>
                            </div>
                        </div>

                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search by original name..."
                                value={filesSearchInput}
                                onChange={(e) => setFilesSearchInput(e.target.value)}
                                className="search-input"
                            />
                            {filesSearchInput && (
                                <button
                                    className="search-clear"
                                    onClick={clearFilesSearch}
                                    title="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {filesError && <div className="error-message">{filesError}</div>}

                        {filesLoading ? (
                            <div className="loading">Loading files...</div>
                        ) : files.length === 0 ? (
                            <div className="no-data">No files found</div>
                        ) : (
                            <div className="texts-table-container">
                                <table className="texts-table">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Preview</th>
                                            <th>Original Name</th>
                                            <th>Size</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {files.map((file) => (
                                            <tr key={file.id}>
                                                <td className="room-code">{file.id}</td>
                                                <td>
                                                    <div className="file-thumb" onClick={() => window.open(endpoints.previewFile(file.id), '_blank')} style={{ cursor: 'pointer' }}>
                                                        <div className="file-icon">
                                                            {/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.originalName) ? '🖼️' :
                                                             /\.(mp4|webm|ogg|mov|avi)$/i.test(file.originalName) ? '🎬' :
                                                             /\.(pdf)$/i.test(file.originalName) ? '📄' :
                                                             /\.(doc|docx)$/i.test(file.originalName) ? '📝' :
                                                             /\.(xls|xlsx|csv)$/i.test(file.originalName) ? '📊' :
                                                             /\.(zip|rar|7z|tar|gz)$/i.test(file.originalName) ? '📦' :
                                                             /\.(mp3|wav|flac|aac)$/i.test(file.originalName) ? '🎵' :
                                                             '📁'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{file.originalName}</td>
                                                <td>{file.size ? (file.size / 1024).toFixed(2) + ' KB' : 'N/A'}</td>
                                                <td>{formatDate(file.createdAt)}</td>
                                                <td className="actions">
                                                    <motion.button
                                                        className="action-btn edit"
                                                        onClick={() => window.open(endpoints.previewFile(file.id), '_blank')}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        View
                                                    </motion.button>
                                                    <motion.button
                                                        className="action-btn edit-code"
                                                        onClick={() => handleEditFileCode(file)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Edit Code
                                                    </motion.button>
                                                    <motion.button
                                                        className="action-btn regenerate-code"
                                                        onClick={() => handleRegenerateFileCode(file.id)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Regenerate
                                                    </motion.button>
                                                    <motion.button
                                                        className="action-btn delete"
                                                        onClick={() => handleDeleteFile(file.id)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Delete
                                                    </motion.button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {filesPagination && (
                            <PaginationControls
                                currentPage={filesPagination.page}
                                totalPages={filesPagination.pages}
                                totalItems={filesPagination.total}
                                onPageChange={handleFilesPageChange}
                                pageSize={pageSize}
                                onPageSizeChange={handlePageSizeChange}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'public-rooms' && (
                    <div>
                        <div className="tab-header">
                            <h1>Public Rooms</h1>
                            <motion.button
                                className="Btn create-public-room"
                                onClick={() => setShowPublicRoomModal(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Create Public Room
                            </motion.button>
                        </div>

                        {publicRoomsError && <div className="error-message">{publicRoomsError}</div>}

                        {publicRoomsLoading ? (
                            <div className="loading">Loading public rooms...</div>
                        ) : publicRooms.length === 0 ? (
                            <div className="no-data">No public rooms found</div>
                        ) : (
                            <div className="public-rooms-container">
                                <table className="public-rooms-table">
                                    <thead>
                                        <tr>
                                            <th>Room Code</th>
                                            <th>Room Name</th>
                                            <th>Status</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {publicRooms.map((room) => (
                                            <tr key={room.code} className={room.active ? 'room-active' : 'room-inactive'}>
                                                <td className="room-code">{room.code}</td>
                                                <td>{room.name || 'Unnamed Room'}</td>
                                                <td>
                                                    <span className={`status-badge ${room.active ? 'active' : 'inactive'}`}>
                                                        {room.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>{formatDate(room.createdAt)}</td>
                                                <td className="actions">
                                                    <motion.button
                                                        className={`action-btn ${room.active ? 'deactivate' : 'activate'}`}
                                                        onClick={() => handleTogglePublicRoomStatus(room.code)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        {room.active ? 'Deactivate' : 'Activate'}
                                                    </motion.button>
                                                    <motion.button
                                                        className="action-btn delete"
                                                        onClick={() => handleDeletePublicRoom(room.code)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Delete
                                                    </motion.button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {publicRoomsPagination && (
                            <PaginationControls
                                currentPage={publicRoomsPagination.page}
                                totalPages={publicRoomsPagination.pages}
                                totalItems={publicRoomsPagination.total}
                                onPageChange={handlePublicRoomsPageChange}
                                pageSize={pageSize}
                                onPageSizeChange={handlePageSizeChange}
                            />
                        )}
                    </div>
                )}

{activeTab === 'deletion-requests' && (
                    <div>
                        <div className="tab-header">
                            <h1>Account Deletion Requests</h1>
                            <select
                                className="deletion-filter"
                                value={deletionRequestsFilter}
                                onChange={(e) => setDeletionRequestsFilter(e.target.value)}
                            >
                                <option value="all">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {deletionRequestsError && <div className="error-message">{deletionRequestsError}</div>}

                        {deletionRequestsLoading ? (
                            <div className="loading">Loading deletion requests...</div>
                        ) : deletionRequests.length === 0 ? (
                            <div className="no-data">No deletion requests found</div>
                        ) : (
                            <div className="texts-table-container">
                                <table className="texts-table">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Status</th>
                                            <th>Email</th>
                                            <th>Reason</th>
                                            <th>Requested At</th>
                                            <th>Processed At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deletionRequests.map((req) => (
                                            <tr key={req._id}>
                                                <td>
                                                    {req.username}
                                                    {!req.accountExists && req.status === 'pending' && (
                                                        <span className="deletion-hint"> (account no longer exists)</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${req.status}`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td>{req.email || '—'}</td>
                                                <td className="deletion-reason">{req.reason || '—'}</td>
                                                <td>{formatDate(req.requestedAt)}</td>
                                                <td>{req.processedAt ? formatDate(req.processedAt) : '—'}</td>
                                                <td className="actions">
                                                    {req.status === 'pending' ? (
                                                        <>
                                                            <motion.button
                                                                className="action-btn edit"
                                                                onClick={() => handleProcessDeletionRequest(req)}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                Process
                                                            </motion.button>
                                                            <motion.button
                                                                className="action-btn deactivate"
                                                                onClick={() => handleRejectDeletionRequest(req)}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                Reject
                                                            </motion.button>
                                                        </>
                                                    ) : (
                                                        <span className="deletion-note">{req.adminNote || '—'}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'users' && (
                    <div>
                        <div className="tab-header">
                            <h1>Registered Users</h1>
                            {users.length > 0 && (
                                <motion.button
                                    className="Btn delete-all"
                                    onClick={handleDeleteAllUsers}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Delete All Users
                                </motion.button>
                            )}
                        </div>

                        {usersError && <div className="error-message">{usersError}</div>}

                        {usersLoading ? (
                            <div className="loading">Loading users...</div>
                        ) : users.length === 0 ? (
                            <div className="no-data">No users found</div>
                        ) : (
                            <div className="texts-table-container">
                                <table className="texts-table">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Items</th>
                                            <th>Joined At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id || user.username}>
                                                <td>{user.username}</td>
                                                <td>{user.itemCount || 0}</td>
                                                <td>{formatDate(user.createdAt)}</td>
                                                <td className="actions">
                                                    <motion.button
                                                        className="action-btn delete"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Delete
                                                    </motion.button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {usersPagination && (
                            <PaginationControls
                                currentPage={usersPagination.page}
                                totalPages={usersPagination.pages}
                                totalItems={usersPagination.total}
                                onPageChange={handleUsersPageChange}
                                pageSize={pageSize}
                                onPageSizeChange={handlePageSizeChange}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'premium-codes' && (
                    <div>
                        <div className="tab-header">
                            <h1>Premium Codes Management</h1>
                        </div>
                        {premiumCodesError && <div className="error-message">{premiumCodesError}</div>}
                        {premiumCodesLoading ? (
                            <div className="loading">Loading premium codes...</div>
                        ) : premiumCodes.length === 0 ? (
                            <div className="no-data">No premium codes found</div>
                        ) : (
                            <div className="texts-table-container">
                                <table className="texts-table">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Owner</th>
                                            <th>Content Type</th>
                                            <th>Capacity</th>
                                            <th>Price Paid</th>
                                            <th>Expires At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {premiumCodes.map((item) => (
                                            <tr key={item.code}>
                                                <td className="room-code">{item.code}</td>
                                                <td>{item.isForSale ? <span className="status-badge active" style={{ background: '#7c2d12', color: '#fdba74' }}>FOR SALE</span> : item.owner}</td>
                                                <td>{item.isForSale ? 'N/A' : (item.dataType ? item.dataType.toUpperCase() : 'EMPTY')}</td>
                                                <td>
                                                    {editingCapacityCode === item.code ? (
                                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="100"
                                                                value={capacityInput}
                                                                onChange={(e) => setCapacityInput(e.target.value)}
                                                                style={{ width: '70px', padding: '4px 8px' }}
                                                            />
                                                            <button className="action-btn edit" onClick={() => handleUpdateCapacity(item.code)}>Save</button>
                                                            <button className="action-btn delete" onClick={() => setEditingCapacityCode(null)}>Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <span>
                                                            {item.capacity ?? 2}
                                                            {typeof item.itemCount === 'number' && <span style={{ opacity: 0.6 }}> ({item.itemCount} items)</span>}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>₹{item.price || 0}</td>
                                                <td>{formatDate(item.expiresAt)}</td>
                                                <td className="actions">
                                                    <motion.button
                                                        className="action-btn edit"
                                                        onClick={() => handleViewPremiumCode(item)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        View
                                                    </motion.button>
                                                    <motion.button
                                                        className="action-btn edit"
                                                        onClick={() => handleOpenCapacityEdit(item)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Capacity
                                                    </motion.button>
                                                    <motion.button
                                                        className="action-btn delete"
                                                        onClick={() => handleDeletePremiumCode(item.code)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Delete
                                                    </motion.button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'premium-users' && (
                    <div>
                        <div className="tab-header">
                            <h1>Premium Registered Users</h1>
                        </div>
                        {premiumUsersError && <div className="error-message">{premiumUsersError}</div>}
                        {premiumUsersLoading ? (
                            <div className="loading">Loading premium users...</div>
                        ) : premiumUsers.length === 0 ? (
                            <div className="no-data">No premium users found</div>
                        ) : (
                            <div className="texts-table-container">
                                <table className="texts-table">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Status</th>
                                            <th>Joined At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {premiumUsers.map((user) => (
                                            <tr key={user._id || user.username}>
                                                <td>{user.username}</td>
                                                <td>
                                                    <span className="status-badge active">
                                                        Premium
                                                    </span>
                                                </td>
                                                <td>{formatDate(user.createdAt)}</td>
                                                <td className="actions">
                                                    <motion.button
                                                        className="action-btn delete"
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Delete User
                                                    </motion.button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div>
                        <h1>Admin Settings</h1>
                        <div className="settings-section">
                            {settingsLoading ? (
                                <div className="settings-skeleton" aria-busy="true">
                                    <div className="settings-skeleton__block">
                                        <Skeleton className="settings-skeleton__title" />
                                        <div className="settings-skeleton__row">
                                            <Skeleton className="settings-skeleton__input" />
                                            <Skeleton className="settings-skeleton__input" />
                                            <Skeleton className="settings-skeleton__btn" />
                                        </div>
                                    </div>
                                    <div className="settings-skeleton__block">
                                        <Skeleton className="settings-skeleton__title" />
                                        <div className="settings-skeleton__row">
                                            <Skeleton className="settings-skeleton__input" />
                                            <Skeleton className="settings-skeleton__input" />
                                            <Skeleton className="settings-skeleton__btn" />
                                        </div>
                                    </div>
                                    <div className="settings-skeleton__block">
                                        <Skeleton className="settings-skeleton__title" />
                                        <div className="settings-skeleton__row">
                                            <Skeleton className="settings-skeleton__input" />
                                            <Skeleton className="settings-skeleton__input" />
                                            <Skeleton className="settings-skeleton__input" />
                                            <Skeleton className="settings-skeleton__input" />
                                            <Skeleton className="settings-skeleton__btn" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                            <div className="settings-field" style={{ display: 'block', padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 16px 0' }}>
                                    <h3 style={{ margin: '0', color: '#f59e0b' }}>Dynamic Premium Pricing</h3>
                                    <button
                                        type="button"
                                        onClick={handleClearCache}
                                        className="action-btn edit"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', fontSize: '12px' }}
                                        title="Clear cached premium codes, stats, and content responses"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <polyline points="23 4 23 10 17 10" />
                                            <polyline points="1 20 1 14 7 14" />
                                            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                                        </svg>
                                        Clear Cache
                                    </button>
                                </div>
                                <form onSubmit={handleUpdatePricing} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>4-Digit Code Price (₹)</label>
                                        <input
                                            type="number"
                                            value={price4Digit}
                                            onChange={(e) => setPrice4Digit(e.target.value)}
                                            style={{
                                                background: 'var(--layout-bg)',
                                                border: '1px solid var(--border-default)',
                                                borderRadius: '6px',
                                                padding: '8px 12px',
                                                color: 'var(--text-secondary)',
                                                width: '140px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>6-Digit Code Price (₹)</label>
                                        <input
                                            type="number"
                                            value={price6Digit}
                                            onChange={(e) => setPrice6Digit(e.target.value)}
                                            style={{
                                                background: 'var(--layout-bg)',
                                                border: '1px solid var(--border-default)',
                                                borderRadius: '6px',
                                                padding: '8px 12px',
                                                color: 'var(--text-secondary)',
                                                width: '140px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Extra Slot Price (₹)</label>
                                        <input
                                            type="number"
                                            value={slotPrice}
                                            onChange={(e) => setSlotPrice(e.target.value)}
                                            style={{
                                                background: 'var(--layout-bg)',
                                                border: '1px solid var(--border-default)',
                                                borderRadius: '6px',
                                                padding: '8px 12px',
                                                color: 'var(--text-secondary)',
                                                width: '140px'
                                            }}
                                        />
                                    </div>
                                    <motion.button
                                        type="submit"
                                        className="Btn change-password"
                                        style={{ height: '38px' }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Update Prices
                                    </motion.button>
                                </form>
                            </div>

                            <div className="settings-field" style={{ display: 'block', padding: '20px' }}>
                                <h3 style={{ margin: '0 0 16px 0', color: '#f59e0b' }}>Create Premium Code For Sale</h3>
                                <form onSubmit={handleAddSaleCode} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Code (4 or 6 chars)</label>
                                        <input
                                            type="text"
                                            value={newSaleCode}
                                            placeholder="e.g. GOLD"
                                            onChange={(e) => setNewSaleCode(e.target.value)}
                                            style={{
                                                background: 'var(--layout-bg)',
                                                border: '1px solid var(--border-default)',
                                                borderRadius: '6px',
                                                padding: '8px 12px',
                                                color: 'var(--text-secondary)',
                                                width: '140px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Price (₹)</label>
                                        <input
                                            type="number"
                                            value={newSalePrice}
                                            onChange={(e) => setNewSalePrice(e.target.value)}
                                            style={{
                                                background: 'var(--layout-bg)',
                                                border: '1px solid var(--border-default)',
                                                borderRadius: '6px',
                                                padding: '8px 12px',
                                                color: 'var(--text-secondary)',
                                                width: '100px'
                                            }}
                                        />
                                    </div>
                                    <motion.button
                                        type="submit"
                                        className="Btn change-password"
                                        style={{ height: '38px' }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Add Code For Sale
                                    </motion.button>
                                </form>
                            </div>

                            <div className="settings-field" style={{ display: 'block', padding: '20px' }}>
                                <h3 style={{ margin: '0 0 16px 0', color: '#f59e0b' }}>Update Statistics</h3>
                                {statsError && <div className="error-message">{statsError}</div>}
                                <form onSubmit={handleUpdateStats} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Visitors</label>
                                        <input
                                            type="number"
                                            value={stats.visitors}
                                            onChange={(e) => setStats({...stats, visitors: e.target.value})}
                                            style={{
                                                background: 'var(--layout-bg)',
                                                border: '1px solid var(--border-default)',
                                                borderRadius: '6px',
                                                padding: '8px 12px',
                                                color: 'var(--text-secondary)',
                                                width: '140px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Files Shared</label>
                                        <input
                                            type="number"
                                            value={stats.files_shared}
                                            onChange={(e) => setStats({...stats, files_shared: e.target.value})}
                                            style={{
                                                background: 'var(--layout-bg)',
                                                border: '1px solid var(--border-default)',
                                                borderRadius: '6px',
                                                padding: '8px 12px',
                                                color: 'var(--text-secondary)',
                                                width: '140px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Received</label>
                                        <input
                                            type="number"
                                            value={stats.received}
                                            onChange={(e) => setStats({...stats, received: e.target.value})}
                                            style={{
                                                background: 'var(--layout-bg)',
                                                border: '1px solid var(--border-default)',
                                                borderRadius: '6px',
                                                padding: '8px 12px',
                                                color: 'var(--text-secondary)',
                                                width: '140px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Premium Users</label>
                                        <input
                                            type="number"
                                            value={stats.premium_users}
                                            onChange={(e) => setStats({...stats, premium_users: e.target.value})}
                                            style={{
                                                background: 'var(--layout-bg)',
                                                border: '1px solid var(--border-default)',
                                                borderRadius: '6px',
                                                padding: '8px 12px',
                                                color: 'var(--text-secondary)',
                                                width: '140px'
                                            }}
                                        />
                                    </div>
                                    <motion.button
                                        type="submit"
                                        className="Btn change-password"
                                        style={{ height: '38px' }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Update Stats
                                    </motion.button>
                                </form>
                            </div>

                            <div className="settings-field" style={{ display: 'block', padding: '20px' }}>
                                <h3 style={{ margin: '0 0 16px 0', color: '#f59e0b' }}>Update Today's Stats</h3>
                                {todayStats.date && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>date: {todayStats.date}</div>}
                                {todayStatsError && <div className="error-message">{todayStatsError}</div>}
                                <form onSubmit={handleUpdateTodayStats} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Visitors</label>
                                        <input
                                            type="number"
                                            value={todayStats.visitors}
                                            onChange={(e) => setTodayStats({...todayStats, visitors: e.target.value})}
                                            style={{
                                                background: 'var(--layout-bg)',
                                                border: '1px solid var(--border-default)',
                                                borderRadius: '6px',
                                                padding: '8px 12px',
                                                color: 'var(--text-secondary)',
                                                width: '140px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Files Shared</label>
                                        <input
                                            type="number"
                                            value={todayStats.files_shared}
                                            onChange={(e) => setTodayStats({...todayStats, files_shared: e.target.value})}
                                            style={{
                                                background: 'var(--layout-bg)',
                                                border: '1px solid var(--border-default)',
                                                borderRadius: '6px',
                                                padding: '8px 12px',
                                                color: 'var(--text-secondary)',
                                                width: '140px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Received</label>
                                        <input
                                            type="number"
                                            value={todayStats.received}
                                            onChange={(e) => setTodayStats({...todayStats, received: e.target.value})}
                                            style={{
                                                background: 'var(--layout-bg)',
                                                border: '1px solid var(--border-default)',
                                                borderRadius: '6px',
                                                padding: '8px 12px',
                                                color: 'var(--text-secondary)',
                                                width: '140px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Premium Users</label>
                                        <input
                                            type="number"
                                            value={todayStats.premium_users}
                                            onChange={(e) => setTodayStats({...todayStats, premium_users: e.target.value})}
                                            style={{
                                                background: 'var(--layout-bg)',
                                                border: '1px solid var(--border-default)',
                                                borderRadius: '6px',
                                                padding: '8px 12px',
                                                color: 'var(--text-secondary)',
                                                width: '140px'
                                            }}
                                        />
                                    </div>
                                    <motion.button
                                        type="submit"
                                        className="Btn change-password"
                                        style={{ height: '38px' }}
                                        disabled={todayStatsLoading}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Update Today's Stats
                                    </motion.button>
                                </form>
                            </div>
                                </>
                            )}

                            <div className="settings-field">
                                <div>
                                    <div className="field-label">Change Password</div>
                                    <div className="field-value">Update the admin panel password</div>
                                </div>
                                <motion.button
                                    className="Btn change-password"
                                    onClick={() => setShowPasswordModal(true)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Change Password
                                </motion.button>
                            </div>
                            <div className="settings-field">
                                <div>
                                    <div className="field-label">Logout</div>
                                    <div className="field-value">Sign out of the admin panel</div>
                                </div>
                                <motion.button
                                    className="Btn logout"
                                    onClick={handleLogout}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Logout
                                </motion.button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* ─── Modals (unchanged) ─── */}

            <AnimatePresence>
                {editingText && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal"
                            initial={{ opacity: 0, y: -30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        >
                            <h2>Edit Text</h2>
                            <div className="code-field">
                                <label>Text Content</label>
                                <textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    placeholder="Enter text content"
                                    rows={6}
                                />
                            </div>
                            <div className="modal-buttons">
                                <motion.button
                                    className="Btn save"
                                    onClick={handleUpdateText}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Save Changes
                                </motion.button>
                                <motion.button
                                    className="Btn cancel"
                                    onClick={handleCancelEdit}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPasswordModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal"
                            initial={{ opacity: 0, y: -30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        >
                            <h2>Change Admin Password</h2>
                            {passwordError && <div className="error-message">{passwordError}</div>}
                            <div className="password-field">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="password-field">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="password-field">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <div className="modal-buttons">
                                <motion.button
                                    className="Btn save"
                                    onClick={handleChangePassword}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Change Password
                                </motion.button>
                                <motion.button
                                    className="Btn cancel"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                        setPasswordError('');
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCodeModal && editingCode && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal"
                            initial={{ opacity: 0, y: -30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        >
                            <h2>Update Text Code</h2>
                            <div className="code-info">
                                Current code: <span className="highlight">{editingCode.id}</span>
                            </div>
                            <div className="code-field">
                                <label>New 4-Digit Code</label>
                                <input
                                    type="text"
                                    className="code-input"
                                    value={newCode}
                                    onChange={(e) => setNewCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="Enter new code"
                                    maxLength={4}
                                />
                            </div>
                            {codeError && <div className="error-message">{codeError}</div>}
                            <div className="modal-buttons">
                                <motion.button
                                    className="Btn save"
                                    onClick={handleUpdateCode}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Update Code
                                </motion.button>
                                <motion.button
                                    className="Btn cancel"
                                    onClick={handleCancelCodeEdit}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showImageCodeModal && editingImage && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal"
                            initial={{ opacity: 0, y: -30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        >
                            <h2>Update Image Code</h2>
                            <div className="code-info">
                                Current code: <span className="highlight">{editingImage.id}</span>
                            </div>
                            <div className="code-field">
                                <label>New 4-Digit Code</label>
                                <input
                                    type="text"
                                    className="code-input"
                                    value={newImageCode}
                                    onChange={(e) => setNewImageCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="Enter new code"
                                    maxLength={4}
                                />
                            </div>
                            {imageCodeError && <div className="error-message">{imageCodeError}</div>}
                            <div className="modal-buttons">
                                <motion.button
                                    className="Btn save"
                                    onClick={handleUpdateImageCode}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Update Code
                                </motion.button>
                                <motion.button
                                    className="Btn cancel"
                                    onClick={() => {
                                        setShowImageCodeModal(false);
                                        setEditingImage(null);
                                        setNewImageCode('');
                                        setImageCodeError('');
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showFileCodeModal && editingFile && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal"
                            initial={{ opacity: 0, y: -30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        >
                            <h2>Update File Code</h2>
                            <div className="code-info">
                                Current code: <span className="highlight">{editingFile.id}</span>
                            </div>
                            <div className="code-field">
                                <label>New 4-Digit Code</label>
                                <input
                                    type="text"
                                    className="code-input"
                                    value={newFileCode}
                                    onChange={(e) => setNewFileCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="Enter new code"
                                    maxLength={4}
                                />
                            </div>
                            {fileCodeError && <div className="error-message">{fileCodeError}</div>}
                            <div className="modal-buttons">
                                <motion.button
                                    className="Btn save"
                                    onClick={handleUpdateFileCode}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Update Code
                                </motion.button>
                                <motion.button
                                    className="Btn cancel"
                                    onClick={() => {
                                        setShowFileCodeModal(false);
                                        setEditingFile(null);
                                        setNewFileCode('');
                                        setFileCodeError('');
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPublicRoomModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal"
                            initial={{ opacity: 0, y: -30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        >
                            <h2>Create Public Room</h2>
                            <div className="room-modal-info">
                                A random 4-character code will be generated automatically.
                                If no name is provided, a default name will be used.
                            </div>
                            <form onSubmit={handleCreatePublicRoom}>
                                <div className="room-field">
                                    <label>Room Name (Optional)</label>
                                    <input
                                        type="text"
                                        className="room-name-input"
                                        value={publicRoomName}
                                        onChange={(e) => setPublicRoomName(e.target.value)}
                                        placeholder="Enter room name"
                                    />
                                </div>
                                <div className="modal-buttons">
                                    <motion.button
                                        type="submit"
                                        className="Btn save"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Create Room
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        className="Btn cancel"
                                        onClick={() => {
                                            setShowPublicRoomModal(false);
                                            setPublicRoomName('');
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showTextViewModal && viewingText && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setShowTextViewModal(false);
                            setViewingText(null);
                        }}
                    >
                        <motion.div
                            className="modal"
                            initial={{ opacity: 0, y: -30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ maxWidth: '800px', maxHeight: '80vh' }}
                        >
                            <h2>Full Text Content</h2>
                            <div className="code-info" style={{ marginBottom: '12px' }}>
                                Code: <span className="highlight">{viewingText.id}</span>
                            </div>
                            <div style={{
                                background: 'var(--bg-elevated)',
                                padding: '20px',
                                borderRadius: '8px',
                                maxHeight: '500px',
                                overflowY: 'auto',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: 'var(--text-primary)'
                            }}>
                                {viewingText.text}
                            </div>
                            <div className="modal-buttons">
                                <motion.button
                                    className="Btn cancel"
                                    onClick={() => {
                                        setShowTextViewModal(false);
                                        setViewingText(null);
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Close
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPremiumCodeModal && viewingPremiumCode && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal premium-code-modal"
                            initial={{ opacity: 0, y: -30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        >
                            <h2>Premium Code Details</h2>
                            <div className="premium-code-details">
                                <div className="detail-row">
                                    <span className="detail-label">Code:</span>
                                    <span className="detail-value code-value">{viewingPremiumCode.code}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Owner:</span>
                                    <span className="detail-value">
                                        {viewingPremiumCode.isForSale ? (
                                            <span className="status-badge active" style={{ background: '#7c2d12', color: '#fdba74' }}>FOR SALE</span>
                                        ) : viewingPremiumCode.owner || 'N/A'}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Content Type:</span>
                                    <span className="detail-value">
                                        {viewingPremiumCode.isForSale ? 'N/A' : (viewingPremiumCode.dataType ? viewingPremiumCode.dataType.toUpperCase() : 'EMPTY')}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Price Paid:</span>
                                    <span className="detail-value">₹{viewingPremiumCode.price || 0}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Status:</span>
                                    <span className="detail-value">
                                        <span className={`status-badge ${viewingPremiumCode.active ? 'active' : 'inactive'}`}>
                                            {viewingPremiumCode.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">For Sale:</span>
                                    <span className="detail-value">{viewingPremiumCode.isForSale ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Public:</span>
                                    <span className="detail-value">{viewingPremiumCode.isPublic ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Display Name:</span>
                                    <span className="detail-value">{viewingPremiumCode.displayName || 'N/A'}</span>
                                </div>
                                {viewingPremiumCode.text && (
                                    <div className="detail-row full-width">
                                        <span className="detail-label">Text Content:</span>
                                        <div className="detail-value text-content">{viewingPremiumCode.text}</div>
                                    </div>
                                )}
                                {viewingPremiumCode.url && (
                                    <div className="detail-row full-width">
                                        <span className="detail-label">URL:</span>
                                        <a href={viewingPremiumCode.url} target="_blank" rel="noopener noreferrer" className="detail-value link-value">
                                            {viewingPremiumCode.url}
                                        </a>
                                    </div>
                                )}
                                {viewingPremiumCode.originalName && (
                                    <div className="detail-row">
                                        <span className="detail-label">Original Name:</span>
                                        <span className="detail-value">{viewingPremiumCode.originalName}</span>
                                    </div>
                                )}
                                {viewingPremiumCode.size > 0 && (
                                    <div className="detail-row">
                                        <span className="detail-label">Size:</span>
                                        <span className="detail-value">{(viewingPremiumCode.size / 1024).toFixed(2)} KB</span>
                                    </div>
                                )}
                                {viewingPremiumCode.mimeType && (
                                    <div className="detail-row">
                                        <span className="detail-label">MIME Type:</span>
                                        <span className="detail-value">{viewingPremiumCode.mimeType}</span>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <span className="detail-label">Purchased At:</span>
                                    <span className="detail-value">{formatDate(viewingPremiumCode.purchasedAt)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Expires At:</span>
                                    <span className="detail-value">{formatDate(viewingPremiumCode.expiresAt)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Updated At:</span>
                                    <span className="detail-value">{formatDate(viewingPremiumCode.updatedAt)}</span>
                                </div>
                            </div>
                            <div className="modal-buttons">
                                <motion.button
                                    className="Btn cancel"
                                    onClick={() => {
                                        setShowPremiumCodeModal(false);
                                        setViewingPremiumCode(null);
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Close
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete-by-Date-Range Modal */}
            <AnimatePresence>
                {showRangeDeleteModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeRangeDeleteModal}
                    >
                        <motion.div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, y: -30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        >
                            <h2>Delete Data by Date Range</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13 }}>Type</label>
                                    <select
                                        value={rangeType}
                                        onChange={(e) => { setRangeType(e.target.value); setRangeCount(null); setRangeError(''); }}
                                        style={{ width: '100%', padding: '0.6rem 0.9rem', background: '#0f0f12', color: 'var(--text-primary)', border: '1px solid var(--border-default)', borderRadius: 10 }}
                                    >
                                        <option value="all">All</option>
                                        <option value="text">Text</option>
                                        <option value="image">Image</option>
                                        <option value="file">File</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13 }}>From</label>
                                        <input
                                            type="date"
                                            value={rangeFrom}
                                            onChange={(e) => { setRangeFrom(e.target.value); setRangeCount(null); setRangeError(''); }}
                                            style={{ width: '100%', padding: '0.6rem 0.9rem', background: '#0f0f12', color: 'var(--text-primary)', border: '1px solid var(--border-default)', borderRadius: 10, colorScheme: 'dark' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13 }}>To</label>
                                        <input
                                            type="date"
                                            value={rangeTo}
                                            onChange={(e) => { setRangeTo(e.target.value); setRangeCount(null); setRangeError(''); }}
                                            style={{ width: '100%', padding: '0.6rem 0.9rem', background: '#0f0f12', color: 'var(--text-primary)', border: '1px solid var(--border-default)', borderRadius: 10, colorScheme: 'dark' }}
                                        />
                                    </div>
                                </div>
                                {rangeError && <div className="error-message" style={{ marginTop: 4 }}>{rangeError}</div>}
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <motion.button
                                        className="Btn save"
                                        onClick={handlePreviewRange}
                                        disabled={rangePreviewLoading}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {rangePreviewLoading ? 'Previewing...' : 'Preview Count'}
                                    </motion.button>
                                    {rangeCount !== null && (
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{rangeCount} record(s) match</span>
                                    )}
                                </div>
                                <div className="modal-buttons">
                                    <motion.button
                                        className="Btn cancel"
                                        onClick={closeRangeDeleteModal}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        className="Btn delete-all"
                                        onClick={handleDeleteRange}
                                        disabled={rangeDeleting || rangeCount === null || rangeCount === 0}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {rangeDeleting ? 'Deleting...' : `Delete ${rangeCount ?? 0} Records`}
                                    </motion.button>
                                </div>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPanel;
