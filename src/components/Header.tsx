import React, { useEffect } from "react";
import { ReactComponent as OwoSVG } from "./images/Owl.svg";
import "../index.css";
import { UserAuth } from "../context/UserAuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase authentication functions
import axios from "./server/Axios";

const Header = () => {
    const { logOut, setIsAuth, isAuth, profileData, setProfileData } = UserAuth();
    const auth = getAuth();
    const navigate = useNavigate();

    const handleLogOut = async () => {
        try {
            localStorage.removeItem("token");
            await logOut();
            navigate("/SignIn");
            setIsAuth(false);
        } catch (e) {
            if (e instanceof Error) {
                console.log(e.message);
            }
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(
                    "http://192.168.10.81:5000/api/profile"
                );

                if (response.status === 200) {
                    const data = response.data;
                    setProfileData(data);
                    console.log("Profile Data:", data);
                } else {
                    console.error("Error fetching profile data:", response.statusText);
                }
            } catch (error) {
                console.error("Network error:", error);
            }
        };

        fetchProfile();

        onAuthStateChanged(auth, (user) => {
            if (user) {
                const { displayName, email } = user;
                console.log("Firebase User Data:", displayName, email);
            } else {
                console.log("User is signed out.");
            }
        });
    }, [auth, setProfileData]);

    return (
        <div className="flex w-full border-b-2 border-black items-center h-70">
            <Link to="/profile">
                <OwoSVG className="h-12 w-24" />{" "}
            </Link>
            <Link to="/profile" className="text-lg font-brush-script text-slate-100">
                WebLab
            </Link>
            <div className="flex justify-center w-full">
                <div className="flex justify-end p-2 w-full text-center items-center text-slate-100">
                    <p className="p-2 relative text-slate-100">
                        {profileData?.email}
                    </p>
                    <p className="p-2 text-sm font-semibold text-slate-100">
                        {profileData?.name} {profileData?.surname}
                    </p>
                    <Link to="/feed" className="p-2 text-sm font-semibold">
                        Feeds
                    </Link>
                    {isAuth && (
                        <>
                            <Link to="/posts" className="p-2 text-sm font-semibold">
                                Posts
                            </Link>
                            <button
                                onClick={handleLogOut}
                                className="border px-6 py-2 my-4 border-black"
                            >
                                LogOut
                            </button>
                        </>
                    )}
                    {!isAuth && ( // Conditionally render the "SignUp" button when not authenticated
                        <Link to="/SignUp" className="p-2 text-sm font-semibold">
                            <button className="border px-6 py-2 my-4 border-black">
                                SignUp
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
