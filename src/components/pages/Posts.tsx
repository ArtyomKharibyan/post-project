import React, {useEffect, useState, useCallback, useRef} from "react";
import {getDownloadURL, ref, uploadBytes,} from "firebase/storage";
import {onAuthStateChanged} from 'firebase/auth';
import {auth, storage} from "../../firebase/firebase";
import {useNavigate} from "react-router-dom";
import Header from "./Header";
import firebase from "firebase/compat";
import axios from "../server/axios";
import {UserAuth} from "../../context/UserAuthContext";
import {Api_Url} from "../server/config"

interface Post {
    id: number;
    imageUrl: string[];
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
    password: string;
}

type AuthStateChangedCallback = (user: firebase.User | null) => void;

const Modal: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [postText, setPostText] = useState<string>("");
    const [imageUpload, setImageUpload] = useState<File | null>(null);
    const [user, setUser] = useState<UserData | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [postData, setPostData] = useState<Post[]>([]);
    const [loadingUserPosts, setLoadingUserPosts] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadedPostIds, setLoadedPostIds] = useState<Set<number>>(new Set());

    const {profileData, setProfileData} = UserAuth();
    const profileId = profileData?.id ?? "";
    const observer = useRef<IntersectionObserver | null>(null);

    const navigate = useNavigate();

    const uploadFile = async () => {
        setLoading(true);
        if (imageUpload === null) return;
        const imageRef = ref(storage, `images/${imageUpload.name}`);
        await uploadBytes(imageRef, imageUpload);
        const url = await getDownloadURL(imageRef);
        setImageUrl(url);
        setLoading(false);
    };

    console.log(profileId)

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
                        profileId: userData.profileData.profileId || "",
                        surname: userData.profileData.surname || "",
                    });
                }

                console.log(profileData)

                return response;
            } else {
                console.error("Error fetching user profile:", response.statusText);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    const lastPostRef = useCallback(
        (node: any) => {
            if (loadingUserPosts) return;

            if (observer.current) {
                observer.current.disconnect();
            }

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setCurrentPage((prevPage) => prevPage + 1);
                }
            });

            if (node) {
                observer.current.observe(node);
            }
        },
        [loadingUserPosts, hasMore]
    );

    useEffect(() => {
        const getPost = async () => {
            setLoadingUserPosts(true);
            try {
                const response = await axios.get(`${Api_Url}/post/${profileId}?page=${currentPage}`);
                const newPosts = response.data.map((post: any) => ({
                    id: post.id,
                    imageUrl: [post.imageUrl],
                    title: post.title,
                    postText: post.postText,
                    profileId: post.profileId,
                    name: post.name,
                    surname: post.surname,
                    comment: post.comment,
                    userName: post.comment.userName,
                    userSurname: post.comment.userSurname,
                }));

                // Filter out posts that are already loaded
                const uniqueNewPosts = newPosts.filter((post: { id: number; }) => !loadedPostIds.has(post.id));

                // Update loaded post IDs
                setLoadedPostIds(prevIds => new Set([...prevIds, ...uniqueNewPosts.map((post: { id: number; }) => post.id)]));

                // Append unique new posts to the state
                setPostData(prevPosts => [...prevPosts, ...uniqueNewPosts]);

                if (response.data.length === 0) {
                    setHasMore(false);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoadingUserPosts(false);
            }
        };

        getPost();
    }, [profileId, currentPage]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setCurrentPage((prevPage) => prevPage + 1);
                }
            },
            {
                threshold: 0.1,
            }
        );

        // @ts-ignore
        if (lastPostRef.current) {
            // @ts-ignore
            observer.observe(lastPostRef.current);
        }

        return () => {
            // @ts-ignore
            if (lastPostRef.current) {
                // @ts-ignore
                observer.unobserve(lastPostRef.current);
            }
        };
    }, [lastPostRef, hasMore]);


    useEffect(() => {
        const getPost = async () => {
            setLoadingUserPosts(true);
            try {
                const response = await axios.get(`${Api_Url}/post/${profileId}?page=1`);
                console.log(response)
                const postDataWithImage: Post[] = response.data.map((post: any) => ({
                    id: post.id,
                    imageUrl: [post.imageUrl],
                    title: post.title,
                    postText: post.postText,
                    profileId: post.profileId,
                    name: post.name,
                    surname: post.surname,
                    comment: post.comment,
                    userName: post.comment.userName,
                    userSurname: post.comment.userSurname,
                }));

                setPostData(postDataWithImage);
                setLoadingPosts(false);
            } catch (error) {
                setLoadingPosts(false);
                console.error('Error fetching data:', error);
            } finally {
                setLoadingUserPosts(false);
            }
        };

        const fetchData = async () => {
            await getPost();
        };

        fetchData();

    }, [profileId, profileData, setProfileData]);

    const createPost = async () => {
        try {
            setLoading(true);

            await uploadFile()

            const response = await postToServer();

            if (response) {
                const newPost = {
                    id: response.data.id,
                    imageUrl: [imageUrl || ""],
                    title,
                    postText,
                };

                setPostData([...postData, newPost]);
                setPosts([...posts, newPost]);

                resetForm();
                setShowModal(false);

                navigate("/posts");
            }
        } catch (error) {
            console.error("Error creating post: ", error);
        } finally {
            setLoading(false);
        }
    };

    console.log(user)
    console.log(posts)

    const authStateChanged: AuthStateChangedCallback = (user) => {
        if (user) {
            const userData: UserData = {
                username: user.displayName || "",
                password: ""
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

    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setLoading(true);
                const imageRef = ref(storage, `images/${file.name}`);
                await uploadBytes(imageRef, file);
                const url = await getDownloadURL(imageRef);
                setImageUrl(url);
                setLoading(false);
            } catch (error) {
                console.error("Error uploading file:", error);
                setLoading(false);
            }
        }
    };

    const clearImage = () => {
        setImageUpload(null);
        setImageUrl(null);
    };

    const handleDeletePost = async (postToDelete: Post): Promise<void> => {
        try {
            await axios.delete(`${Api_Url}/post/${postToDelete.id}`);
            setPostData((prevPostData) =>
                prevPostData.filter((post) => post.id !== postToDelete.id)
            );
            setPosts((prevPosts) =>
                prevPosts.filter((post) => post.id !== postToDelete.id)
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
            await axios.patch(`${Api_Url}/post/${editingPost.id}`, {
                title: editingPost.title,
                postText: editingPost.postText,
            });

            setPostData((prevPostData) =>
                prevPostData.map((post) =>
                    post.id === editingPost.id
                        ? {
                            ...post,
                            title: editingPost.title,
                            postText: editingPost.postText,
                        }
                        : post
                )
            );

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === editingPost.id
                        ? {
                            ...post,
                            title: editingPost.title,
                            postText: editingPost.postText,
                            imageUrl: editingPost.imageUrl,
                        }
                        : post
                )
            );

            setEditingPost(null);
        } catch (error) {
            console.error("Error editing post: ", error);
        }
    };

    console.log(profileData)
    console.log(postData)

    return (
        <div>
            <Header/>
            <div>
                {!loadingUserPosts && (
                    <div className="flex justify-center items-center">
                        <button
                            className="bg-blue-500 text-white active:bg-blue-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 h-full"
                            type="button"
                            onClick={() => openCreatePostModal()}
                        >
                            Create Post
                        </button>
                    </div>
                )}
                <div className="grid items-center justify-center grid-cols-1 md:grid-cols-1 gap-4 p-5 justify-items-center">
                    <div className="grid grid-cols-1 gap-2 w-6/12 justify-items-center">
                    {
                        postData.map((post, index) => (
                                <div
                                    key={index}
                                    ref={index === postData.length - 1 ? lastPostRef : null}
                                    className=" w-full bg-purple-200 border border-slate-800 my-4 rounded-3xl"
                                >
                                    {!loadingUserPosts && postData.length === 0 && <div>No posts available.</div>}
                                    {!loading && !loadingPosts && (
                                        <div className="min-w-2xl">
                                            {post.imageUrl?.length > 0 && (
                                                <img
                                                    src={post.imageUrl[0]}
                                                    alt=""
                                                    className="w-full rounded-tl-3xl rounded-tr-3xl h-96 object-cover"
                                                />
                                            )}

                                            <p className="text-xl font-semibold p-3">{post.title}</p>
                                            <div
                                                className="text-center p-5 text-gray-600 overflow-hidden rounded-sm resize-none rounded-md overflow-wrap break-word truncate-3-lines">
                                                {post.postText}
                                            </div>
                                            <>
                                                <div className="mt-4">
                                                    {post.comment && post.comment.length > 0 && (
                                                        <div className="text-left text-gray-600 mb-2">
                                                            <h3 className="font-semibold border border-slate-600 rounded-sm w-full text-xl p-2 mb-2">Comments:</h3>
                                                            {post.comment.map((comment, index) => (
                                                                <div key={index} className = "p-2">
                                                                    <div className = "font-semibold">{comment.userName} {comment.userSurname}</div>
                                                                    {comment.text}
                                                                    <div className="bg-slate-100 h-px w-full mt-4"/>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        </div>
                                    )}
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
                                            onChange={handleImageChange}
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
                                setEditingPost({...editingPost, title: e.target.value})
                            }
                        />
                        <textarea
                            placeholder="PostText..."
                            className="resize-none border border-silver-300 h-24 rounded-md"
                            value={editingPost.postText}
                            onChange={(e) =>
                                setEditingPost({...editingPost, postText: e.target.value})
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
export default Modal
