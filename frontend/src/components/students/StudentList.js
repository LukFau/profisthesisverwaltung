import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import '../../App.css';

const StudentList = () => {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        api.get('/masterdata/students').then(res => setStudents(res.data));
    }, []);

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">Studierende</h3>
                <Link to="/create-student" className="btn btn-primary-custom">+ Neuer Student</Link>
            </div>

            <div className="custom-card p-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase">
                        <tr>
                            <th className="ps-4 py-3">Matrikelnr.</th>
                            <th>Name</th>
                            <th>Email</th>
                        </tr>
                        </thead>
                        <tbody>
                        {students.map(s => (
                            <tr key={s.id}>
                                <td className="ps-4 fw-bold text-dark">{s.matrikelnummer}</td>
                                <td>{s.vorname} {s.nachname}</td>
                                <td className="text-muted">{s.email}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentList;