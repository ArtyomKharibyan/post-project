import React, { ReactNode, useEffect } from "react";
import { UserAuth } from "../context/UserAuthContext";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    return <>{children}</>;
};

export default ProtectedRoute;
