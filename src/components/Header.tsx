import React from "react"
import { ReactComponent as OwoSVG } from "./images/Owl.svg";
import '../index.css';
import {UserAuth} from "../context/UserAuthContext";
import {useNavigate} from "react-router-dom";
import {Link} from "react-router-dom";

const Header = () => {

    const {logOut} = UserAuth()

    const navigate = useNavigate()

    const handleLogOut = async () => {
        try {
            await logOut()
            navigate("/SignIn")
        } catch(e) {
            if (e instanceof Error) {
                console.log(e.message);
            }
        }
    }

    return (
        <div className="flex w-full border-b-2 border-silver items-center h-70">
            <OwoSVG className="logo" />
            <h3 className="text-lg font-brush-script text-black">WebLab</h3>
            <div className="post">
                <div className = "flex justify-around w-1/4 text-center items-center">
                    <Link to="/create-post" className="text-sm font-semibold">Create Post</Link>
                    <button onClick={handleLogOut} className = "border px-6 py-2 my-4">LogOut</button>
                </div>
            </div>
        </div>
    )
}

export default Header
