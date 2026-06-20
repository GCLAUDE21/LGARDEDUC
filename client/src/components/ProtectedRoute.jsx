import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();

    if (user === undefined) return null; // encore en chargement
    if (!user) return <Navigate to="/auth" />;

    return children;
};

export default ProtectedRoute;