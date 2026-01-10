import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import '../../App.css';

const Sidebar = () => {
    const [darkMode, setDarkMode] = useState(false);

    // Import States
    const [showImportModal, setShowImportModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        }
    }, []);

    const toggleTheme = () => {
        if (darkMode) {
            document.documentElement.setAttribute('data-bs-theme', 'light');
            localStorage.setItem('theme', 'light');
            setDarkMode(false);
        } else {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            setDarkMode(true);
        }
    };

    // Import Handler
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            setUploading(true);
            await api.post('/import/excel', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Import erfolgreich!");
            setShowImportModal(false);
            setSelectedFile(null);
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Fehler: " + (err.response?.data || err.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        Thesen Management System
                    </Link>
                </div>

                <ul className="sidebar-menu">
                    <div className="menu-label">ÜBERSICHT</div>
                    <li><NavLink to="/" end className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}><span className="menu-icon">📊</span> Dashboard</NavLink></li>

                    <div className="menu-label">VERWALTUNG</div>
                    <li><NavLink to="/theses" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}><span className="menu-icon">📁</span> Arbeiten</NavLink></li>
                    <li><NavLink to="/students" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}><span className="menu-icon">🎓</span> Studierende</NavLink></li>
                    <li><NavLink to="/betreuer" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}><span className="menu-icon">👨‍🏫</span> Referenten</NavLink></li>
                    <li><NavLink to="/sws" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}><span className="menu-icon">⏱️</span> SWS / Deputat</NavLink></li>
                    <div className="menu-label">SCHNELLZUGRIFF</div>
                    <li><NavLink to="/new" className="menu-item"><span className="menu-icon">+</span> Neue Arbeit</NavLink></li>
                    <li><NavLink to="/create-student" className="menu-item"><span className="menu-icon">+</span> Neuer Student</NavLink></li>
                    <li><NavLink to="/create-betreuer" className="menu-item"><span className="menu-icon">+</span> Neuer Referent</NavLink></li>

                    {/* IMPORT BUTTON */}
                    <li>
                        <button className="menu-item" onClick={() => setShowImportModal(true)}>
                            <span className="menu-icon">📥</span> Import Excel
                        </button>
                    </li>
                </ul>

                <div className="sidebar-footer">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600'}}>{darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" checked={darkMode} onChange={toggleTheme} style={{cursor: 'pointer'}}/>
                        </div>
                    </div>
                    <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Admin User</div>
                </div>
            </aside>

            {/* MODAL */}
            {showImportModal && (
                <>
                    <div className="modal-backdrop fade show" style={{zIndex: 1050}}></div>
                    <div className="modal fade show d-block" style={{zIndex: 1055}}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content custom-card p-0" style={{border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.3)'}}>
                                <div className="modal-header border-bottom px-4 py-3">
                                    <h5 className="modal-title fw-bold">Excel Import</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowImportModal(false)}></button>
                                </div>
                                <div className="modal-body px-4 py-4">
                                    <div className="mb-3">
                                        <label className="form-label">Datei auswählen (.xlsx)</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept=".xlsx, .xls"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <div className="alert alert-info small">
                                        Erforderliche Tabellenblätter: "Studierende" oder "Referenten".
                                    </div>
                                </div>
                                <div className="modal-footer border-top px-4 py-3 bg-light" style={{borderRadius: '0 0 12px 12px'}}>
                                    <button className="btn btn-secondary-custom me-2" onClick={() => setShowImportModal(false)}>Abbrechen</button>
                                    <button className="btn btn-primary-custom" onClick={handleUpload} disabled={!selectedFile || uploading}>
                                        {uploading ? 'Importiere...' : 'Hochladen'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Sidebar;