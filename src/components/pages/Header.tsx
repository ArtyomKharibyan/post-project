import "../../index.css"

import {getAuth} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { UserAuth } from "../../context/UserAuthContext";
import DarkMode from "../darkMode/DarkMode";
import Loading from "../images/Loading.gif";
import { ReactComponent as OwoSVG } from "../images/Owl.svg";
import axiosInstance from "../server/axios";

const Header = () => {
  const {logOut, setIsAuth, isAuth, setProfileData} = UserAuth();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
	
  useEffect(() => {
    if (!isAuth && (location.pathname === "/profile" || location.pathname === "/posts" || location.pathname === "/feed")) {
      navigate("/guest");
    }
  }, [isAuth, navigate, location]);
	
  useEffect(() => {
    if (isAuth && (location.pathname === "/guest")) {
      navigate("/feed")
    }
  }, [isAuth])
	
  const handleLogOut = async () => {
    try {
      localStorage.removeItem("token");
      localStorage.setItem("selectedTheme", "light");
      document?.querySelector("body")?.setAttribute("data-theme", "light");
      await logOut();
      navigate("/signIn");
      setIsAuth(false);
    } catch (e) {
      if (e instanceof Error) {
        toast.error("Error logOut.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    }
  };
	
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/profile`);
        const data = response.data;
        setProfileData(data);
				
      } catch (error) {
        toast.error("Error getting profile data.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } finally {
        setIsLoading(false);
      }
    };
		
    fetchData();
		
  }, [setProfileData, auth]);
	
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <img src={Loading} alt="Loading..."/>
      </div>
    );
  }
	
  return (
    <div className="flex w-full border-b border-slate-300 items-center h-70">
      <Link to="/profile">
        <div className="icon heart group relative">
          <OwoSVG
            className="h-12 w-24 transition duration-300 ease-in-out transform origin-center group-hover:animate-bounce fill-current text-white"/>
        </div>
      </Link>
      <Link to={isAuth ? "/profile" : "/signUp"} className="text-lg font-brush-script text-slate-100">
				WebLab
      </Link>
      {!isLoading && (
        <div className="flex justify-center w-full">
          <div className="flex justify-end p-2 w-full text-center items-center text-slate-100">
            {isAuth ? (
              <>
                <DarkMode/>
                <Link to="/posts" className="p-2 text-sm font-semibold">
									Posts
                </Link>
                <Link to="/feed" className="p-2 text-sm font-semibold">
									Feed
                </Link>
                <Link to="/profile" className="p-2 text-sm font-semibold">
									Profile
                </Link>
                <button onClick={handleLogOut} className="border px-6 py-2 my-4 border-black">
									LogOut
                </button>
              </>
            ) : null}
            {!isAuth && (
              <>
                <Link to="/guest" className="p-2 text-sm font-semibold">
									Feed
                </Link>
                <Link to="/signUp" className="p-2 text-sm font-semibold">
                  <button className="border rounded-lg bg-sky-500 px-6 py-2 my-4 border-none">SignUp</button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;