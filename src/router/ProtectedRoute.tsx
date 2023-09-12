import React, { ReactNode } from "react";
import { Navigate } from "react-router";
import { UserAuth } from "../context/UserAuthContext";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user } = UserAuth();

    if (!user) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
