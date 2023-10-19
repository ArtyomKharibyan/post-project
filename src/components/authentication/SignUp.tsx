import React, {ChangeEvent, useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {UserAuth} from "../../context/UserAuthContext";
import axios from '../server/axios';
import {updateProfile, UserCredential} from "firebase/auth";
import GoogleButton from "./GoogleButton"
import {Api_Url} from "../server/config";
import {storeTokenInLocalStorage} from "../../token/token";

interface InputFieldProps {
    placeholder: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type: string;
}

const InputField: React.FC<InputFieldProps> = ({placeholder, type, value, onChange}) => (
    <input
        className="w-full px-5 py-3 my-2 border-box"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
    />
);

const SignUp: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [surname, setSurname] = useState<string>("");
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();
    const {createUser, setProfileData} = UserAuth();

    const isSubmitDisabled: boolean = !(name.trim() !== "" && surname.trim() !== "" && email.trim() !== "" && password.trim() !== "");

    useEffect(() => {
        setError('');
    }, [name, surname, email, password]);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.post(`${Api_Url}/profile`, {name, surname, email})

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

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (createUser) {
                const userCredential: UserCredential = await createUser(email, password);
                const user = userCredential.user;

                const fullName: string = `${name} ${surname}`;
                await updateProfile(user, {displayName: fullName});

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full">
            <div className="w-96 h-600 p-5 relative border-2 border-right/50 text-center rounded-xl block bg-slate-100">
                <p className="font-brush-script text-4xl p-5">WebLab</p>
                <div className="grid grid-rows-[80px]">
                    <GoogleButton additionalClassName="bg-blue-500" isSignUp={true} />
                    <p className="text-red-700">{error}</p>
                    <div className="flex justify-center items-center text-center">
                        <div className="bg-gray-300 h-px w-full"/>
                        <p className="text-gray-500 p-3">OR</p>
                        <div className="bg-gray-300 h-px w-full"/>
                    </div>

                    <InputField placeholder="Name" type="text" value={name}
                                onChange={(e) => setName(e.target.value)}/>

                    <InputField placeholder="Surname" type="text" value={surname}
                                onChange={(e) => setSurname(e.target.value)}/>

                    <InputField placeholder="Email" type="email" value={email}
                                onChange={(e) => setEmail(e.target.value)}/>

                    <InputField placeholder="Password" type="password" value={password}
                                onChange={(e) => setPassword(e.target.value)}/>

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
