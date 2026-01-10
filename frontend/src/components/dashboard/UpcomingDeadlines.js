import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

const UpcomingDeadlines = () => {
    const navigate = useNavigate();
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeadlines = async () => {
            try {
                const res = await api.get('/theses');
                const theses = res.data;

                const activeWithDate = theses.filter(t =>
                    t.abgabedatum && !['abgeschlossen', 'Abbruch'].includes(t.status)
                );
                activeWithDate.sort((a, b) => new Date(a.abgabedatum) - new Date(b.abgabedatum));
                setDeadlines(activeWithDate.slice(0, 5));
                setLoading(false);
            } catch (err) {
                console.error("Fehler beim Laden der Fristen:", err);
                setLoading(false);
            }
        };
        fetchDeadlines();
    }, []);

    const getDaysRemaining = (dateString) => {
        const diff = new Date(dateString) - new Date();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('de-DE');
    };

    if (loading) return <div className="p-4 text-center text-muted">Laden...</div>;

    // HIER GEÄNDERT: custom-card und mt-0 für perfektes Alignment
    return (
        <div className="custom-card p-4 mt-0">
            <h5 className="fw-bold mb-4">⏳ Nächste Abgaben</h5>

            {deadlines.length > 0 ? (
                <ul className="list-group list-group-flush">
                    {deadlines.map(t => {
                        const days = getDaysRemaining(t.abgabedatum);
                        const isCritical = days <= 14;

                        return (
                            <li key={t.id} className="list-group-item px-0 py-3 border-bottom" onClick={() => navigate(`/edit/${t.id}`)} style={{cursor: 'pointer'}}>
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                    <span className="fw-bold text-dark" style={{maxWidth: '65%'}}>{t.studentName}</span>
                                    <span className={`badge ${isCritical ? 'bg-danger' : 'bg-primary'} rounded-pill`}>{days} Tage</span>
                                </div>
                                <small className="text-muted d-block text-truncate">{t.titel}</small>
                                <small className="text-muted">Frist: {formatDate(t.abgabedatum)}</small>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="text-center text-muted py-5">Keine anstehenden Fristen.</div>
            )}

            <div className="mt-3 text-center">
                <button className="btn btn-outline-primary w-100 btn-sm" onClick={() => navigate('/theses')}>Zur Übersicht</button>
            </div>
        </div>
    );
};

export default UpcomingDeadlines;