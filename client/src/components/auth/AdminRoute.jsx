import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function AdminRoute({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!user.isAdmin) {
      navigate('/newevent'); // Redirect non-admin users to event creation page
    }
  }, [user, navigate]);

  if (!user || !user.isAdmin) {
    return null;
  }

  return <div>{children}</div>;
}
