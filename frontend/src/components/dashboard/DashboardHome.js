import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import '../../App.css';

const DashboardHome = () => {
    const navigate = useNavigate();

    // State für Statistiken und Liste
    const [stats, setStats] = useState({
        planung: 0,
        bearbeitung: 0,
        kolloquium: 0,
        abgeschlossen: 0
    });

    const [activeTheses, setActiveTheses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Daten laden
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/theses');
                const theses = res.data;

                // 1. Zähler für die Kacheln
                const counts = {
                    planung: theses.filter(t => t.status === 'in Planung').length,
                    bearbeitung: theses.filter(t => t.status === 'in Bearbeitung' || t.status === 'Angemeldet').length,
                    kolloquium: theses.filter(t => t.status === 'Kolloquium planen').length,
                    abgeschlossen: theses.filter(t => t.status === 'abgeschlossen').length
                };
                setStats(counts);

                // 2. Liste der aktiven Arbeiten (alles außer Abgeschlossen/Abbruch)
                const active = theses.filter(t =>
                    t.status !== 'abgeschlossen' &&
                    t.status !== 'Abbruch'
                );

                // Sortierung: Dringlichkeit zuerst
                active.sort((a, b) => {
                    const priority = { 'Kolloquium planen': 1, 'in Bearbeitung': 2, 'Angemeldet': 2, 'in Planung': 3 };
                    return (priority[a.status] || 4) - (priority[b.status] || 4);
                });

                setActiveTheses(active);
                setLoading(false);

            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleTileClick = (filterStatus) => {
        navigate(`/theses?status=${filterStatus}`);
    };

    // Wir behalten die schönen neuen Farben passend zu den Kacheln
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Kolloquium planen': return 'bg-orange-light';
            case 'in Bearbeitung': return 'bg-yellow-light';
            case 'Angemeldet': return 'bg-yellow-light';
            case 'in Planung': return 'bg-blue-light';
            default: return 'bg-blue-light';
        }
    };

    if (loading) return null;

    return (
        <div className="container-fluid">
            <h3 className="mb-4 fw-bold">Übersicht Arbeiten</h3>

            {/* --- KACHELN (Bleiben im neuen Design) --- */}
            <div className="row g-4 mb-5">
                <div className="col-md-3" onClick={() => handleTileClick('in Planung')}>
                    <div className="stat-card">
                        <div className="stat-icon-wrapper bg-blue-light">#</div>
                        <div className="stat-details">
                            <h6>In Planung</h6>
                            <h3>{stats.planung}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-3" onClick={() => handleTileClick('in Bearbeitung')}>
                    <div className="stat-card">
                        <div className="stat-icon-wrapper bg-yellow-light">#</div>
                        <div className="stat-details">
                            <h6>In Bearbeitung</h6>
                            <h3>{stats.bearbeitung}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-3" onClick={() => handleTileClick('Kolloquium planen')}>
                    <div className="stat-card">
                        <div className="stat-icon-wrapper bg-orange-light">#</div>
                        <div className="stat-details">
                            <h6>Kolloquium planen</h6>
                            <h3>{stats.kolloquium}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-3" onClick={() => handleTileClick('abgeschlossen')}>
                    <div className="stat-card">
                        <div className="stat-icon-wrapper bg-green-light">#</div>
                        <div className="stat-details">
                            <h6>Abgeschlossen</h6>
                            <h3>{stats.abgeschlossen}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- TABELLE (ZURÜCKGESETZT: Zeigt alle Items + Karte) --- */}
            <div className="custom-card p-4"> {/* Rahmen ist wieder da */}

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-bold">Aktuelle Betreuungen ({activeTheses.length})</h5>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="text-muted small text-uppercase border-bottom">
                        <tr>
                            <th className="pb-3 ps-3">Titel der Arbeit</th>
                            <th className="pb-3">Referent</th>
                            <th className="pb-3 text-end">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {activeTheses.length > 0 ? (
                            // HIER GEÄNDERT: Kein .slice(0,5) mehr -> Zeigt ALLE
                            activeTheses.map((thesis) => (
                                <tr
                                    key={thesis.id}
                                    onClick={() => navigate(`/edit/${thesis.id}`)}
                                    style={{cursor: 'pointer'}}
                                >
                                    <td className="py-3 ps-3">
                                        <div className="fw-bold text-dark">{thesis.titel}</div>
                                        <small className="text-muted">
                                            {thesis.typ} • {thesis.studentName}
                                        </small>
                                    </td>
                                    <td className="py-3">
                                        {thesis.erstpruefer ? (
                                            <span className="text-dark">{thesis.erstpruefer}</span>
                                        ) : (
                                            <span className="text-muted small">
                                                    <em>(Noch nicht zugewiesen)</em>
                                                </span>
                                        )}
                                    </td>
                                    <td className="py-3 text-end">
                                            <span className={`badge rounded-pill ${getStatusBadge(thesis.status)} border-0`}
                                                  style={{fontSize: '0.85rem', fontWeight: '500', padding: '6px 12px'}}>
                                                {thesis.status}
                                            </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center text-muted py-5">
                                    Aktuell keine offenen Arbeiten.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;