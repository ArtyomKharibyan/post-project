import React from "react"
import {Route, Routes} from 'react-router-dom';
import SignUp from "../components/authentication/SignUp";
import SignIn from "../components/authentication/SignIn";
import App from "../App";
import ProtectedRoute from "./ProtectedRoute";
import CreatePost from "../components/pages/CreatePost";
import Feed from "../components/pages/Feed";

const Router = () => {

        return (
        <Routes>
                <Route path="/" element={<SignUp/>}/>
                <Route path="/signUp" element={<SignUp/>}/>
                <Route path="/signIn" element={<SignIn/>}/>
                <Route path="/posts" element=<CreatePost/>/>
                <Route path="/feed" element={<Feed/>}/>
                <Route path="/profile" element={<ProtectedRoute><App/></ProtectedRoute>}/>
        </Routes>
)
}

export default Router