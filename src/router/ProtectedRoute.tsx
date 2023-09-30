import React, { ReactNode, useEffect } from "react";
import { UserAuth } from "../context/UserAuthContext";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user } = UserAuth();

    useEffect(() => {
        if (!user) {
            console.log("stexica");
        }
    }, [user]);

    return <>{children}</>;
};

export default ProtectedRoute;
