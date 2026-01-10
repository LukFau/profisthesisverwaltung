import React, { useState, useEffect, useMemo } from 'react'; // useMemo hinzufügen!
import api from '../../api/axiosConfig';
import '../../App.css';

const SwsList = () => {
    const [swsData, setSwsData] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedBetreuer, setSelectedBetreuer] = useState(null);

    // --- NEU: Sortier-State ---
    const [sortConfig, setSortConfig] = useState({ key: 'betreuerName', direction: 'ascending' });

    // Statistik-State für das Modal
    const [reportSummary, setReportSummary] = useState({});

    useEffect(() => {
        api.get('/masterdata/semester').then(res => {
            if(res.data.length > 0) {
                setSemesters(res.data);
                setSelectedSemester(res.data[0].id);
            }
        });
    }, []);

    useEffect(() => {
        if (!selectedSemester) return;
        setLoading(true);
        api.get(`/sws?semesterId=${selectedSemester}`)
            .then(res => { setSwsData(res.data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, [selectedSemester]);

    useEffect(() => {
        if (selectedBetreuer && selectedBetreuer.details) {
            const summary = selectedBetreuer.details.reduce((acc, curr) => {
                const typ = curr.art || 'Unbekannt';
                acc[typ] = (acc[typ] || 0) + 1;
                return acc;
            }, {});
            setReportSummary(summary);
        }
    }, [selectedBetreuer]);

    const handleExport = async () => {
        try {
            const response = await api.get(`/export/sws?semesterId=${selectedSemester}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'deputat_sws.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Export fehlgeschlagen.");
        }
    };

    // 1. Erst filtern
    const filteredData = swsData.filter(row =>
        row.betreuerName && row.betreuerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Dann sortieren (NEU)
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Falls Werte Strings sind, case-insensitive vergleichen
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
    }, [filteredData, sortConfig]);

    // Helper für Sortierung
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

    const getProgressBarColor = (value, limit) => {
        if (value >= limit) return 'bg-danger';
        if (value / limit >= 0.75) return 'bg-warning';
        return 'bg-success';
    };

    return (
        <div className="container form-container" style={{ maxWidth: '1200px' }}>

            <div className="d-flex justify-content-between align-items-end mt-4 mb-3">
                <div>
                    <h2>SWS Übersicht</h2>
                    <p className="text-muted-custom mb-0">Deputatsberechnung & Reports.</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <select className="form-select" style={{width:'200px'}} value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
                        {semesters.map(s => <option key={s.id} value={s.id}>{s.bezeichnung}</option>)}
                    </select>
                    <button className="btn btn-secondary-custom" onClick={handleExport}>📊 Export</button>
                    <input type="text" className="form-control" style={{width:'200px'}} placeholder="Suchen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="custom-card p-0">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light text-muted small text-uppercase">
                    <tr>
                        {/* Klickbare Header für Sortierung */}
                        <th className="ps-4 py-3" onClick={() => requestSort('betreuerName')} style={{cursor: 'pointer'}}>
                            Betreuer {getSortIndicator('betreuerName')}
                        </th>
                        <th className="text-center" onClick={() => requestSort('anzahlArbeiten')} style={{cursor: 'pointer'}}>
                            Arbeiten {getSortIndicator('anzahlArbeiten')}
                        </th>
                        <th className="text-center" onClick={() => requestSort('swsBerechnet')} style={{cursor: 'pointer'}}>
                            Berechnet {getSortIndicator('swsBerechnet')}
                        </th>
                        <th onClick={() => requestSort('swsAnrechenbar')} style={{cursor: 'pointer'}}>
                            Anrechenbar (Max 2.0) {getSortIndicator('swsAnrechenbar')}
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* Wir mappen jetzt über sortedData statt filteredData */}
                    {sortedData.map(row => {
                        const isLimit = row.swsBerechnet >= row.limit;
                        return (
                            <tr key={row.betreuerId} onClick={() => setSelectedBetreuer(row)} style={{cursor: 'pointer', backgroundColor: isLimit ? '#f8f9fa' : 'white', color: isLimit ? '#6c757d' : 'inherit'}}>
                                <td className="ps-4 fw-bold">{row.betreuerName} {isLimit && <span className="badge bg-secondary ms-2">Limit</span>}</td>
                                <td className="text-center">{row.anzahlArbeiten}</td>
                                <td className="text-center">{row.swsBerechnet.toFixed(1)}</td>
                                <td className="pe-4">
                                    <div className="d-flex align-items-center">
                                        <span className="fw-bold me-2" style={{width:'35px', textAlign:'right'}}>{row.swsAnrechenbar.toFixed(1)}</span>
                                        <div className="progress flex-grow-1" style={{height:'6px'}}>
                                            <div className={`progress-bar ${getProgressBarColor(row.swsAnrechenbar, row.limit)}`} style={{width:`${Math.min((row.swsAnrechenbar/row.limit)*100, 100)}%`}}></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {sortedData.length === 0 && <tr><td colSpan="4" className="text-center py-4">Keine Daten gefunden.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* DETAIL MODAL (Unverändert) */}
            {selectedBetreuer && (
                <>
                    <div className="modal-backdrop fade show" style={{zIndex: 1050}}></div>
                    <div className="modal fade show d-block" tabIndex="-1" style={{zIndex: 1055}}>
                        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content custom-card p-0" style={{border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'}}>
                                <div className="modal-header border-bottom px-4 py-4 bg-light">
                                    <h4 className="modal-title fw-bold">Report: {selectedBetreuer.betreuerName}</h4>
                                    <button type="button" className="btn-close" onClick={() => setSelectedBetreuer(null)}></button>
                                </div>
                                <div className="modal-body px-5 py-5">

                                    <div className="row mb-5 g-4">
                                        <div className="col-md-5">
                                            <div className="card bg-light border-0 p-4 h-100 shadow-sm">
                                                <h6 className="text-muted small fw-bold text-uppercase mb-3">Allgemeine Daten</h6>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>Semester:</span>
                                                    <strong>{selectedBetreuer.semesterName}</strong>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>Gesamt Berechnet:</span>
                                                    <strong>{selectedBetreuer.swsBerechnet.toFixed(1)} SWS</strong>
                                                </div>
                                                <div className="d-flex justify-content-between pt-2 border-top">
                                                    <span>Anrechenbar (Deputat):</span>
                                                    <strong className="text-success fs-5">{selectedBetreuer.swsAnrechenbar.toFixed(1)} SWS</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-7">
                                            <div className="card border p-4 h-100 shadow-sm">
                                                <h6 className="text-muted small fw-bold text-uppercase mb-3">Zusammensetzung nach Typ</h6>
                                                {Object.keys(reportSummary).length > 0 ? (
                                                    <div className="d-flex flex-wrap gap-3">
                                                        {Object.entries(reportSummary).map(([key, val]) => (
                                                            <div key={key} className="d-flex align-items-center border rounded px-3 py-2 bg-white">
                                                                <span className="me-2 text-muted">{key}:</span>
                                                                <span className="badge bg-primary rounded-pill fs-6">{val}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <div className="text-muted fst-italic">Keine Kategorien verfügbar</div>}
                                            </div>
                                        </div>
                                    </div>

                                    <h5 className="fw-bold mb-3">Einzelaufstellung der Arbeiten</h5>
                                    <div className="table-responsive border rounded">
                                        <table className="table table-striped table-hover align-middle mb-0">
                                            <thead className="bg-light text-muted small text-uppercase">
                                            <tr>
                                                <th className="py-3 ps-4">Titel der Arbeit</th>
                                                <th className="py-3">Studierende/r</th>
                                                <th className="py-3">Art</th>
                                                <th className="py-3">Rolle</th>
                                                <th className="py-3 pe-4 text-end">Faktor</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {selectedBetreuer.details && selectedBetreuer.details.map((d, i) => (
                                                <tr key={i}>
                                                    <td className="ps-4 fw-medium">{d.titel}</td>
                                                    <td>{d.studentName}</td>
                                                    <td>
                                                            <span className="badge bg-secondary fw-normal border border-secondary text-white bg-opacity-75">
                                                                {d.art}
                                                            </span>
                                                    </td>
                                                    <td className="text-muted small">{d.rolle}</td>
                                                    <td className="pe-4 text-end fw-bold text-primary">0.2</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="modal-footer px-4 py-3 bg-light border-top">
                                    <button className="btn btn-primary-custom px-4" onClick={() => setSelectedBetreuer(null)}>Schließen</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SwsList;