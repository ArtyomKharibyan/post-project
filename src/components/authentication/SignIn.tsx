import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {UserAuth} from "../../context/UserAuthContext";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import GoogleButton from "./GoogleButton";

const SignIn = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const {signIn} = UserAuth();
	
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setError("");
    try {
      if (signIn) {
        await signIn(email, password);
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
        console.error(e.message);
        console.error(error);
      }
    }
  };
	
  useEffect(() => {
    const checkUser = (user: firebase.User | null) => {
      if (user) {
        user.getIdToken(true)
          .then((idToken: string) => {
            localStorage.setItem("token", idToken);
            navigate("/profile");
          })
          .catch((error) => {
            console.error(error);
          });
      }
    };
		
    const unsubscribe = firebase.auth().onAuthStateChanged(checkUser);
		
    return () => {
      unsubscribe();
    };
  }, []);
	
  return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <div className="w-96 h-600 p-5 relative border-2 border-right/50 text-center rounded-xl block bg-slate-100">
        <p className="font-brush-script text-4xl p-5">WebLab</p>
        <div className="grid grid-rows-[60px]">
          <p className="text-red-700">{error}</p>
          <input
            className="w-full px-5 py-3 my-2 border-box"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full px-5 py-3 my-2 border-box"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="w-full p-5">
            <button
              className="w-full bg-blue-500 text-white font-semibold rounded-md px-10 py-2 shadow-md hover:bg-blue-400 transition duration-400 ease-in-out"
              onClick={handleClick}>
							Sign in
            </button>
						
            <div className="flex justify-center items-center text-center p-4">
              <div className="bg-gray-300 h-px w-full"/>
              <p className="text-gray-500 p-3">OR</p>
              <div className="bg-gray-300 h-px w-full"/>
            </div>
						
            <GoogleButton
              additionalClassName="w-full bg-blue-500 flex text-center items-center justify-center h-12 rounded-md shadow-md relative cursor-pointer transition duration-300 ease-in-out"
              isSignUp={true}/>
          </div>
          <div>
						Don&rsquo;t have an account? <Link className="text-sky-500" to="/signUp">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
