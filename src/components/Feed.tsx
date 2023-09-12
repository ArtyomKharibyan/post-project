import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/Firebase";

interface FeedProps {
    onSelectPost: (post: { id: string; title: string; postText: string }) => void;
}

const Feed: React.FC<FeedProps> = ({ onSelectPost }) => {
    const [postList, setPostList] = useState<{ id: string; title: string; postText: string }[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const postsCollectionRef = collection(db, "posts");

    const handleClick = (post: { id: string; title: string; postText: string }) => {
        setSelectedChat(post.id);
        onSelectPost(post);
    }

    useEffect(() => {
        const getPosts = async () => {
            try {
                const data = await getDocs(postsCollectionRef);
                const postsData = data.docs.map((doc) => ({
                    id: doc.id,
                    title: doc.data().title || "",
                    postText: doc.data().postText || "",
                }));
                setPostList(postsData);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };
        getPosts();
    }, []);

    return (
        <div className="w-72 h-screen border-r-2 border-solid border-silver">
            {postList.map((post) => (
                <div
                    onClick={() => handleClick(post)}
                    className={`w-full p-3 flex flex-col-reverse hover:bg-slate-300 cursor-pointer ${
                        selectedChat === post.id ? "bg-blue-100" : ""
                    }`}
                    key={post.id}
                >
                    <div className="text-inherit text-slate-800 overflow-hidden whitespace-nowrap overflow-ellipsis">{post.title}</div>
                    <div className="font-semibold ">{post.postText}</div>
                </div>
            ))}
        </div>
    );
}

export default Feed;
