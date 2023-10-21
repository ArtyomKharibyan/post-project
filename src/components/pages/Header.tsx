import React, { useEffect, useState } from "react";
import { ReactComponent as OwoSVG } from "../images/Owl.svg";
import "../../index.css";
import { UserAuth } from "../../context/UserAuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "../server/axios";
import { Api_Url } from "../server/config";
import Loading from "../images/Loading.gif";

const Header = () => {
    const { logOut, setIsAuth, isAuth, profileData, setProfileData } = UserAuth();
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuth && (location.pathname === "/profile" || location.pathname === "/posts" || location.pathname === "/feed" )) {
            navigate("/guest");
        }
    }, [isAuth, navigate, location]);

    const handleLogOut = async () => {
        try {
            localStorage.removeItem("token");
            await logOut();
            navigate("/signIn");
            setIsAuth(false);
        } catch (e) {
            if (e instanceof Error) {
                console.log(e.message);
            }
        }
    };

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const response = await axios.get(`${Api_Url}/profile`);
                if (isMounted && response.status === 200) {
                    const data = response.data;
                    setProfileData(data);
                    console.log(profileData)
                } else if (isMounted) {
                    console.error("Error fetching profile data:", response.statusText);
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Network error:", error);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [setProfileData]);

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <img src={Loading} alt="Loading..." />
            </div>
        );
    }

    return (
        <div className="flex w-full border-b-2 border-black items-center h-70">
            {isAuth ? (
                <Link to="/profile">
                    <OwoSVG className="h-12 w-24" />
                </Link>
            ) : (
                <Link to="/signUp">
                    <OwoSVG className="h-12 w-24" />
                </Link>
            )}
            <Link to={isAuth ? "/profile" : "/signUp"} className="text-lg font-brush-script text-slate-100">
                WebLab
            </Link>
            {!isLoading && (
                <div className="flex justify-center w-full">
                    <div className="flex justify-end p-2 w-full text-center items-center text-slate-100">
                        {isAuth ? (
                            <>
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