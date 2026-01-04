import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import '../../App.css';

const BetreuerForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        titel: '', vorname: '', nachname: '', email: '', rolle: 'Prüfer'
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/masterdata/betreuer', formData);
            navigate('/dashboard');
        } catch (err) {
            alert('Fehler: ' + err.message);
        }
    };

    return (
        <div className="container form-container">
            <h2 className="mt-4">Neuen Referenten anlegen</h2>
            <p className="text-muted-custom">Verwalten Sie hier die Daten der Dozenten und Betreuer.</p>

            <div className="custom-card">
                <form onSubmit={handleSubmit}>

                    {/* Zeile 1: Titel (Optional) & Rolle */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="form-label">Titel (Optional)</label>
                            <select name="titel" className="form-select" onChange={handleChange}>
                                <option value="">Kein Titel</option>
                                <option value="Prof. Dr.">Prof. Dr.</option>
                                <option value="Dr.">Dr.</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Rolle</label>
                            <select name="rolle" className="form-select" onChange={handleChange}>
                                <option value="Prüfer">Prüfer</option>
                                <option value="Externer Prüfer">Externer Prüfer</option>
                            </select>
                        </div>
                    </div>

                    {/* Zeile 2: Vorname & Nachname */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="form-label">Vorname</label>
                            <input name="vorname" className="form-control" required onChange={handleChange} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Nachname</label>
                            <input name="nachname" className="form-control" required onChange={handleChange} />
                        </div>
                    </div>

                    {/* Zeile 3: Fachbereich/Email (Platzhalter wie im Bild) */}
                    <div className="mb-4">
                        <label className="form-label">Fachbereich (Optional)</label>
                        <input type="text" className="form-control" placeholder="z.B. MNI" />
                    </div>

                    {/* Buttons unten rechts */}
                    <div className="d-flex justify-content-end mt-5">
                        <button
                            type="button"
                            className="btn btn-secondary-custom"
                            onClick={() => navigate('/dashboard')}
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

export default BetreuerForm;