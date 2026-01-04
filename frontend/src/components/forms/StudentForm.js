import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import '../../App.css'; // Styles importieren

const StudentForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        vorname: '', nachname: '', matrikelnummer: '', email: ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/masterdata/students', formData);
            navigate('/');
        } catch (err) {
            alert('Fehler: ' + err.message);
        }
    };

    return (
        <div className="container form-container">
            <h2 className="mt-4">Neuen Studenten anlegen</h2>
            <p className="text-muted-custom">Tragen Sie die persönlichen Daten des Studierenden ein.</p>

            <div className="custom-card">
                <form onSubmit={handleSubmit}>

                    {/* Zeile 1: Vorname & Nachname */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="form-label">Vorname</label>
                            <input
                                name="vorname"
                                className="form-control"
                                placeholder="Max"
                                required
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Nachname</label>
                            <input
                                name="nachname"
                                className="form-control"
                                placeholder="Mustermann"
                                required
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Zeile 2: Matrikelnr & Email */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="form-label">Matrikelnummer</label>
                            <input
                                name="matrikelnummer"
                                className="form-control"
                                placeholder="1234567"
                                required
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">E-Mail Adresse</label>
                            <input
                                name="email"
                                type="email"
                                className="form-control"
                                placeholder="max.mustermann@mni.thm.de"
                                required
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Buttons unten rechts */}
                    <div className="d-flex justify-content-end mt-5">
                        <button
                            type="button"
                            className="btn btn-secondary-custom"
                            onClick={() => navigate('/')}
                        >
                            Abbrechen
                        </button>
                        <button type="submit" className="btn btn-primary-custom">
                            Speichern
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;