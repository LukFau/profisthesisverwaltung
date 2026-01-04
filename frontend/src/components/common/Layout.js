import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="app-container">
            {/* Linke Seite: Sidebar */}
            <Sidebar />

            {/* Rechte Seite: Inhalt */}
            <main className="main-content">
                {/* Outlet ist der Platzhalter, wo React Router die Seiten (ThesisList, DashboardHome etc.) rendert */}
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;