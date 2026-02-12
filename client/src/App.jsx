import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { Snackbar } from './components/ui/snackbar/Snackbar';
import { useSnackbar } from './context/SnackbarContext';
import DashboardPage from './pages/dashboard/DashboardPage';
import LoginPage from './pages/login/LoginPage';
import CreateEventPage from './pages/newevent/CreateEventPage';
import EventsPage from './pages/events/EventsPage';
import EventViewPage from './pages/events/EventViewPage';
import CatalogPage from './pages/catalog/CatalogPage';

function AppContent() {
  const { snackbar, hideSnackbar } = useSnackbar();

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/view/:id" element={<EventViewPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/newevent" element={<CreateEventPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        isOpen={snackbar.isOpen}
        onClose={hideSnackbar}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <AppContent />
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
