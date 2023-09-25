import React, { useEffect, useState } from "react";
import {
    getDownloadURL,
    ref,
    uploadBytes,
} from "firebase/storage";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, storage } from "../firebase/Firebase";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import firebase from "firebase/compat";
import axios from "./server/Axios";
import { UserAuth } from "../context/UserAuthContext";

interface Post {
    id: string;
    title: string;
    postText: string;
    author: {
        name: string | null;
        id: string | null;
    };
    images: string[];
}

interface UserData {
    username: string;
    password: string;
    prevState: null
}

type AuthStateChangedCallback = (user: firebase.User | null) => void;

const Modal: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [postText, setPostText] = useState<string>("");
    const [imageUpload, setImageUpload] = useState<File | null>(null);
    const [user, setUser] = useState<UserData | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(
        localStorage.getItem("imageUrl") || null
    );
    const [posts, setPosts] = useState<Post[]>([]);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    const { profileData, setProfileData } = UserAuth();
    const profileId = profileData?.id ?? "";

    const navigate = useNavigate();

    const uploadFile = async () => {
        setLoading(true);
        if (imageUpload === null) return;
        const imageRef = ref(storage, `images/${imageUpload.name}`);
        await uploadBytes(imageRef, imageUpload);
        const url = await getDownloadURL(imageRef);
        setImageUrl(url);
        setLoading(false);
        localStorage.setItem("imageUrl", url);
    };

    const postCollectionRef = collection(db, "posts");

    const fetchPosts = async () => {
        if (!auth.currentUser) return;

        const userUID = auth.currentUser.uid;
        const postsQuery = query(
            collection(db, "posts"),
            where("author.id", "==", userUID)
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsData: Post[] = [];
        postsSnapshot.forEach((doc) => {
            const postData = doc.data() as Post;
            postData.id = doc.id;
            postsData.push(postData);
        });
        setPosts(postsData);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const postToServer = async () => {
        try {
            const response = await axios.post(
                "http://192.168.10.81:5000/api/post",
                {
                    title,
                    imageUrl,
                    postText,
                    profileId: profileId,
                }
            );

            console.log(response);

            if (response.status === 200) {
                const userData = response.data;
                console.log("User Post Data:", userData);
                console.log(userData.title);

                if (userData.profileData && userData.profileData.id) {
                    setProfileData({
                        id: userData.profileData.id,
                        email: userData.profileData.email || "",
                        name: userData.profileData.name || "",
                        surname: userData.profileData.surname || "",
                    });
                }

                return response;
            } else {
                console.error("Error fetching user profile:", response.statusText);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(
                `http://192.168.10.81:5000/api/post${profileId}`,
                {
                    params: {
                        title,
                        imageUrl,
                        postText,
                        profileId: profileId,
                    },
                }
            );

            if (response.status === 200) {
                const postData = response.data;
                console.log("Fetched Post Data:", postData);

                return postData;
            } else {
                console.error("Error fetching data:", response.statusText);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    const createPost = async () => {
        await uploadFile();
        await fetchData();
        await postToServer();

        const postData: Post = {
            id: "",
            title,
            postText,
            author: {
                name: auth.currentUser?.displayName || null,
                id: auth.currentUser?.uid || null,
            },
            images: imageUrl ? [imageUrl] : [],
        };

        try {
            const docRef = await addDoc(postCollectionRef, postData);
            setLoading(false);
            console.log("Document written with ID: ", docRef.id);
            postData.id = docRef.id;
        } catch (error) {
            console.error("Error adding document: ", error);
        }

        setPosts((prevPosts: Post[]) => [...prevPosts, postData]);
        navigate("/posts");
        setShowModal(false);
    };

    const authStateChanged: AuthStateChangedCallback = (user) => {
        if (user) {
            const userData: UserData = {
                username: user.displayName || "",
                password: "",
                prevState: null,
            };
            setUser(userData);
            fetchPosts();
        } else {
            setPosts([]);
        }
    };

    useEffect(() => {
        // @ts-ignore
        const unsubscribe = onAuthStateChanged(auth, authStateChanged);
        return () => {
            unsubscribe();
        };
    }, []);


    const handleChooseFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleConfirmSelection = () => {
        if (imageUpload) {
            uploadFile();
        }
    };

    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageUrl(null);
            setImageUpload(file);
            setImageUrl(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setImageUpload(null);
        setImageUrl(null);
    };

    const handleDeletePost = async (postToDelete: Post) => {
        try {
            await deleteDoc(doc(db, "posts", postToDelete.id));
            setPosts((prevPosts) =>
                prevPosts.filter((post) => post.id !== postToDelete.id)
            );
        } catch (error) {
            console.error("Error deleting post: ", error);
        }
    };

    const handleEditPost = (postToEdit: Post) => {
        setEditingPost(postToEdit);
    };

    const resetForm = () => {
        setTitle("");
        setPostText("");
        setImageUpload(null);
        setImageUrl(null);
    };

    const openCreatePostModal = () => {
        resetForm();
        setShowModal(true);
    };

    const handleSubmitEdit = async () => {
        if (!editingPost) return;

        try {
            const postDocRef = doc(db, "posts", editingPost.id);
            await updateDoc(postDocRef, {
                title: editingPost.title,
                postText: editingPost.postText,
                images: editingPost.images,
            });

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === editingPost.id
                        ? {
                            ...post,
                            title: editingPost.title,
                            postText: editingPost.postText,
                            images: editingPost.images,
                        }
                        : post
                )
            );

            setEditingPost(null);
        } catch (error) {
            console.error("Error editing post: ", error);
        }
    };

    useEffect(() => {
        console.log(posts);
    }, [posts]);

    return (
        <div>
            <Header />
            {loading && <div>Loading...</div>}
            <div>
                <div className="flex justify-center items-center">
                    <button
                        className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 h-full"
                        type="button"
                        onClick={() => openCreatePostModal()}
                    >
                        Open Create Post Modal
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                    {posts.map((post, index) => (
                        <div
                            key={index}
                            className="border border-gray-300 border-none my-4 bg-slate-100 rounded-2xl"
                        >
                            <div>
                                {post.images.map((image, imgIndex) => (
                                    <img
                                        key={imgIndex}
                                        src={image}
                                        alt={`${imgIndex}`}
                                        className="w-full h-80 rounded-tl-2xl rounded-tr-2xl"
                                    />
                                ))}
                            </div>
                            <div className="min-w-2xl p-2">
                                <p className="text-xl font-semibold mt-4">{post.title}</p>
                                <div className="text-center p-5 text-gray-600 overflow-hidden">
                                    {post.postText}
                                </div>
                            </div>
                            <div className="bg-gray-300 h-px w-full mt-4" />
                            <div className="mt-4 relative bottom-2 left-2">
                                <button
                                    onClick={() => handleDeletePost(post)}
                                    className="mr-2 bg-red-500 text-white px-2 py-1 rounded"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => handleEditPost(post)}
                                    className="bg-blue-500 text-white px-2 py-1 rounded"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {showModal && (
                <div
                    className="justify-center items-center flex fixed inset-0 z-50 outline-none outline-none overflow-y-auto max-h-screen"
                >
                    <div className="relative w-auto my-6 mx-auto max-w-3xl">
                        <div
                            className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none"
                        >
                            <div
                                className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t"
                            >
                                <h3 className="text-3xl font-semibold">Create Post</h3>
                            </div>
                            <div className="overflow-y-auto overflow-x-hidden relative p-6 h-96">
                                <div className="flex flex-col">
                                    <div className="flex flex-col h-24 p-1">
                                        <input
                                            className="border-2 border-silver rounded-md p-1 z-0"
                                            placeholder="Title..."
                                            value={title}
                                            onChange={(event) => {
                                                setTitle(event.target.value);
                                            }}
                                        />
                                    </div>
                                    <div className="w-full max-h-[300px] overflow-y-auto">
                                        <input
                                            className="overflow-x-hidden flex justify-center items-center overflow-y-auto"
                                            type="file"
                                            ref={fileInputRef}
                                            key={imageUrl || undefined}
                                            onChange={handleImageChange}
                                            style={{ display: "none" }}
                                        />
                                        {imageUrl && (
                                            <div className="relative">
                                                <img
                                                    className="w-96 h-96"
                                                    src={imageUrl}
                                                    alt="Selected"
                                                />
                                                <button
                                                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full"
                                                    onClick={clearImage}
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between">
                                        <button
                                            onClick={handleChooseFile}
                                            className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        >
                                            Choose File
                                        </button>
                                        <button
                                            onClick={handleConfirmSelection}
                                            className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        >
                                            Confirm Selection
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col h-52">
                                    <p className="flex justify-left text-white">Content:</p>
                                    <textarea
                                        value={postText}
                                        onChange={(event) => {
                                            setPostText(event.target.value);
                                        }}
                                        placeholder="Content..."
                                        className="border-2 border-silver rounded-sm h-40 resize-none rounded-md"
                                    />
                                </div>
                            </div>
                            <div
                                className="flex items-center justify-between p-6 border-t border-solid border-slate-200 rounded-b"
                            >
                                <button
                                    className="text-slate-100 bg-red-600 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                    type="button"
                                    onClick={() => {
                                        createPost();
                                    }}
                                >
                                    Submit Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {editingPost && (
                <div className="fixed inset-0 flex justify-center items-center">
                    <div className="grid bg-white p-4 shadow-lg rounded-lg h-96 w-96">
                        <h2 className="text-2xl font-semibold h-10">Edit Post</h2>
                        <input
                            placeholder="Title..."
                            className="h-8 border border-silver-300 rounded-md"
                            type="text"
                            value={editingPost.title}
                            onChange={(e) =>
                                setEditingPost({ ...editingPost, title: e.target.value })
                            }
                        />
                        <textarea
                            placeholder="PostText..."
                            className="resize-none border border-silver-300 h-24 rounded-md"
                            value={editingPost.postText}
                            onChange={(e) =>
                                setEditingPost({ ...editingPost, postText: e.target.value })
                            }
                        />
                        <div className=" p-10 grid justify-center items-center w-full">
                            <button
                                className=" bg-blue-500 text-white w-32 p-2"
                                onClick={handleSubmitEdit}
                            >
                                Save
                            </button>
                            <button
                                className=" bg-red-500 text-white w-32 p-2"
                                onClick={() => setEditingPost(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Modal;
