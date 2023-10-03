import React, {useEffect, useState} from "react";
import { ReactComponent as OwoSVG } from "../images/Owl.svg";
import "../../index.css";
import { UserAuth } from "../../context/UserAuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "../server/axios";

interface UserProfile {
    id: number;
    authUserId: number;
    name: string;
    surname: string;
    email: string;
}


const Header = () => {
    const { logOut, setIsAuth, isAuth, profileData, setProfileData, user, setAsa, asa } = UserAuth();

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
        console.log(24791308892785491302587940, "GET");

        if (profileData && profileData.name && profileData.surname && profileData.email) {
            return;
        }

        onAuthStateChanged(auth, async (authUser) => {
            if (isAuth && authUser) {
                try {
                    const response = await axios.get(
                        "http://192.168.10.146:5000/api/profile"
                    );

                    if (response.status === 200) {
                        const data = response.data;
                        const profileDataWithId: UserProfile = {
                            id: data.id,
                            authUserId: data.authUserId,
                            name: data.name,
                            surname: data.surname,
                            email: data.email,
                        };

                        console.log(profileDataWithId)

                        setProfileData(data);
                        console.log("Profile Data:", data);
                    } else {
                        console.error("Error fetching profile data:", response.statusText);
                    }
                } catch (error) {
                    console.error("Network error:", error);
                }
            } else {
                console.log("User is signed out.");
            }
        });
    }, [auth, isAuth, profileData, setProfileData, setAsa]);

    console.log(profileData);
    console.log(asa)

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
                            <p className="p-2 relative text-slate-100">
                                {profileData?.email}
                            </p>
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
                            <button
                                onClick={handleLogOut}
                                className="border px-6 py-2 my-4 border-black"
                            >
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
                                <button className="border px-6 py-2 my-4 border-black">
                                    SignUp
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
