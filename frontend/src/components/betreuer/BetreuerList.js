import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import '../../App.css';

const BetreuerList = () => {
    const [betreuer, setBetreuer] = useState([]);

    useEffect(() => {
        api.get('/betreuer').then(res => setBetreuer(res.data));
    }, []);

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">Referenten</h3>
                <Link to="/create-betreuer" className="btn btn-primary-custom">+ Neuer Referent</Link>
            </div>

            <div className="custom-card p-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase">
                        <tr>
                            <th className="ps-4 py-3">Titel</th>
                            <th>Name</th>
                            <th>Rolle</th>
                        </tr>
                        </thead>
                        <tbody>
                        {betreuer.map(b => (
                            <tr key={b.id}>
                                <td className="ps-4 text-muted">{b.titel}</td>
                                <td className="fw-bold text-dark">{b.vorname} {b.nachname}</td>
                                <td>
                                        <span className="badge bg-light text-dark border">
                                            {b.rolle}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BetreuerList;