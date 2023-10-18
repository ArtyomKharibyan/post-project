import React, {useCallback, useEffect, useState} from "react";
import {getDownloadURL, ref, uploadBytes,} from "firebase/storage";
import {onAuthStateChanged} from 'firebase/auth';
import {auth, storage} from "../../firebase/firebase";
import {useNavigate} from "react-router-dom";
import Header from "./Header";
import firebase from "firebase/compat";
import axios from "../server/axios";
import {UserAuth} from "../../context/UserAuthContext";
import {Api_Url} from "../server/config"
import EditPost from "../shallow/EditPost";
import Notification from "../notification/Notification";

interface Post {
    id: number;
    imageUrl: string;
    postText: string;
    title: string;
    profileId?: number;
    name?: string;
    surname?: string;
    comment?: Comment[];
}

interface Comment {
    id: number;
    text: string;
    profileId: number;
    postId: number;
    userName?: string;
    userSurname?: string;
}


interface UserData {
    username: string;
}

type AuthStateChangedCallback = (user: firebase.User | null) => void;

const Modal: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState<string>("");
    const [postText, setPostText] = useState<string>("");
    const [user, setUser] = useState<UserData | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [postData, setPostData] = useState<Post[]>([]);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(editingPost?.imageUrl || null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isUploading, setIsUploading] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
    const [showNotification, setShowNotification] = useState(false);

    const {profileData} = UserAuth();
    const profileId = profileData?.id ?? "";

    const navigate = useNavigate();

    const postToServer = async () => {
        try {
            const response = await axios.post(
                `${Api_Url}/post`,
                {
                    title,
                    imageUrl: imageUrl,
                    postText,
                    profileId: profileId,
                }
            );

            if (response.status === 200) {
                return response;
            } else {
                console.error("Error fetching user profile:", response.statusText);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    const handleScroll = useCallback(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop;
        const clientHeight = document.documentElement.clientHeight;

        if (scrollTop + clientHeight >= scrollHeight - 200) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    const getPost = useCallback(async (isFetch?: boolean) => {
        try {
            if (profileId) {
                const response = await axios.get(`${Api_Url}/post/${profileId}?page=${currentPage}`);
            // let sortedPosts = response.data.sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
            if (isFetch) {
                setPostData(prevState => [...prevState, ...response.data]);
            } else {
                setPostData(response.data);
            }}
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [currentPage, profileId]);

    useEffect(() => {
      setCurrentPage(1)
    }, [profileId])


    useEffect(() => {
        (async () => {
            if (currentPage === 1) {
                await getPost(false)
            } else {
                await getPost(true)
            }
        })();
    }, [getPost, currentPage]);

    const createPost = async () => {
        try {
            const response = await postToServer();
            if (response) {
                await getPost();
                setCurrentPage(1);
                resetForm();
                setShowModal(false);
                setShowNotification(true);

                setTimeout(() => {
                    setShowNotification(false);
                }, 3000);

                navigate("/posts");
            }
        } catch (error) {
            console.error("Error creating post: ", error);
        }
    };


    useEffect(() => {
        if (editingPost) {
            setEditedImageUrl(editingPost.imageUrl || null);
            setTitle(editingPost.title);
            setPostText(editingPost.postText);
        }
    }, [editingPost]);


    const authStateChanged: AuthStateChangedCallback = (user) => {
        if (user) {
            const userData: UserData = {
                username: user.displayName || "",
            };
            setUser(userData);
        } else {
            setUser(null);
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

    useEffect(() => {
        if (imageUrl) {
            setTempImageUrl(imageUrl);
        }
    }, [imageUrl]);

    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setIsUploading(true);
                const imageRef = ref(storage, `images/${file.name}`);
                await uploadBytes(imageRef, file);
                const url = await getDownloadURL(imageRef);

                setTempImageUrl(url);
                setImageUrl(url);
                // @ts-ignore
                setEditingPost((prevEditingPost) => ({
                    ...prevEditingPost,
                    imageUrl: url,
                }));
            } catch (error) {
                console.error("Error uploading file:", error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleImageCreatePost = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setIsUploading(true);
                const imageRef = ref(storage, `images/${file.name}`);
                await uploadBytes(imageRef, file);
                const url = await getDownloadURL(imageRef);

                setImageUrl(url);
                // @ts-ignore

            } catch (error) {
                console.error("Error uploading file:", error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const clearImage = () => {
        setImageUrl(null);
    };

    const handleDeletePost = async (postToDelete: Post): Promise<void> => {
        try {
            await axios.delete(`${Api_Url}/post/${postToDelete.id}`);
            setPostData((prevPostData) =>
                prevPostData.filter((post) => post.id !== postToDelete.id)
            );
        } catch (error) {
            console.error("Error deleting post: ", error);
        }
    };


    const handleEditPost = (postToEdit: Post): void => {
        setEditingPost(postToEdit);
    };

    const resetForm = () => {
        setTitle("");
        setPostText("");
        setImageUrl(null);
    };

    const openCreatePostModal = () => {
        resetForm();
        setShowModal(true);
    };

    const handleSubmitEdit = async () => {
        if (!editingPost) return;

        try {
            await axios.patch(`${Api_Url}/post/${editingPost.id}`, {
                title: title,
                postText: postText,
                imageUrl: editedImageUrl || null,
            });

            // @ts-ignore
            setPostData((prevPostData) =>
                prevPostData.map((post) =>
                    post.id === editingPost.id
                        ? {
                            ...post,
                            title: title,
                            postText: postText,
                            imageUrl: editedImageUrl,
                        }
                        : post
                )
            );

            setEditingPost(null);
            setEditedImageUrl(null);
            setTempImageUrl(null);
        } catch (error) {
            console.error("Error editing post: ", error);
        }
    };

    const editCancel = () => {
        setEditingPost(null)
        setEditedImageUrl(null);
        setTempImageUrl(null);
    }

    return (
        <div>
            <Header/>
            <div>
                <div className="flex justify-center items-center">
                    <button
                        className="bg-blue-500 text-white active:bg-blue-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 h-full"
                        type="button"
                        onClick={() => openCreatePostModal()}
                    >
                        Create Post
                    </button>
                </div>
                <div
                    className="grid items-center justify-center grid-cols-1 md:grid-cols-1 gap-4 p-5 justify-items-center">
                    <div className="grid grid-cols-1 gap-2 w-6/12 justify-items-center">
                        {
                            postData.map((post, index) => (
                                    <div
                                        key={index}
                                        className=" w-full bg-purple-200 border border-slate-800 my-4 rounded-3xl"
                                    >
                                        <div className="min-w-2xl">
                                            {post.imageUrl?.length > 0 && (
                                                <img
                                                    src={post.imageUrl}
                                                    alt=""
                                                    className="w-full rounded-tl-3xl rounded-tr-3xl h-96 object-cover"
                                                />
                                            )}

                                            <p className="text-xl font-semibold p-3">{post.title}</p>
                                            <div
                                                className="text-center p-5 text-gray-600 overflow-hidden line-clamp-3 leading-6 whitespace-pre-wrap">
                                                {post.postText}
                                            </div>
                                            <>
                                                <div className="mt-4">
                                                    {post.comment && post.comment.length > 0 && (
                                                        <div className="text-left text-gray-600 mb-2">
                                                            <h3 className="font-semibold text-slate-600 border-b border-solid border-zinc-900 rounded-sm w-full text-xl p-2 mb-2">Comments:</h3>
                                                            {post.comment.map((comment, index) => (
                                                                <div key={index} className="p-2">
                                                                    <div
                                                                        className="font-semibold">{comment.userName} {comment.userSurname}</div>
                                                                    {comment.text}
                                                                    <div className="bg-slate-100 h-px w-full mt-4"/>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        </div>
                                        <div className="bg-slate-700 h-px w-full mt-4"/>
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
                                )
                            )}
                    </div>
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
                            <div className="overflow-y-auto overflow-x-hidden relative w-96 p-3 h-96">
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
                                            onChange={handleImageCreatePost}
                                            style={{display: "none"}}
                                        />
                                        {imageUrl && (
                                            <div className="relative">
                                                <img
                                                    className="w-full h-auto"
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
                                            className="bg-blue-500 w-full text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        >
                                            Choose Image
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
                                    className="text-slate-100 bg-red-600 background-transparent font-bold uppercase rounded px-6 py-2  text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                    type="button"
                                    onClick={() => {
                                        createPost();
                                    }}
                                >
                                    Create Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <EditPost editingPost={editingPost} isUploading={isUploading} tempImageUrl={tempImageUrl}
                      handleImageChange={handleImageChange} handleSubmitEdit={handleSubmitEdit}
                      setEditingPost={setEditingPost} editCancel={editCancel}/>
            <Notification show={showNotification} />
        </div>
    );
};
export default Modal