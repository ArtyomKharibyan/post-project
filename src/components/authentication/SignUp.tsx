import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/UserAuthContext";
import { db } from "../../firebase/Firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import axios from '../server/Axios';
import GoogleButton from "./GoogleButton";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [error, setError] = useState("");
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
    const navigate = useNavigate();
    const { createUser, profileData, setProfileData } = UserAuth();

    const validateFields = () => {
        const isValid = name.trim() !== "" && surname.trim() !== "" && email.trim() !== "" && password.trim() !== "";
        setIsSubmitDisabled(!isValid);
    };

    useEffect(() => {
        validateFields();
    }, [name, surname, email, password]);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.post("http://192.168.10.146:5000/api/profile", {
                name,
                surname,
                email
            });

            if (response.status === 200) {
                const userData = response.data;
                setProfileData(userData);
                return response;
            }
            else {
                console.error('Error fetching user profile:', response.statusText);
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };

    const storeTokenInLocalStorage = async (userCredential: firebase.auth.UserCredential) => {
        try {
            // @ts-ignore
            const idToken = await userCredential.user.getIdToken(true);
            localStorage.setItem("token", idToken);
        } catch (error) {
            console.error('Error storing token in localStorage:', error);
        }
    };

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setError('');

        try {
            if (createUser) {
                const userCredential = await createUser(email, password);

                const uid = userCredential.user.uid;

                const fullName = `${name} ${surname}`;

                const user = {
                    name,
                    surname,
                    email,
                };

                await updateProfile(userCredential.user, {
                    displayName: fullName,
                });

                const usersCollectionRef = collection(db, 'users');
                const userDocRef = doc(usersCollectionRef, uid);
                await setDoc(userDocRef, { name, surname });

                // @ts-ignore
                await storeTokenInLocalStorage(userCredential);

                await fetchUserProfile();

                navigate('/profile');
            } else {
                setError('createUser function is undefined');
            }
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
                console.error(e.message);
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full">
            <div
                className="w-96 h-600 p-5 relative border-2 border-right/50 text-center rounded-xl block bg-slate-100">
                <p className="font-brush-script text-4xl p-5">WebLab</p>
                <div className="grid grid-rows-[80px]">
                    <GoogleButton/>

                    <div className="flex justify-center items-center text-center">
                        <div className="bg-gray-300 h-px w-full"/>
                        <p className="text-gray-500 p-3">OR</p>
                        <div className="bg-gray-300 h-px w-full"/>
                    </div>

                    <input
                        className="w-full px-5 py-3 my-2 border-box"
                        type="text"
                        placeholder="Name"
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        className="w-full px-5 py-3 my-2 border-box"
                        type="text"
                        placeholder="Surname"
                        onChange={(e) => setSurname(e.target.value)}
                    />
                    <input
                        className="w-full px-5 py-3 my-2 border-box"
                        type="email"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="w-full px-5 py-3 my-2 border-box"
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="w-full p-4">
                        <button onClick={handleClick}
                                disabled={isSubmitDisabled} // Disable the button when required fields are empty
                                className={`w-full bg-blue-500 text-white font-semibold rounded-md px-10 py-2 shadow-md hover:bg-blue-400 transition duration-400 ease-in-out ${isSubmitDisabled ? 'cursor-not-allowed opacity-50' : ''}`}>
                            Sign up
                        </button>
                    </div>
                    <div>
                        Already have an account? <Link className="text-sky-500" to="/SignIn">Sign In</Link>
                        <br/>
                        Login as <Link className="text-sky-500" to={"/feed"}>Guest</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
