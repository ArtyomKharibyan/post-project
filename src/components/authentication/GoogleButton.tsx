import React from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/UserAuthContext";
import "firebase/compat/auth";
import {UserCredential} from "firebase/auth";
import {storeTokenInLocalStorage} from "../../token/token";
import axios from "../server/axios";
import {Api_Url} from "../server/config";

type Props = {
    additionalClassName?: string;
    isSignUp?: boolean;
}

const GoogleButton = ({additionalClassName = '', isSignUp = false}: Props) => {
    const navigate = useNavigate();
    const { googleSignIn } = UserAuth();

    const handleGoogleSignIn = async () => {
        try {
            const userCredential: UserCredential = await googleSignIn();

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

                if (isSignUp) {
                    await axios.post(`${Api_Url}/profile`, userData);
                }

                navigate("/profile");
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="p-5">
            <button
                onClick={handleGoogleSignIn}
                className={`w-full bg-blue-500 flex text-center items-center justify-center h-12 rounded-md shadow-md relative cursor-pointer transition duration-300 ease-in-out ${additionalClassName}`}
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
