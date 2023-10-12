import React, { useEffect, useState } from "react";
import { ReactComponent as OwoSVG } from "../images/Owl.svg";
import "../../index.css";
import { UserAuth } from "../../context/UserAuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import axios from "../server/axios";
import { Api_Url } from "../server/config";
import Loading from "../images/Loading.gif";

const Header = () => {
    const { logOut, setIsAuth, isAuth, profileData, setProfileData, user } = UserAuth();
    const [isLoading, setIsLoading] = useState(true);

    const auth = getAuth();
    const navigate = useNavigate();

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
            setIsLoading(true);
            try {
                const response = await axios.get(`${Api_Url}/profile`);
                if (isMounted && response.status === 200) {
                    const data = response.data;
                    setProfileData(data);
                    console.log("Profile Data:", data);
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

        if (isAuth && (!profileData || !profileData.name || !profileData.surname || !profileData.email)) {
            fetchData();
        } else {
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [isAuth, auth, profileData, setProfileData]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth.currentUser;
                // @ts-ignore
                setProfileData({
                    name: user?.displayName ?? "",
                    email: user?.email ?? "",
                });
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, [setProfileData, auth]);

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
                        {user?.providerData[0]?.providerId === "google.com" ? (
                            <div>
                                <p className="p-2 relative text-slate-100">
                                    {user.displayName} {user.email}
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="p-2 relative text-slate-100">{profileData?.email}</p>
                                <p className="p-2 text-sm font-semibold text-slate-100">
                                    {profileData?.name} {profileData?.surname}
                                </p>
                            </>
                        )}
                        {isAuth ? (
                            <>
                                <Link to="/posts" className="p-2 text-sm font-semibold">
                                    Posts
                                </Link>
                                <Link to="/feed" className="p-2 text-sm font-semibold">
                                    Feed
                                </Link>
                                <button onClick={handleLogOut} className="border px-6 py-2 my-4 border-black">
                                    LogOut
                                </button>
                            </>
                        ) : null}
                        {!isAuth && (
                            <>
                                <Link to="/feed" className="p-2 text-sm font-semibold">
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
