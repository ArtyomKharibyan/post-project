import React from "react"
import { useLocation } from "react-router";
import { Route, Routes } from 'react-router-dom';

import App from "../App";
import SignIn from "../components/authentication/SignIn";
import SignUp from "../components/authentication/SignUp";
import NotFoundPage from "../components/notFound/NotFoundPage";
import Feed from "../components/pages/Feed";
import Guest from "../components/pages/Guest";
import Header from "../components/pages/Header";
import CreatePost from "../components/pages/Posts";
import ProtectedRoute from "./ProtectedRoute";

const Router = () => {

  const location = useLocation();
  const isHeaderVisible = !["/signIn", "/signUp", "/"].includes(location.pathname);


  return (
    <>
      {isHeaderVisible && <Header/>}
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
    </>
  )
}

export default Router