import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {UserAuth} from "../../context/UserAuthContext";

const GoogleButton = () => {

    const navigate = useNavigate()
    const {googleSignIn, user} = UserAuth()

    const handleGoogleSignIn = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        try {
            await googleSignIn();
        } catch (error) {
            console.error(error);
        }
    };


    useEffect(() => {
        if (user !== null) {
            navigate("/Account")
        }
    }, [navigate, user])

    return (
        <div className = "p-5">
        <button onClick={handleGoogleSignIn} className="w-full flex text-center items-center justify-center h-12 bg-blue-500 rounded-md shadow-md relative cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 active:bg-blue-700">
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
