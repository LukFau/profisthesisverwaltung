import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import '../../App.css';

const ThesisForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    // --- FORM DATA ---
    const [formData, setFormData] = useState({
        titel: '',
        typ: 'Bachelorarbeit', // Standard
        status: 'in Planung',
        studierendenId: '',
        studiengangId: '',
        pruefungsordnungId: '',
        semesterId: '',
        erstprueferId: '',
        zweitprueferId: '',
        anfangsdatum: '',
        abgabedatum: '',
        kolloquiumsdatum: '',
        noteArbeit: '',
        noteKolloquium: ''
    });

    // --- STAMMDATEN ---
    const [students, setStudents] = useState([]);
    const [studiengaenge, setStudiengaenge] = useState([]);
    const [pos, setPos] = useState([]);
    const [semester, setSemester] = useState([]);
    const [betreuer, setBetreuer] = useState([]);

    // --- SUCHFELD STATES ---
    const [studentSearch, setStudentSearch] = useState("");
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);
    const searchWrapperRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 1. Daten laden
    useEffect(() => {
        const loadData = async () => {
            try {
                // Stammdaten laden
                const [studRes, sgRes, poRes, semRes, betrRes] = await Promise.all([
                    api.get('/students'),
                    api.get('/masterdata/studiengaenge'),
                    api.get('/masterdata/pos'),
                    api.get('/masterdata/semester'),
                    api.get('/betreuer')
                ]);

                setStudents(studRes.data);
                setStudiengaenge(sgRes.data);
                setPos(poRes.data);
                setSemester(semRes.data);
                setBetreuer(betrRes.data);

                // Wenn Edit-Modus: Thesis laden
                if (isEditMode) {
                    const thesisRes = await api.get(`/theses/${id}`);
                    const t = thesisRes.data;

                    setFormData({
                        titel: t.titel || '',
                        typ: t.typ || 'Bachelorarbeit',
                        status: t.status || 'in Planung',
                        studierendenId: t.studierendenId || '',
                        studiengangId: t.studiengangId || '',
                        pruefungsordnungId: t.poId || '',
                        semesterId: t.semesterId || '',
                        erstprueferId: t.erstprueferId || '',
                        zweitprueferId: t.zweitprueferId || '',
                        anfangsdatum: t.anfangsdatum || '',
                        abgabedatum: t.abgabedatum || '',
                        kolloquiumsdatum: t.kolloquiumsdatum || '',
                        noteArbeit: t.noteArbeit || '',
                        noteKolloquium: t.noteKolloquium || ''
                    });

                    // Suchfeld füllen
                    if (t.studentName) {
                        setStudentSearch(`${t.studentName} (${t.matrikelnummer})`);
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Fehler beim Laden der Daten.");
                setLoading(false);
            }
        };
        loadData();

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [id, isEditMode]);

    // Helper
    const handleClickOutside = (event) => {
        if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
            setShowStudentDropdown(false);
        }
    };

    // --- NEU: FRISTEN BERECHNEN ---
    const calculateDeadline = (startDate, type) => {
        if (!startDate) return '';

        let weeks = 0;
        // Standardwerte: Bachelor 12 Wochen, Master 22 Wochen
        if (type === 'Bachelorarbeit') weeks = 12;
        else if (type === 'Masterarbeit') weeks = 22;
        else return ''; // Bei Projektarbeiten etc. keine Automatik

        const date = new Date(startDate);
        if (isNaN(date.getTime())) return ''; // Gültiges Datum prüfen

        date.setDate(date.getDate() + (weeks * 7));
        return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
    };

    // --- LOGIK: STUDIENGANG FILTERN ---
    const filteredStudiengaenge = studiengaenge.filter(sg => {
        if (formData.typ === 'Bachelorarbeit') {
            return sg.abschluss && sg.abschluss.startsWith('B');
        }
        if (formData.typ === 'Masterarbeit') {
            return sg.abschluss && sg.abschluss.startsWith('M');
        }
        return true;
    });

    // --- LOGIK: CHANGE HANDLER ---
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // A) Wenn sich der TYP ändert
            if (name === 'typ') {
                newData.studiengangId = '';
                newData.pruefungsordnungId = '';

                // NEU: Frist aktualisieren (falls Startdatum schon gesetzt ist)
                const newDeadline = calculateDeadline(prev.anfangsdatum, value);
                if (newDeadline) newData.abgabedatum = newDeadline;
            }

            // B) Wenn sich das ANFANGSDATUM ändert (NEU)
            if (name === 'anfangsdatum') {
                const newDeadline = calculateDeadline(value, prev.typ);
                if (newDeadline) newData.abgabedatum = newDeadline;
            }

            // C) Wenn sich der STUDIENGANG ändert -> Automatisch passende PO suchen
            if (name === 'studiengangId') {
                newData.pruefungsordnungId = '';

                if (value) {
                    const relevantPos = pos.filter(p =>
                        p.studiengang && p.studiengang.id === parseInt(value)
                    );
                    if (relevantPos.length > 0) {
                        relevantPos.sort((a, b) => new Date(b.gueltigAb) - new Date(a.gueltigAb));
                        newData.pruefungsordnungId = relevantPos[0].id;
                    }
                }
            }

            return newData;
        });
    };

    // --- HANDLER FÜR STUDENTEN SUCHE ---
    const handleStudentSearchChange = (e) => {
        setStudentSearch(e.target.value);
        setShowStudentDropdown(true);
    };

    const selectStudent = (student) => {
        setFormData(prev => ({ ...prev, studierendenId: student.id }));
        setStudentSearch(`${student.vorname} ${student.nachname} (${student.matrikelnummer})`);
        setShowStudentDropdown(false);
    };

    const filteredStudents = students.filter(s => {
        const searchLower = studentSearch.toLowerCase();
        return (
            s.nachname.toLowerCase().includes(searchLower) ||
            s.vorname.toLowerCase().includes(searchLower) ||
            s.matrikelnummer.includes(searchLower)
        );
    });

    // --- SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            // Leere Strings zu null konvertieren für Backend
            studierendenId: formData.studierendenId || null,
            studiengangId: formData.studiengangId || null,
            pruefungsordnungId: formData.pruefungsordnungId || null,
            semesterId: formData.semesterId || null,
            erstprueferId: formData.erstprueferId || null,
            zweitprueferId: formData.zweitprueferId || null,
            anfangsdatum: formData.anfangsdatum || null,
            abgabedatum: formData.abgabedatum || null,
            kolloquiumsdatum: formData.kolloquiumsdatum || null,
            noteArbeit: formData.noteArbeit || null,
            noteKolloquium: formData.noteKolloquium || null
        };

        try {
            if (isEditMode) {
                await api.put(`/theses/${id}`, payload);
            } else {
                await api.post('/theses', payload);
            }
            navigate('/theses');
        } catch (err) {
            console.error(err);
            setError("Speichern fehlgeschlagen.");
        }
    };

    if (loading) return <div className="text-center mt-5">Laden...</div>;

    return (
        <div className="container form-container my-5">
            <h3 className="mb-4 fw-bold">{isEditMode ? 'Arbeit bearbeiten' : 'Neue Arbeit anlegen'}</h3>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} className="custom-card">

                {/* 1. ZEILE: Titel & Typ */}
                <div className="row mb-3">
                    <div className="col-md-8">
                        <label className="form-label">Titel der Arbeit</label>
                        <input
                            type="text"
                            className="form-control"
                            name="titel"
                            value={formData.titel}
                            onChange={handleChange}
                            required
                            placeholder="z.B. Entwicklung einer Web-App..."
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Art der Arbeit</label>
                        <select className="form-select" name="typ" value={formData.typ} onChange={handleChange}>
                            <option value="Bachelorarbeit">Bachelorarbeit</option>
                            <option value="Masterarbeit">Masterarbeit</option>
                            <option value="Projektarbeit">Projektarbeit</option>
                        </select>
                    </div>
                </div>

                {/* 2. ZEILE: Student & Status */}
                <div className="row mb-3">
                    <div className="col-md-6" ref={searchWrapperRef} style={{position: 'relative'}}>
                        <label className="form-label">Studierende/r</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">🔍</span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Name oder Matrikelnr. tippen..."
                                value={studentSearch}
                                onChange={handleStudentSearchChange}
                                onFocus={() => setShowStudentDropdown(true)}
                            />
                        </div>
                        {showStudentDropdown && (
                            <div className="list-group position-absolute w-100 shadow-sm" style={{zIndex: 1000, maxHeight: '200px', overflowY: 'auto'}}>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map(student => (
                                        <button type="button" key={student.id} className="list-group-item list-group-item-action" onClick={() => selectStudent(student)}>
                                            <strong>{student.nachname}, {student.vorname}</strong><br/>
                                            <small className="text-muted">{student.matrikelnummer}</small>
                                        </button>
                                    ))
                                ) : (
                                    <div className="list-group-item text-muted">Keine Ergebnisse</div>
                                )}
                            </div>
                        )}
                        {!formData.studierendenId && studentSearch && <small className="text-danger">Bitte wählen Sie einen Eintrag aus.</small>}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Aktueller Status</label>
                        <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                            <option value="in Planung">In Planung</option>
                            <option value="Angemeldet">Angemeldet</option>
                            <option value="in Bearbeitung">In Bearbeitung</option>
                            <option value="Kolloquium planen">Kolloquium planen</option>
                            <option value="abgeschlossen">Abgeschlossen</option>
                            <option value="Abbruch">Abbruch</option>
                        </select>
                    </div>
                </div>

                <hr className="my-4 text-muted" />

                {/* 3. ZEILE: Studiengang (Gefiltert) & PO (Auto) */}
                <div className="row mb-3">
                    <div className="col-md-4">
                        <label className="form-label">
                            Studiengang <small className="text-muted fw-normal">({formData.typ})</small>
                        </label>
                        <select
                            className="form-select"
                            name="studiengangId"
                            value={formData.studiengangId}
                            onChange={handleChange}
                        >
                            <option value="">Bitte wählen...</option>
                            {filteredStudiengaenge.map(sg => (
                                <option key={sg.id} value={sg.id}>{sg.bezeichnung} ({sg.abschluss})</option>
                            ))}
                        </select>
                        {filteredStudiengaenge.length === 0 && (
                            <small className="text-warning">Keine passenden Studiengänge gefunden.</small>
                        )}
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Prüfungsordnung</label>
                        <select className="form-select" name="pruefungsordnungId" value={formData.pruefungsordnungId} onChange={handleChange}>
                            <option value="">Bitte wählen...</option>
                            {pos.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.bezeichnung}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Semester</label>
                        <select className="form-select" name="semesterId" value={formData.semesterId} onChange={handleChange}>
                            <option value="">Bitte wählen...</option>
                            {semester.map(s => (
                                <option key={s.id} value={s.id}>{s.bezeichnung}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 4. ZEILE: Referenten */}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">Erstprüfer (Betreuer)</label>
                        <select className="form-select" name="erstprueferId" value={formData.erstprueferId} onChange={handleChange}>
                            <option value="">Keiner zugewiesen</option>
                            {betreuer.map(b => (
                                <option key={b.id} value={b.id}>{b.nachname}, {b.vorname} ({b.titel})</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Zweitprüfer</label>
                        <select className="form-select" name="zweitprueferId" value={formData.zweitprueferId} onChange={handleChange}>
                            <option value="">Keiner zugewiesen</option>
                            {betreuer.map(b => (
                                <option key={b.id} value={b.id}>{b.nachname}, {b.vorname} ({b.titel})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <hr className="my-4 text-muted" />

                {/* 5. ZEILE: Termine */}
                <div className="row mb-3">
                    <div className="col-md-4">
                        <label className="form-label">Startdatum</label>
                        <input type="date" className="form-control" name="anfangsdatum" value={formData.anfangsdatum} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Abgabedatum <small className="text-muted">(Automatik)</small></label>
                        <input type="date" className="form-control" name="abgabedatum" value={formData.abgabedatum} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Kolloquiumsdatum</label>
                        <input type="date" className="form-control" name="kolloquiumsdatum" value={formData.kolloquiumsdatum} onChange={handleChange} />
                    </div>
                </div>

                {/* 6. ZEILE: Noten */}
                <div className="row mb-4">
                    <div className="col-md-3">
                        <label className="form-label">Note (Arbeit)</label>
                        <input type="number" step="0.1" min="1.0" max="5.0" className="form-control" name="noteArbeit" value={formData.noteArbeit} onChange={handleChange} placeholder="z.B. 1.3" />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Note (Kolloquium)</label>
                        <input type="number" step="0.1" min="1.0" max="5.0" className="form-control" name="noteKolloquium" value={formData.noteKolloquium} onChange={handleChange} placeholder="z.B. 1.0" />
                    </div>
                </div>

                <div className="d-flex justify-content-end">
                    <button type="button" className="btn btn-secondary-custom me-2" onClick={() => navigate('/theses')}>Abbrechen</button>
                    <button type="submit" className="btn btn-primary-custom">Speichern</button>
                </div>
            </form>
        </div>
    );
};

export default ThesisForm;