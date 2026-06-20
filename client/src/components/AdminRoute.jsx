import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user } = useAuth();

    if (user === undefined) return null; // encore en chargement
    if (!user) return <Navigate to="/auth" />;
    if (!user.admin) return <Navigate to="/" />;

    return children;
};

export default AdminRoute;