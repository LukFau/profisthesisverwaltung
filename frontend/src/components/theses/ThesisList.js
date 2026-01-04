import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import '../../App.css';

const ThesisList = () => {
    const [theses, setTheses] = useState([]);
    const [filteredTheses, setFilteredTheses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const statusFilter = searchParams.get('status') || '';

    useEffect(() => {
        const fetchTheses = async () => {
            try {
                const response = await api.get('/theses');
                setTheses(response.data);
                setLoading(false);
            } catch (err) {
                console.error("API Fehler:", err);
                setError("Verbindung zum Server fehlgeschlagen.");
                setLoading(false);
            }
        };
        fetchTheses();
    }, []);

    useEffect(() => {
        let results = theses;

        if (statusFilter) {
            results = results.filter(t => t.status === statusFilter);
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            results = results.filter(t =>
                t.titel.toLowerCase().includes(lowerTerm) ||
                (t.studentName && t.studentName.toLowerCase().includes(lowerTerm))
            );
        }

        setFilteredTheses(results);

    }, [statusFilter, searchTerm, theses]);

    const handleFilterChange = (e) => {
        const newStatus = e.target.value;
        if (newStatus) setSearchParams({ status: newStatus });
        else setSearchParams({});
    };

    const handleExport = async (e) => {
        e.stopPropagation();
        try {
            const response = await api.get('/export/theses', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'theses_export.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Export fehlgeschlagen.");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('de-DE');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'abgeschlossen': return 'bg-success';
            case 'in Bearbeitung': return 'bg-warning text-dark';
            case 'in Planung': return 'bg-info text-dark';
            case 'Kolloquium planen': return 'bg-primary';
            case 'Abbruch': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
    if (error) return <div className="alert alert-danger container mt-5">{error}</div>;

    return (
        <div className="container form-container" style={{ maxWidth: '1200px' }}>

            <div className="d-flex justify-content-between align-items-end mt-4 mb-3">
                <div>
                    <h2>Wissenschaftliche Arbeiten</h2>
                    <p className="text-muted-custom mb-0">Verwaltung aller laufenden und abgeschlossenen Thesen.</p>
                </div>

                <div className="d-flex align-items-center gap-2">

                    {/* --- FIX: bg-white entfernt! --- */}
                    <div className="input-group search-group" style={{width: '250px'}}>
                        <span className="input-group-text border-end-0">
                            🔍
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0 ps-0"
                            placeholder="Suchen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="form-select"
                        style={{width: '180px', cursor: 'pointer'}}
                        value={statusFilter}
                        onChange={handleFilterChange}
                    >
                        <option value="">Alle Status</option>
                        <option value="in Planung">In Planung</option>
                        <option value="in Bearbeitung">In Bearbeitung</option>
                        <option value="Kolloquium planen">Kolloquium planen</option>
                        <option value="abgeschlossen">Abgeschlossen</option>
                        <option value="Abbruch">Abbruch</option>
                    </select>

                    <button onClick={handleExport} className="btn btn-secondary-custom d-flex align-items-center" title="Excel Export">
                        <span className="me-2">📊</span> Export
                    </button>

                    <Link to="/new" className="btn btn-primary-custom text-nowrap">
                        + Neu
                    </Link>
                </div>
            </div>

            <div className="custom-card p-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="text-muted small text-uppercase">
                        <tr>
                            <th className="ps-4 py-3">Titel</th>
                            <th>Studierende/r</th>
                            <th>Studiengang</th>
                            <th>Referent (Erst)</th>
                            <th>Status</th>
                            <th className="pe-4 text-end">Abgabe</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredTheses.map((thesis) => (
                            <tr
                                key={thesis.id}
                                onClick={() => navigate(`/edit/${thesis.id}`)}
                                style={{cursor: 'pointer'}}
                                title="Klicken zum Bearbeiten"
                            >
                                <td className="ps-4 py-3">
                                    <div className="fw-bold text-dark">{thesis.titel}</div>
                                    <small className="text-muted">{thesis.typ}</small>
                                </td>
                                <td>
                                    <div className="fw-bold text-dark">{thesis.studentName}</div>
                                    <small className="text-muted">{thesis.matrikelnummer}</small>
                                </td>
                                <td>
                                    <span className="text-dark">{thesis.studiengang}</span>
                                    <br/>
                                    <small className="text-muted">{thesis.semester}</small>
                                </td>
                                <td>
                                    {thesis.erstpruefer ? (
                                        <span className="text-dark">{thesis.erstpruefer}</span>
                                    ) : (
                                        <span className="text-muted small">-</span>
                                    )}
                                </td>
                                <td>
                                        <span className={`badge rounded-pill ${getStatusBadge(thesis.status)}`}>
                                            {thesis.status}
                                        </span>
                                </td>
                                <td className="pe-4 text-end text-muted">
                                    {formatDate(thesis.abgabedatum)}
                                </td>
                            </tr>
                        ))}
                        {filteredTheses.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-5 text-muted">
                                    {searchTerm ? `Keine Ergebnisse für "${searchTerm}" gefunden.` : "Keine Arbeiten vorhanden."}
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

export default ThesisList;