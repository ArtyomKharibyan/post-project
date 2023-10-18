import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/UserAuthContext";
import axios from '../server/axios';
import { Api_Url } from "../server/config";
import firebase from "firebase/compat";
import "firebase/compat/auth";

const GoogleButton = () => {
    const navigate = useNavigate();
    const { googleSignIn, user } = UserAuth();

    const handleGoogleSignIn = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        try {
            // @ts-ignore
            const userCredential: firebase.auth.UserCredential = await googleSignIn();

            if (userCredential?.user) {
                await storeTokenInLocalStorage(userCredential);

                const fullName = userCredential.user.displayName || "";
                const wordsArray = fullName.split(" ");
                const name = wordsArray[0] || "";
                const surname = wordsArray.slice(1).join(" ") || "";

                const email = userCredential.user.email || "";

                const userData = {
                    name: name,
                    surname: surname,
                    email: email,
                };

                await axios.post(`${Api_Url}/profile`, userData);

                navigate("/profile");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const storeTokenInLocalStorage = async (userCredential: firebase.auth.UserCredential) => {
        try {
            const idToken = await userCredential.user?.getIdToken(true) || "";
            localStorage.setItem("token", idToken);
            return idToken;
        } catch (error) {
            console.error('Error storing token in localStorage:', error);
            return "";
        }
    };

    useEffect(() => {
        if (user !== null) {
            navigate("/profile");
        }
    }, [navigate, user]);

    return (
        <div className="p-5">
            <button
                onClick={handleGoogleSignIn}
                className="w-full flex text-center items-center justify-center h-12 bg-blue-500 rounded-md shadow-md relative cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 active:bg-blue-700"
            >
                <div className="absolute top-1 left-1 w-10 h-10 bg-white rounded-md flex items-center justify-center">
                    <img
                        className="w-6 h-6 relative"
                        src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                        alt="Google Icon"
                    />
                </div>
                <p className="text-white text-sm font-roboto font-semibold mt-1 ml-8 relative bottom-1">
                    Sign in with Google
                </p>
            </button>
        </div>
    );
};

export default GoogleButton;
