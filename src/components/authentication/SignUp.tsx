import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/UserAuthContext";
import axios from '../server/axios';
import { updateProfile, UserCredential} from "firebase/auth";
import {collection, doc, setDoc} from "firebase/firestore";
import GoogleButton from "./GoogleButton"
import {db} from "../../firebase/firebase";
import {Api_Url} from "../server/config";

const SignUp = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [error, setError] = useState("");
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
    const navigate = useNavigate();
    const {createUser, setProfileData} = UserAuth();

    useEffect(() => {
        setIsSubmitDisabled(!(name.trim() !== "" && surname.trim() !== "" && email.trim() !== "" && password.trim() !== ""));
    }, [name, surname, email, password]);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.post(`${Api_Url}/profile`, {
                name,
                surname,
                email
            });

            console.log(response)

            if (response.status === 200) {
                const userData = response.data;
                setProfileData(userData);
                return response;
            } else {
                console.error('Error fetching user profile:', response.statusText);
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };

    const storeTokenInLocalStorage = async (userCredential: UserCredential) => {
        try {
            const idToken = await userCredential.user.getIdToken(true);
            localStorage.setItem("token", idToken);
            return idToken
        } catch (error) {
            console.error('Error storing token in localStorage:', error);
        }
    };

    const handleClick = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (createUser) {
                const userCredential = await createUser(email, password);
                const user = userCredential.user;

                const fullName = `${name} ${surname}`;
                await updateProfile(user, { displayName: fullName });

                const usersCollectionRef = collection(db, 'users');
                const userDocRef = doc(usersCollectionRef, user.uid);
                await setDoc(userDocRef, { name, surname });

                const IdToken = await storeTokenInLocalStorage(userCredential);

                // @ts-ignore
                await fetchUserProfile(IdToken);

                navigate('/profile');
            } else {
                setError('createUser function is undefined');
            }
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
                console.error(e.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full">
            <div
                className="w-96 h-600 p-5 relative border-2 border-right/50 text-center rounded-xl block bg-slate-100">
                <p className="font-brush-script text-4xl p-5">WebLab</p>
                <div className="grid grid-rows-[80px]">
                    <GoogleButton/>
                    <p className = "text-red-700">{error}</p>
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
                        <button
                            onClick={handleClick}
                            disabled={isSubmitDisabled || loading}
                            className={`w-full bg-blue-500 text-white font-semibold rounded-md px-10 py-2 shadow-md hover:bg-blue-400 transition duration-400 ease-in-out ${isSubmitDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            {loading ? "Signing Up..." : "Sign up"}
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
