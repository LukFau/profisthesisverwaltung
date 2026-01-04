import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // useParams für ID
import api from '../../api/axiosConfig';
import '../../App.css';

const ThesisForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // ID aus der URL lesen
    const isEditMode = !!id; // true wenn ID existiert

    const [formData, setFormData] = useState({
        titel: '',
        typ: 'Bachelorarbeit',
        status: 'in Bearbeitung',
        studierendenId: '',
        studiengangId: '',
        poId: '',
        semesterId: '',
        // Neue Felder für Edit Mode
        betreuerId: '',
        noteArbeit: '',
        noteKolloquium: ''
    });

    const [masterData, setMasterData] = useState({
        students: [], semesters: [], studiengaenge: [], pos: [], betreuer: []
    });

    // 1. Stammdaten laden
    useEffect(() => {
        const loadMasterData = async () => {
            try {
                const [stud, sem, sg, po, bet] = await Promise.all([
                    api.get('/masterdata/students'),
                    api.get('/masterdata/semesters'),
                    api.get('/masterdata/studiengaenge'),
                    api.get('/masterdata/pos'),
                    api.get('/masterdata/betreuer')
                ]);
                setMasterData({
                    students: stud.data,
                    semesters: sem.data,
                    studiengaenge: sg.data,
                    pos: po.data,
                    betreuer: bet.data
                });
            } catch (err) { console.error(err); }
        };
        loadMasterData();
    }, []);

    // 2. Wenn Edit Mode: Vorhandene Daten laden
    useEffect(() => {
        if (isEditMode) {
            const loadThesis = async () => {
                try {
                    const res = await api.get(`/theses/${id}`);
                    const data = res.data;
                    setFormData({
                        titel: data.titel,
                        typ: data.typ,
                        status: data.status,
                        studierendenId: data.studierendenId || '',
                        studiengangId: data.studiengangId || '',
                        poId: data.poId || '',
                        semesterId: data.semesterId || '',
                        betreuerId: data.erstprueferId || '',
                        noteArbeit: data.noteArbeit || '',
                        noteKolloquium: data.noteKolloquium || ''
                    });
                } catch (err) {
                    alert("Fehler beim Laden der Arbeit");
                }
            };
            loadThesis();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await api.put(`/theses/${id}`, formData); // UPDATE
            } else {
                await api.post('/theses', formData); // CREATE
            }
            navigate('/');
        } catch (err) {
            alert('Fehler: ' + err.message);
        }
    };

    return (
        <div className="container form-container">
            <h2 className="mt-4">{isEditMode ? 'Arbeit bearbeiten' : 'Neue Arbeit anlegen'}</h2>
            <div className="custom-card">
                <form onSubmit={handleSubmit}>

                    {/* Titel */}
                    <div className="mb-4">
                        <label className="form-label">Titel der Arbeit</label>
                        <input type="text" className="form-control" name="titel" required value={formData.titel} onChange={handleChange} />
                    </div>

                    {/* Typ & Status */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="form-label">Typ</label>
                            <select className="form-select" name="typ" value={formData.typ} onChange={handleChange}>
                                <option value="Bachelorarbeit">Bachelorarbeit</option>
                                <option value="Masterarbeit">Masterarbeit</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Status</label>
                            <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                <option value="in Planung">In Planung</option>
                                <option value="in Bearbeitung">In Bearbeitung</option>
                                <option value="Kolloquium planen">Kolloquium planen</option>
                                <option value="abgeschlossen">Abgeschlossen</option>
                                <option value="Abbruch">Abbruch</option>
                            </select>
                        </div>
                    </div>

                    {/* Student & Betreuer */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="form-label">Student</label>
                            <select className="form-select" name="studierendenId" required value={formData.studierendenId} onChange={handleChange}>
                                <option value="">Wählen...</option>
                                {masterData.students.map(s => <option key={s.id} value={s.id}>{s.vorname} {s.nachname}</option>)}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Erstprüfer</label>
                            <select className="form-select" name="betreuerId" value={formData.betreuerId} onChange={handleChange}>
                                <option value="">Wählen...</option>
                                {masterData.betreuer.map(b => <option key={b.id} value={b.id}>{b.nachname}, {b.vorname}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Akademische Daten */}
                    <div className="row mb-4">
                        <div className="col-md-4">
                            <label className="form-label">Studiengang</label>
                            <select className="form-select" name="studiengangId" required value={formData.studiengangId} onChange={handleChange}>
                                <option value="">Wählen...</option>
                                {masterData.studiengaenge.map(s => <option key={s.id} value={s.id}>{s.bezeichnung}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">PO</label>
                            <select className="form-select" name="poId" required value={formData.poId} onChange={handleChange}>
                                <option value="">Wählen...</option>
                                {masterData.pos.map(p => <option key={p.id} value={p.id}>{p.bezeichnung}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Semester</label>
                            <select className="form-select" name="semesterId" required value={formData.semesterId} onChange={handleChange}>
                                <option value="">Wählen...</option>
                                {masterData.semesters.map(s => <option key={s.id} value={s.id}>{s.bezeichnung}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* NOTEN (Nur anzeigen, wenn Edit Mode oder explizit gewünscht) */}
                    <hr className="my-4"/>
                    <h5 className="mb-3 text-muted">Benotung</h5>
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="form-label">Note Arbeit</label>
                            <input type="number" step="0.1" className="form-control" name="noteArbeit"
                                   value={formData.noteArbeit} onChange={handleChange} placeholder="z.B. 1.3" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Note Kolloquium</label>
                            <input type="number" step="0.1" className="form-control" name="noteKolloquium"
                                   value={formData.noteKolloquium} onChange={handleChange} placeholder="z.B. 1.0" />
                        </div>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                        <button type="button" className="btn btn-secondary-custom" onClick={() => navigate('/')}>Abbrechen</button>
                        <button type="submit" className="btn btn-primary-custom">{isEditMode ? 'Änderungen speichern' : 'Anlegen'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ThesisForm;