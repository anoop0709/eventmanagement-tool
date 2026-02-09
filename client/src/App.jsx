import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardPage from './pages/dashboard/DashboardPage';
import LoginPage from './pages/login/LoginPage';
import CreateEventPage from './pages/newevent/CreateEventPage';
import UpdateDetailsPage from './pages/neweventdetails/UpdateDetailsPage';
import EventsPage from './pages/events/EventsPage';
import EventViewPage from './pages/events/EventViewPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/view/:id" element={<EventViewPage />} />
        <Route path="/newevent" element={<CreateEventPage />} />
        <Route path="/newevent/update-details" element={<UpdateDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
