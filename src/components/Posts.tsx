import React, {useState} from "react"
import {addDoc, collection} from "firebase/firestore"
import {db,auth} from "../firebase/Firebase"
import {useNavigate} from "react-router-dom";

const authorName = auth.currentUser?.displayName || "Unknown User";
const authorId = auth.currentUser?.uid || "Unknown UID";

const Posts = () => {

const [title, setTitle] = useState("")
    const [postText, setPostText] = useState("")
    const navigate = useNavigate()

    const postCollectionRef = collection(db, "posts")

    const createPost = async () => {
        await addDoc(postCollectionRef, {
            title,
            postText,
            author: {name: authorName, id: authorId}
        })
        navigate("/Account")
    }

    return (
        <div className="w-full h-screen h-screen grid place-items-center ">
            <div className="w-96 h-auto p-7 bg-slate-900 rounded-xl text-slate-200 flex flex-col">
                <h1 className="text-4xl font-bold text-slate-100">Create A Post</h1>
                <div className="flex flex-col h-24 p-2">
                    <p className="flex justify-left text-white">Title:</p>
                    <input className = "rounded-md p-1"
                        placeholder="Title..."
                           onChange={(event) => {setPostText(event.target.value)}}
                    />
                </div>
                <div className="flex flex-col h-52">
                    <p className="flex justify-left text-white">Content:</p>
                    <textarea
                        onChange={(event) => {setTitle(event.target.value)}}
                        placeholder="Content..."
                        className="h-40 resize-none rounded-md"
                    />
                </div>
                <button onClick={createPost} className = "p-2 bg-blue-800">Submit Post</button>
            </div>
        </div>
    )
}

export default Posts
