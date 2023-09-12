import React, { useState } from "react";
import GoogleButton from "./GoogleButton";
import {Link, useNavigate} from "react-router-dom";
import { UserAuth } from "../../context/UserAuthContext";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate()

    const {createUser} = UserAuth();

    const handleClick = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
        setError("");
        try {
            if (createUser) {
                await createUser(email, password);
                navigate("/Account")
            } else {
                setError("createUser function is undefined");
            }
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
                console.log(e.message);
                console.log(error);
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full bg-slate-100">
            <div
                className="w-96 h-600 p-5 relative bg-transparent border-2 border-right/50 text-center rounded-xl block bg-slate-50">
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
                    />
                    <input
                        className="w-full px-5 py-3 my-2 border-box"
                        type="text"
                        placeholder="Surname"
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
                            className=" w-full bg-blue-500 text-white font-semibold rounded-md px-10 py-2 shadow-md hover:bg-blue-400 transition duration-400 ease-in-out">
                            Sign up
                        </button>
                    </div>
                    <div className="">
                        Already have an account? <Link className="text-sky-500" to="/SignIn">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
