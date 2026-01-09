import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import '../../App.css';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'nachname', direction: 'ascending' });

    useEffect(() => {
        api.get('/students').then(res => {
            setStudents(res.data);
            setFilteredStudents(res.data);
        }).catch(console.error);
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredStudents(students);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            setFilteredStudents(students.filter(s =>
                s.matrikelnummer.toLowerCase().includes(lowerTerm) ||
                s.nachname.toLowerCase().includes(lowerTerm)
            ));
        }
    }, [searchTerm, students]);

    const sortedStudents = useMemo(() => {
        let items = [...filteredStudents];
        if (sortConfig !== null) {
            items.sort((a, b) => {
                let valA = a[sortConfig.key] ? a[sortConfig.key].toLowerCase() : "";
                let valB = b[sortConfig.key] ? b[sortConfig.key].toLowerCase() : "";

                if (sortConfig.key === 'name') {
                    valA = a.nachname.toLowerCase();
                    valB = b.nachname.toLowerCase();
                }

                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [filteredStudents, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return <span style={{opacity: 0.3, marginLeft:'5px'}}>↕</span>;
        return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    };

    // --- NEU: LÖSCHEN ---
    const handleDelete = async (id) => {
        if (window.confirm("Möchten Sie diesen Studierenden wirklich löschen?")) {
            try {
                await api.delete(`/students/${id}`);
                setStudents(prev => prev.filter(s => s.id !== id));
            } catch (err) {
                alert("Fehler beim Löschen: " + (err.response?.data || err.message));
            }
        }
    };

    return (
        <div className="container form-container" style={{ maxWidth: '1200px' }}>
            <div className="d-flex justify-content-between align-items-end mt-4 mb-3">
                <h2>Studierende</h2>
                <div className="d-flex gap-2">
                    <input type="text" className="form-control" placeholder="Suchen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{width:'200px'}} />
                    <Link to="/create-student" className="btn btn-primary-custom">+ Neu</Link>
                </div>
            </div>

            <div className="custom-card p-0">
                <table className="table table-hover mb-0">
                    <thead className="text-muted small text-uppercase" style={{backgroundColor: 'var(--bg-app)'}}>
                    <tr>
                        <th className="ps-4 py-3" onClick={() => requestSort('matrikelnummer')} style={{cursor:'pointer'}}>
                            Matrikelnr. {getSortIndicator('matrikelnummer')}
                        </th>
                        <th onClick={() => requestSort('name')} style={{cursor:'pointer'}}>
                            Name {getSortIndicator('name')}
                        </th>
                        <th onClick={() => requestSort('email')} style={{cursor:'pointer'}}>
                            Email {getSortIndicator('email')}
                        </th>
                        <th className="pe-4 text-end" style={{width: '50px'}}></th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedStudents.map(s => (
                        <tr key={s.id}>
                            <td className="ps-4 fw-bold">{s.matrikelnummer}</td>
                            <td>{s.nachname}, {s.vorname}</td>
                            <td className="text-muted">{s.email}</td>
                            <td className="pe-4 text-end">
                                <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(s.id)} title="Löschen">🗑️</button>
                            </td>
                        </tr>
                    ))}
                    {sortedStudents.length === 0 && <tr><td colSpan="4" className="text-center py-5 text-muted">Keine Ergebnisse.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default StudentList;