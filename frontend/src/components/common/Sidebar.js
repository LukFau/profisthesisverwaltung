import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import '../../App.css'; // Styles importieren, falls nicht global geladen

const Sidebar = () => {
    // State für Dark Mode
    const [darkMode, setDarkMode] = useState(false);

    // Beim Laden: Prüfen, ob eine Einstellung gespeichert war
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        }
    }, []);

    // Funktion zum Umschalten des Designs
    const toggleTheme = () => {
        if (darkMode) {
            // Zu Light Mode wechseln
            document.documentElement.setAttribute('data-bs-theme', 'light');
            localStorage.setItem('theme', 'light');
            setDarkMode(false);
        } else {
            // Zu Dark Mode wechseln
            document.documentElement.setAttribute('data-bs-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            setDarkMode(true);
        }
    };

    return (
        <aside className="sidebar">
            {/* Header / Logo Bereich */}
            <div className="sidebar-header">
                <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                    TMS <span style={{fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.9rem'}}>MANAGER</span>
                </Link>
            </div>

            {/* Menü Liste */}
            <ul className="sidebar-menu">
                {/* Sektion: Verwaltung */}
                <div className="menu-label">VERWALTUNG</div>
                <li>
                    <NavLink to="/" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                        <span className="menu-icon">📁</span> Arbeiten
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/students" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                        <span className="menu-icon">🎓</span> Studierende
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/betreuer" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                        <span className="menu-icon">👨‍🏫</span> Referenten
                    </NavLink>
                </li>

                {/* Sektion: Schnellzugriff */}
                <div className="menu-label">SCHNELLZUGRIFF</div>
                <li>
                    <NavLink to="/new" className="menu-item">
                        <span className="menu-icon">+</span> Neue Arbeit
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/create-student" className="menu-item">
                        <span className="menu-icon">+</span> Neuer Student
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/create-betreuer" className="menu-item">
                        <span className="menu-icon">+</span> Neuer Referent
                    </NavLink>
                </li>
            </ul>

            {/* Footer Bereich (ganz unten) */}
            <div className="sidebar-footer">

                {/* Dark Mode Schalter */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600'}}>
                        {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                    </span>
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={darkMode}
                            onChange={toggleTheme}
                            style={{cursor: 'pointer'}}
                        />
                    </div>
                </div>

                {/* User Info */}
                <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                    Admin User
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;