import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    
    if (!token) return <Navigate to="/auth" />;

    const decoded = jwtDecode(token);
    
    if (!decoded.admin) return <Navigate to="/" />;
    
    return children;
};

export default AdminRoute;