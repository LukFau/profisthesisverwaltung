import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import '../../App.css';

const ThesisList = () => {
    // --- States für Daten ---
    const [theses, setTheses] = useState([]);
    const [filteredTheses, setFilteredTheses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- States für Suche & Filter ---
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const statusFilter = searchParams.get('status') || '';

    // --- States für Sortierung ---
    const [sortConfig, setSortConfig] = useState({ key: 'abgabedatum', direction: 'ascending' });

    // --- States für Export Modal ---
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportSelection, setExportSelection] = useState({
        theses: true,
        students: false,
        betreuer: false
    });
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const allStatuses = ['in Planung', 'in Bearbeitung', 'Kolloquium planen', 'abgeschlossen', 'Abbruch'];

    // 1. Daten laden
    useEffect(() => {
        fetchTheses();
    }, []);

    const fetchTheses = async () => {
        try {
            const response = await api.get('/theses');
            setTheses(response.data);
            setLoading(false);
        } catch (err) {
            console.error("API Fehler:", err);
            setError("Verbindung fehlgeschlagen.");
            setLoading(false);
        }
    };

    // 2. Filter Logik
    useEffect(() => {
        let results = theses;

        // Status Filter
        if (statusFilter) {
            results = results.filter(t => t.status === statusFilter);
        }

        // Text Suche
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            results = results.filter(t =>
                t.titel.toLowerCase().includes(lowerTerm) ||
                (t.studentName && t.studentName.toLowerCase().includes(lowerTerm))
            );
        }
        setFilteredTheses(results);
    }, [statusFilter, searchTerm, theses]);

    // 3. Sortier Logik
    const sortedTheses = useMemo(() => {
        let sortableItems = [...filteredTheses];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key] || "";
                let bValue = b[sortConfig.key] || "";

                // Datumssortierung
                if (sortConfig.key === 'abgabedatum') {
                    const dateA = aValue ? new Date(aValue).getTime() : 9999999999999;
                    const dateB = bValue ? new Date(bValue).getTime() : 9999999999999;
                    if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                }

                // String Vergleich
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredTheses, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return <span style={{opacity: 0.3, marginLeft: '5px'}}>↕</span>;
        return sortConfig.direction === 'ascending' ? <span style={{marginLeft: '5px'}}>↑</span> : <span style={{marginLeft: '5px'}}>↓</span>;
    };

    const handleFilterChange = (e) => {
        const newStatus = e.target.value;
        if (newStatus) setSearchParams({ status: newStatus });
        else setSearchParams({});
    };

    // --- LÖSCHEN ---
    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Möchten Sie diese Arbeit wirklich löschen?")) {
            try {
                await api.delete(`/theses/${id}`);
                setTheses(prev => prev.filter(t => t.id !== id));
            } catch (err) {
                alert("Fehler beim Löschen: " + (err.response?.data || err.message));
            }
        }
    };

    // --- EXPORT LOGIK ---
    const openExportModal = (e) => {
        e.stopPropagation();
        setShowExportModal(true);
        setSelectedStatuses(allStatuses);
        setExportSelection({ theses: true, students: false, betreuer: false });
    };

    const handleSelectionChange = (type) => {
        setExportSelection(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const handleStatusCheckboxChange = (status) => {
        if (selectedStatuses.includes(status)) setSelectedStatuses(selectedStatuses.filter(s => s !== status));
        else setSelectedStatuses([...selectedStatuses, status]);
    };

    const handleConfirmExport = async () => {
        try {
            const url = '/export/combined';
            const params = {
                includeTheses: exportSelection.theses,
                includeStudents: exportSelection.students,
                includeBetreuer: exportSelection.betreuer
            };
            if (exportSelection.theses && selectedStatuses.length > 0 && selectedStatuses.length < allStatuses.length) {
                params.status = selectedStatuses;
            }
            if (!exportSelection.theses && !exportSelection.students && !exportSelection.betreuer) {
                alert("Bitte wählen Sie mindestens eine Kategorie aus.");
                return;
            }
            const response = await api.get(url, { params: params, paramsSerializer: { indexes: null }, responseType: 'blob' });
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `export_daten.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setShowExportModal(false);
        } catch (err) {
            alert("Export fehlgeschlagen.");
            console.error(err);
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
        <div className="container form-container" style={{ maxWidth: '1200px', position: 'relative' }}>

            {/* Header & Toolbar */}
            <div className="d-flex justify-content-between align-items-end mt-4 mb-3">
                <div>
                    <h2>Wissenschaftliche Arbeiten</h2>
                    <p className="text-muted-custom mb-0">Verwaltung aller laufenden und abgeschlossenen Thesen.</p>
                </div>

                <div className="d-flex align-items-center gap-2">
                    {/* Suche */}
                    <div className="input-group search-group" style={{width: '200px'}}>
                        <span className="input-group-text border-end-0">🔍</span>
                        <input type="text" className="form-control border-start-0 ps-0" placeholder="Suchen..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>

                    {/* Status Filter */}
                    <select className="form-select" style={{width: '150px', cursor: 'pointer'}} value={statusFilter} onChange={handleFilterChange}>
                        <option value="">Alle Status</option>
                        <option value="in Planung">In Planung</option>
                        <option value="in Bearbeitung">In Bearbeitung</option>
                        <option value="Kolloquium planen">Kolloquium planen</option>
                        <option value="abgeschlossen">Abgeschlossen</option>
                        <option value="Abbruch">Abbruch</option>
                    </select>

                    {/* Export Button */}
                    <button onClick={openExportModal} className="btn btn-secondary-custom d-flex align-items-center" title="Excel Export">
                        <span className="me-2">📊</span> Export
                    </button>

                    {/* Neu Button */}
                    <Link to="/new" className="btn btn-primary-custom text-nowrap">+ Neu</Link>
                </div>
            </div>

            {/* Tabelle */}
            <div className="custom-card p-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="text-muted small text-uppercase">
                        <tr>
                            <th className="ps-4 py-3" onClick={() => requestSort('titel')} style={{cursor:'pointer'}}>
                                Titel {getSortIndicator('titel')}
                            </th>
                            <th onClick={() => requestSort('studentName')} style={{cursor:'pointer'}}>
                                Studierende/r {getSortIndicator('studentName')}
                            </th>
                            <th onClick={() => requestSort('studiengang')} style={{cursor:'pointer'}}>
                                Studiengang {getSortIndicator('studiengang')}
                            </th>
                            <th onClick={() => requestSort('erstpruefer')} style={{cursor:'pointer'}}>
                                Referent (Erst) {getSortIndicator('erstpruefer')}
                            </th>
                            <th onClick={() => requestSort('status')} style={{cursor:'pointer'}}>
                                Status {getSortIndicator('status')}
                            </th>
                            <th className="text-end" onClick={() => requestSort('abgabedatum')} style={{cursor:'pointer'}}>
                                Abgabe {getSortIndicator('abgabedatum')}
                            </th>
                            <th className="pe-4 text-end" style={{width: '50px'}}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedTheses.map((thesis) => (
                            <tr key={thesis.id} onClick={() => navigate(`/edit/${thesis.id}`)} style={{cursor: 'pointer'}}>
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
                                    <br/><small className="text-muted">{thesis.semester}</small>
                                </td>
                                <td>
                                    {thesis.erstpruefer ? <span className="text-dark">{thesis.erstpruefer}</span> : <span className="text-muted small">-</span>}
                                </td>
                                <td><span className={`badge rounded-pill ${getStatusBadge(thesis.status)}`}>{thesis.status}</span></td>
                                <td className="text-end text-muted">{formatDate(thesis.abgabedatum)}</td>

                                {/* Lösch-Button */}
                                <td className="pe-4 text-end">
                                    <button
                                        className="btn btn-sm btn-outline-danger border-0"
                                        onClick={(e) => handleDelete(e, thesis.id)}
                                        title="Löschen"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {sortedTheses.length === 0 && <tr><td colSpan="7" className="text-center py-5 text-muted">Keine Ergebnisse.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <>
                    <div className="modal-backdrop fade show" style={{zIndex: 1050}}></div>
                    <div className="modal fade show d-block" tabIndex="-1" style={{zIndex: 1055}}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content custom-card p-0" style={{border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'}}>
                                <div className="modal-header border-bottom px-4 py-3">
                                    <h5 className="modal-title fw-bold">Daten Exportieren</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowExportModal(false)}></button>
                                </div>
                                <div className="modal-body px-4 py-4">
                                    <div className="mb-4">
                                        <label className="form-label fw-bold mb-2">Was möchten Sie exportieren?</label>
                                        <div className="d-flex flex-column gap-2">
                                            <div className="form-check p-2 rounded border bg-light">
                                                <input className="form-check-input ms-1 me-2" type="checkbox" id="chk-theses"
                                                       checked={exportSelection.theses} onChange={() => handleSelectionChange('theses')} />
                                                <label className="form-check-label fw-bold" htmlFor="chk-theses" style={{cursor:'pointer'}}>Liste der Arbeiten (Theses)</label>
                                            </div>
                                            <div className="form-check p-2 rounded border" style={{backgroundColor: 'var(--bg-app)'}}>
                                                <input className="form-check-input ms-1 me-2" type="checkbox" id="chk-students"
                                                       checked={exportSelection.students} onChange={() => handleSelectionChange('students')} />
                                                <label className="form-check-label" htmlFor="chk-students" style={{cursor:'pointer'}}>Liste aller Studierenden</label>
                                            </div>
                                            <div className="form-check p-2 rounded border" style={{backgroundColor: 'var(--bg-app)'}}>
                                                <input className="form-check-input ms-1 me-2" type="checkbox" id="chk-betreuer"
                                                       checked={exportSelection.betreuer} onChange={() => handleSelectionChange('betreuer')} />
                                                <label className="form-check-label" htmlFor="chk-betreuer" style={{cursor:'pointer'}}>Liste aller Referenten</label>
                                            </div>
                                        </div>
                                    </div>
                                    {exportSelection.theses && (
                                        <div className="mb-3 ps-3 border-start border-3 border-primary">
                                            <label className="form-label d-block fw-bold text-primary">Status der Arbeiten filtern:</label>
                                            <div className="d-flex flex-wrap gap-2">
                                                <button className="btn btn-sm btn-outline-secondary mb-2" onClick={() => setSelectedStatuses(allStatuses)}>Alle wählen</button>
                                                <button className="btn btn-sm btn-outline-secondary mb-2" onClick={() => setSelectedStatuses([])}>Keine</button>
                                            </div>
                                            <div className="card p-3" style={{maxHeight: '150px', overflowY: 'auto', backgroundColor: 'var(--input-bg)'}}>
                                                {allStatuses.map(status => (
                                                    <div className="form-check" key={status}>
                                                        <input className="form-check-input" type="checkbox" id={`chk-status-${status}`} checked={selectedStatuses.includes(status)} onChange={() => handleStatusCheckboxChange(status)} />
                                                        <label className="form-check-label" htmlFor={`chk-status-${status}`}>{status}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-top px-4 py-3 bg-light" style={{borderRadius: '0 0 12px 12px'}}>
                                    <button type="button" className="btn btn-secondary-custom me-2" onClick={() => setShowExportModal(false)}>Abbrechen</button>
                                    <button type="button" className="btn btn-primary-custom" onClick={handleConfirmExport}>Herunterladen</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ThesisList;