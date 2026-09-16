import { Navigate } from "react-router-dom";
import type {ReactNode} from "react";

type ProtectedRouteProps = {
    children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const token = localStorage.getItem("access_token");

    if (token) {
        return children
    } 
    else {
        return <Navigate to="/login" />
    }
}