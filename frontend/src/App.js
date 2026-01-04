import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout'; // <--- Importieren
import ThesisList from './components/theses/ThesisList';
import ThesisForm from './components/theses/ThesisForm';
import StudentForm from './components/forms/StudentForm';
import BetreuerForm from './components/forms/BetreuerForm';
import DashboardHome from './components/dashboard/DashboardHome'; // <--- Importieren
import BetreuerList from './components/betreuer/BetreuerList';
import StudentList from './components/students/StudentList';
function App() {
    return (
        <Router>
            <Routes>
                {/* Alle Routen liegen jetzt innerhalb des Layouts */}
                <Route path="/" element={<Layout />}>

                    {/* Startseite ist jetzt die Liste, oder du änderst es zu DashboardHome */}
                    <Route index element={<ThesisList />} />

                    {/* Das neue Dashboard mit den Kacheln */}
                    <Route path="dashboard" element={<DashboardHome />} />

                    {/* Formulare */}
                    <Route path="new" element={<ThesisForm />} />
                    <Route path="edit/:id" element={<ThesisForm />} />
                    <Route path="create-student" element={<StudentForm />} />
                    <Route path="create-betreuer" element={<BetreuerForm />} />
                    <Route path="betreuer" element={<BetreuerList />} />
                    <Route path="students" element={<StudentList />} />

                </Route>
            </Routes>
        </Router>
    );
}

export default App;