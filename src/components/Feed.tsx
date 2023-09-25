import React, { useEffect, useState } from "react";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { auth, db } from "../firebase/Firebase";
import Header from "./Header";
import { UserAuth } from "../context/UserAuthContext";
import { AiFillDelete, AiFillSave, AiOutlineEdit } from "react-icons/ai";

interface Post {
    author: {
        name: string;
        id: string;
    };
    id: string;
    title: string;
    postText: string;
    images: string[];
    isEditing: boolean;
    comments: Comment[];
}

interface Comment {
    id: string;
    text: string;
    author: {
        id: string;
        name: string;
    };
    timestamp: any;
    postId: string;
}

const Feed = () => {
    const [postList, setPostList] = useState<Post[]>([]);
    const [newComments, setNewComments] = useState<string[]>([]);
    const [editedPost, setEditedPost] = useState<Post | null>(null); // State for the edited post
    const postsCollectionRef = collection(db, "posts");
    const commentsCollectionRef = collection(db, "comments");
    const isAuth = UserAuth();

    useEffect(() => {
        const getPosts = async () => {
            const data = await getDocs(postsCollectionRef);
            const posts = data.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
                isEditing: false,
                comments: [],
            })) as Post[] | any[];

            const initialNewComments = posts.map(() => "");
            setNewComments(initialNewComments);

            for (const post of posts) {
                const commentsQuery = query(
                    commentsCollectionRef,
                    where("postId", "==", post.id)
                );
                const commentsSnapshot = await getDocs(commentsQuery);
                post.comments = commentsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Comment[];
            }

            setPostList(posts as Post[]);
        };

        getPosts();
        console.log("Hello")
    }, []);

    const deletePost = async (id: string) => {
        const postDocRef = doc(db, "posts", id);
        await deleteDoc(postDocRef);

        setPostList((prevPosts) => prevPosts.filter((post) => post.id !== id));
    };

    const handleEditClick = (id: string) => {
        const postToEdit = postList.find((post) => post.id === id);

        if (postToEdit) {
            setEditedPost(postToEdit);
        } else {
            console.error("Post not found for editing");
        }
    };


    const handleSaveChanges = async () => {
        if (editedPost) {
            const updatedData = {
                title: editedPost.title,
                postText: editedPost.postText,
            };

            const postDocRef = doc(db, "posts", editedPost.id);
            await updateDoc(postDocRef, updatedData);

            setPostList((prevPosts) =>
                prevPosts.map((prevPost) =>
                    prevPost.id === editedPost.id ? { ...prevPost, ...updatedData } : prevPost
                )
            );

            setEditedPost(null);
        }
    };

    const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const updatedComments = [...newComments];
        updatedComments[index] = event.target.value;
        setNewComments(updatedComments);
    };

    const handleCommentSubmit = async (postId: string, index: number) => {
        const commentData: Comment = {
            text: newComments[index],
            author: {
                id: auth.currentUser?.uid || "",
                name: auth.currentUser?.displayName || "",
            },
            timestamp: serverTimestamp(),
            postId: postId,
            id: "",
        };

        await addDoc(commentsCollectionRef, commentData);

        setPostList((prevPosts) =>
            prevPosts.map((post, i) =>
                i === index
                    ? {
                        ...post,
                        comments: [...post.comments, commentData],
                    }
                    : post
            )
        );

        const updatedComments = [...newComments];
        updatedComments[index] = "";
        setNewComments(updatedComments);
    };

    return (
        <div>
            <Header />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {postList.map((post, index) => (
                    <div className="p-4 rounded-2xl bg-slate-200" key={post.id}>
                        <div className="flex items-center justify-between font-bold text-center">
                            {isAuth && auth.currentUser && post.author.id === auth.currentUser?.uid && (
                                <div className="flex items-center">
                                    {editedPost && editedPost.id === post.id ? (
                                        <button
                                            onClick={handleSaveChanges}
                                            className="hover:text-green-500"
                                        >
                                            <AiFillSave className="h-7 w-7" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleEditClick(post.id)}
                                            className="hover:text-blue-500"
                                        >
                                            <AiOutlineEdit className="h-7 w-7" />
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className="min-w-2xl p-2">
                                {editedPost && editedPost.id === post.id ? (
                                    <input
                                        className="border border-silver-300 rounded-md w-full p-2"
                                        placeholder="Change Title..."
                                        type="text"
                                        value={editedPost.title}
                                        onChange={(e) => {
                                            setEditedPost({
                                                ...editedPost,
                                                title: e.target.value,
                                            });
                                        }}
                                    />
                                ) : (
                                    post.title
                                )}
                            </div>
                            {isAuth && auth.currentUser && post.author.id === auth.currentUser?.uid && (
                                <button
                                    onClick={() => {
                                        deletePost(post.id);
                                        console.log("post.author.id:", post.author?.id);
                                        console.log("auth.currentUser?.uid:", auth.currentUser?.uid);
                                    }}
                                >
                                    <AiFillDelete className="h-7 w-7" />
                                </button>
                            )}
                        </div>
                        {editedPost && editedPost.id === post.id ? (
                            <div className="w-full p-3">
                                <input
                                    className="border border-silver-300 rounded-md w-full p-2"
                                    placeholder="Change Post Text..."
                                    type="text"
                                    value={editedPost.postText}
                                    onChange={(e) => {
                                        setEditedPost({
                                            ...editedPost,
                                            postText: e.target.value,
                                        });
                                    }}
                                />
                            </div>
                        ) : (
                            <div>
                                {post.images.map((image) => (
                                    <div key={image}>
                                        <img className="w-full h-96" src={image} alt="" />
                                    </div>
                                ))}
                                <p className="p-2 min-w-2xl font-medium flex text-center justify-center">
                                    {post.postText}
                                </p>
                                <div className="bg-gray-400 h-px w-full" />
                            </div>
                        )}

                            {post.comments.map((comment, index) => (
                                <div key={index}>
                                    <p className="font-semibold">{comment.author.name}</p>
                                    <p className="p-3 bg-slate-50 text-slate-950">{comment.text}</p>
                                </div>
                            ))}
                            {isAuth && (
                                <div className="flex p-1">
                                    <input
                                        className="w-full relative right-2 rounded-md border border-siver-300 p-1"
                                        type="text"
                                        placeholder="Enter your comment"
                                        value={newComments[index]}
                                        onChange={(e) => handleCommentChange(e, index)}
                                    />
                                    {newComments[index].trim().length > 0 ? (
                                        <button className="bg-blue-500 text-white w-60 p-2" onClick={() => handleCommentSubmit(post.id, index)}>
                                            Submit Comment
                                        </button>
                                    ) : null}
                                </div>
                            )}

                            <div className="font-semibold">@{post.author.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feed;
