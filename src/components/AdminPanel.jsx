import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminPanel.css';
import bannerText from './bannerText';
import { endpoints } from '../api/api';

const AdminPanel = () => {
    const [texts, setTexts] = useState([]);
    const [images, setImages] = useState([]);
    const [publicRooms, setPublicRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imagesLoading, setImagesLoading] = useState(true);
    const [publicRoomsLoading, setPublicRoomsLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState('');
    const [error, setError] = useState('');
    const [imagesError, setImagesError] = useState('');
    const [publicRoomsError, setPublicRoomsError] = useState('');
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
    const [files, setFiles] = useState([]);
    const [filesLoading, setFilesLoading] = useState(true);
    const [filesError, setFilesError] = useState('');
    const [showFileCodeModal, setShowFileCodeModal] = useState(false);
    const [editingFile, setEditingFile] = useState(null);
    const [newFileCode, setNewFileCode] = useState('');
    const [fileCodeError, setFileCodeError] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [actionMessage, setActionMessage] = useState({ text: '', type: '' });
    const [activeTab, setActiveTab] = useState('texts');
    const [showPublicRoomModal, setShowPublicRoomModal] = useState(false);
    const [publicRoomName, setPublicRoomName] = useState('');

    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
        if (!isAuthenticated) {
            window.location.href = '/admin/login';
        }
        refreshAll();
    }, []);

    const refreshAll = () => {
        fetchTexts();
        fetchImages();
        fetchFiles();
        fetchPublicRooms();
        fetchUsers();
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        setUsersError('');

        try {
            const response = await fetch(endpoints.adminUsers);
            const data = await response.json();

            if (data.success) {
                setUsers(data.users || []);
            } else {
                setUsersError('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error:', error);
            setUsersError('Failed to connect to server. Please try again.');
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchTexts = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(endpoints.adminTexts);
            const data = await response.json();

            if (data.success) {
                setTexts(data.texts);
            } else {
                setError('Failed to fetch texts');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchImages = async () => {
        setImagesLoading(true);
        setImagesError('');

        try {
            const response = await fetch(endpoints.adminImages);
            const data = await response.json();

            if (data.success) {
                setImages(data.images);
            } else {
                setImagesError('Failed to fetch images');
            }
        } catch (error) {
            console.error('Error:', error);
            setImagesError('Failed to connect to server. Please try again.');
        } finally {
            setImagesLoading(false);
        }
    };

    const fetchFiles = async () => {
        setFilesLoading(true);
        setFilesError('');

        try {
            const response = await fetch(endpoints.adminFiles);
            const data = await response.json();

            if (data.success) {
                setFiles(data.files || []);
            } else {
                setFilesError('Failed to fetch files');
            }
        } catch (error) {
            console.error('Error:', error);
            setFilesError('Failed to connect to server. Please try again.');
        } finally {
            setFilesLoading(false);
        }
    };

    const fetchPublicRooms = async () => {
        setPublicRoomsLoading(true);
        setPublicRoomsError('');

        try {
            const response = await fetch(endpoints.adminPublicRooms);
            const data = await response.json();

            if (data.success) {
                setPublicRooms(data.rooms || []);
            } else {
                setPublicRoomsError('Failed to fetch public rooms');
            }
        } catch (error) {
            console.error('Error:', error);
            setPublicRoomsError('Failed to connect to server. Please try again.');
        } finally {
            setPublicRoomsLoading(false);
        }
    };

    const handleDeleteText = async (id) => {
        if (!window.confirm('Are you sure you want to delete this text?')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteText(id), {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setTexts(texts.filter(text => text.id !== id));
                showActionMessage('Text deleted successfully', 'success');
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
            });

            const data = await response.json();

            if (data.success) {
                setTexts([]);
                showActionMessage('All texts deleted successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to delete texts', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleDeleteImage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteImage(id), {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setImages(images.filter(image => image.id !== id));
                showActionMessage('Image deleted successfully', 'success');
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
            });

            const data = await response.json();

            if (data.success) {
                setImages([]);
                showActionMessage('All images deleted successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to delete images', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
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
                headers: {
                    'Content-Type': 'application/json',
                },
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

        if (!newCode || isNaN(newCode) || newCode.length !== 4 || parseInt(newCode) < 1000 || parseInt(newCode) > 9999) {
            setCodeError('Code must be a 4-digit number between 1000 and 9999');
            return;
        }

        try {
            const response = await fetch(endpoints.adminUpdateCode(editingCode.id), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newCode: parseInt(newCode) }),
            });

            const data = await response.json();

            if (data.success) {
                setTexts(texts.map(text =>
                    text.id === editingCode.id ? { ...text, id: parseInt(newCode) } : text
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
                headers: {
                    'Content-Type': 'application/json',
                }
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
            const response = await fetch(endpoints.adminCheckCode(newCode));
            const data = await response.json();

            if (data.success) {
                if (!data.isAvailable && parseInt(newCode) !== editingCode.id) {
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

    const handleEditImageCode = (image) => {
        setEditingImage(image);
        setNewImageCode(image.id.toString());
        setImageCodeError('');
        setShowImageCodeModal(true);
    };

    const handleUpdateImageCode = async () => {
        if (!editingImage) return;
        setImageCodeError('');

        if (!newImageCode || isNaN(newImageCode) || newImageCode.length !== 4 || parseInt(newImageCode) < 1000 || parseInt(newImageCode) > 9999) {
            setImageCodeError('Code must be a 4-digit number between 1000 and 9999');
            return;
        }

        try {
            const response = await fetch(endpoints.adminUpdateImageCode(editingImage.id), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newCode: parseInt(newImageCode) }),
            });

            const data = await response.json();

            if (data.success) {
                setImages(images.map(image =>
                    image.id === editingImage.id ? { ...image, id: parseInt(newImageCode) } : image
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
            const response = await fetch(endpoints.adminCheckImageCode(newImageCode));
            const data = await response.json();

            if (data.success) {
                if (!data.isAvailable && parseInt(newImageCode) !== editingImage.id) {
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
                headers: {
                    'Content-Type': 'application/json',
                }
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
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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

    const handleDeletePublicRoom = async (code) => {
        if (!window.confirm(`Are you sure you want to delete public room ${code}?`)) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeletePublicRoom(code), {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setPublicRooms(publicRooms.filter(room => room.code !== code));
                showActionMessage('Public room deleted successfully', 'success');
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: publicRoomName || undefined }),
            });

            const data = await response.json();

            if (data.success) {
                setPublicRooms([...publicRooms, data.room]);
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

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This will also delete all their mapped items.')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteUser(id), {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setUsers(users.filter(user => user.id !== id));
                showActionMessage('User deleted successfully', 'success');
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
            });

            const data = await response.json();

            if (data.success) {
                setUsers([]);
                showActionMessage(`All users deleted successfully (${data.deletedCount} users)`, 'success');
            } else {
                showActionMessage(data.message || 'Failed to delete users', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleDeleteFile = async (id) => {
        if (!window.confirm('Are you sure you want to delete this file?')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteFile(id), {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setFiles(files.filter(file => file.id !== id));
                showActionMessage('File deleted successfully', 'success');
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
            });

            const data = await response.json();

            if (data.success) {
                setFiles([]);
                showActionMessage('All files deleted successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to delete files', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
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

        if (!newFileCode || isNaN(newFileCode) || newFileCode.length !== 4 || parseInt(newFileCode) < 1000 || parseInt(newFileCode) > 9999) {
            setFileCodeError('Code must be a 4-digit number between 1000 and 9999');
            return;
        }

        try {
            const response = await fetch(endpoints.adminUpdateFileCode(editingFile.id), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newCode: parseInt(newFileCode) }),
            });

            const data = await response.json();

            if (data.success) {
                setFiles(files.map(file =>
                    file.id === editingFile.id ? { ...file, id: parseInt(newFileCode) } : file
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
            const response = await fetch(endpoints.adminCheckFileCode(newFileCode));
            const data = await response.json();

            if (data.success) {
                if (!data.isAvailable && parseInt(newFileCode) !== editingFile.id) {
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
                headers: {
                    'Content-Type': 'application/json',
                }
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

    const showActionMessage = (text, type) => {
        setActionMessage({ text, type });
        setTimeout(() => {
            setActionMessage({ text: '', type: '' });
        }, 3000);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminAuthenticated');
        window.location.href = '/admin/login';
    };

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

            <div className="admin-controls">
                <motion.button
                    className="Btn refresh"
                    onClick={refreshAll}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Refresh All
                </motion.button>
                <motion.button
                    className="Btn change-password"
                    onClick={() => setShowPasswordModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Change Password
                </motion.button>
                <motion.button
                    className="Btn logout"
                    onClick={handleLogout}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Logout
                </motion.button>
            </div>

            <div className="admin-tabs">
                {[
                    { id: 'texts', label: 'Texts' },
                    { id: 'images', label: 'Images' },
                    { id: 'files', label: 'Files' },
                    { id: 'public-rooms', label: 'Public Rooms' },
                    { id: 'users', label: 'Users' },
                ].map((tab) => (
                    <motion.button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {tab.label}
                    </motion.button>
                ))}
            </div>

            <motion.div
                className="admin-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {activeTab === 'texts' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h1>Text Management</h1>
                            <motion.button
                                className="Btn delete-all"
                                onClick={handleDeleteAllTexts}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Delete All Texts
                            </motion.button>
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
                                                <td className="text-content">{text.text}</td>
                                                <td>{new Date(text.createdAt).toLocaleString()}</td>
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
                    </div>
                )}

                {activeTab === 'images' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h1>Image Management</h1>
                            <motion.button
                                className="Btn delete-all"
                                onClick={handleDeleteAllImages}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Delete All Images
                            </motion.button>
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
                                                <td>{new Date(image.createdAt).toLocaleString()}</td>
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
                    </div>
                )}

                {activeTab === 'files' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h1>File Management</h1>
                            <motion.button
                                className="Btn delete-all"
                                onClick={handleDeleteAllFiles}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Delete All Files
                            </motion.button>
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
                                                <td>{new Date(file.createdAt).toLocaleString()}</td>
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
                    </div>
                )}

                {activeTab === 'public-rooms' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
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
                                                <td>{new Date(room.createdAt).toLocaleString()}</td>
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
                    </div>
                )}

                {activeTab === 'users' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
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
                                                <td>{user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</td>
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
                    </div>
                )}
            </motion.div>

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
                                A random 4-digit code will be generated automatically.
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
        </div>
    );
};

export default AdminPanel;