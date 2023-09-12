import React from "react"
import {Route, Routes} from 'react-router-dom';
import SignUp from "../components/authentication/SignUp";
import SignIn from "../components/authentication/SignIn";
import App from "../App";
import ProtectedRoute from "./ProtectedRoute";
import Posts from "../components/Posts";

const Router = () => (
    <Routes>
        <Route path="/" element={<SignUp/>}/>
        <Route path="/SignUp" element={<SignUp/>}/>
        <Route path="/SignIn" element={<SignIn/>}/>
        <Route path="create-post" element={<Posts/>}/>
        <Route path = "/Account" element={<ProtectedRoute><App/></ProtectedRoute>}/>
    </Routes>
)

export default Router