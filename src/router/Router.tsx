import React from "react"
import {Route, Routes} from 'react-router-dom';
import SignUp from "../components/authentication/SignUp";
import SignIn from "../components/authentication/SignIn";
import App from "../App";
import ProtectedRoute from "./ProtectedRoute";
import CreatePost from "../components/pages/Posts";
import Feed from "../components/pages/Feed";
import NotFoundPage from "../components/notFound/NotFoundPage";
import Guest from "../components/pages/Guest";

const Router = () => {

    return (
        <Routes>
            <Route path="/" element={<SignUp/>}/>
            <Route path="/signUp" element={<SignUp/>}/>
            <Route path="/signIn" element={<SignIn/>}/>
            <Route path="/posts" element=<CreatePost/>/>
            <Route path="/feed" element={<Feed/>}/>
            <Route path="/guest" element={<Guest/>}/>
            <Route path="*" element={<NotFoundPage/>}/>
            <Route path="/profile" element={<ProtectedRoute><App/></ProtectedRoute>}/>
        </Routes>
    )
}

export default Router