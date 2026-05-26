import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const tokenUser = localStorage.getItem('token');
    
    if (!tokenUser) {
        return <Navigate to="/auth" />;
    }
    
    return children;
};

export default ProtectedRoute;