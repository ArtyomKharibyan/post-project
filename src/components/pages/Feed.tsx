import React, { useEffect, useState } from "react";
import axios from "../server/Axios";
import Header from "./Header";
import { UserAuth } from "../../context/UserAuthContext";
import { AiFillDelete, AiOutlineEdit } from "react-icons/ai";

interface Post {
    id: string;
    title: string;
    postText: string;
    image: string[];
    comments: Comment[];
    authorId: string;
}

interface Comment {
    id: string;
    text: string;
}

const Feed = () => {
    const [postList, setPostList] = useState<Post[]>([]);
    const [editedTitle, setEditedTitle] = useState<string>("");
    const [editedContent, setEditedContent] = useState<string>("");
    const [editPostId, setEditPostId] = useState<string | null>(null);
    const [commentTexts, setCommentTexts] = useState<{ [postId: string]: string }>({});
    const { isAuth, profileData, setProfileData } = UserAuth();
    const profileId = profileData?.id ?? "";
    const profileIdString = profileId?.toString() ?? "";


    useEffect(() => {
        const getPosts = async () => {
            try {
                const response = await axios.get("http://192.168.10.146:5000/api/post");
                const posts = await Promise.all(response.data.map(async (post: any) => {
                    const comments = await getCommentsForPost(post.id);
                    return {
                        ...post,
                        comments: comments,
                    };
                })) as Post[];
                setPostList(posts);
                setProfileData(profileData);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        const getCommentsForPost = async (postId: string) => {
            try {
                const response = await axios.get(`http://192.168.10.146:5000/api/comment/${postId}`);
                return response.data.map((comment: any) => ({
                    id: comment.id,
                    text: comment.text,
                })) as Comment[];
            } catch (error) {
                console.error("Error fetching comments:", error);
                return [];
            }
        };

        getPosts();
    }, [setProfileData]);

    const handleDeletePost = async (postId: string) => {
        try {
            await axios.delete(`http://192.168.10.146:5000/api/post/${postId}`);
            setPostList((prevPostData) => prevPostData.filter((post) => post.id !== postId));
        } catch (error) {
            console.error("Error deleting post: ", error);
        }
    };

    const handleEditPost = (postId: string) => {
        const postToEdit = postList.find((post) => post.id === postId);
        if (postToEdit && postToEdit.authorId === profileIdString) {
            setEditedTitle(postToEdit.title);
            setEditedContent(postToEdit.postText);
            setEditPostId(postId);
        }
    };

    const handleSaveEdit = async () => {
        if (!editPostId || !editedTitle || !editedContent) return;
        try {
            await axios.patch(`http://192.168.10.146:5000/api/post/${editPostId}`, {
                title: editedTitle,
                postText: editedContent,
            });
            setPostList((prevPostData) =>
                prevPostData.map((post) =>
                    post.id === editPostId ? { ...post, title: editedTitle, postText: editedContent } : post
                )
            );
            setEditPostId(null);
            setEditedTitle("");
            setEditedContent("");
        } catch (error) {
            console.error("Error editing post: ", error);
        }
    };

    const handleCommentChange = (postId: string) => {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            setCommentTexts((prevCommentTexts) => ({
                ...prevCommentTexts,
                [postId]: e.target.value,
            }));
        };
    };

    const handleCommentSubmit = async (postId: string) => {
        try {
            await axios.post(`http://192.168.10.146:5000/api/comment`, {
                text: commentTexts[postId] || "",
                profileId: profileId,
                postId: postId,
            });
            setCommentTexts((prevCommentTexts) => ({
                ...prevCommentTexts,
                [postId]: "",
            }));
        } catch (error) {
            console.error("Error submitting comment:", error);
        }
    };

    console.log(profileId)
    console.log(postList)

    return (
        <div>
            <Header />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {postList.map((post) => (
                    <div className="p-4 rounded-2xl bg-slate-200" key={post.id}>
                        <div className="min-w-2xl">
                            {post.image && <img className="w-full h-96 mb-2" src={post.image[0]} alt="" />}
                            {editPostId === post.id ? (
                                <>
                                    <input
                                        className="w-full mb-2 p-1 rounded-md border border-silver-300"
                                        type="text"
                                        placeholder="Enter your edited title"
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                    />
                                    <textarea
                                        className="w-full mb-2 p-1 rounded-md border border-silver-300"
                                        placeholder="Enter your edited content"
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                    />
                                    <button className="bg-blue-500 text-white w-60 p-2" onClick={handleSaveEdit}>
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-xl font-semibold p-3" onClick={() => handleEditPost(post.id)}>
                                        {post.title}
                                    </p>
                                    <div className="text-center p-5 text-gray-600 overflow-hidden">{post.postText}</div>
                                    {isAuth && post.authorId === profileIdString && (
                                        <div className="text-center">
                                            <button onClick={() => handleEditPost(post.id)}>
                                                <AiOutlineEdit className="h-7 w-7 mr-2" />
                                            </button>
                                            <button onClick={() => handleDeletePost(post.id)}>
                                                <AiFillDelete style={{ color: "red" }} className="bg-red h-7 w-7" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        {isAuth && (
                            <div className="mt-4 relative bottom-2 left-2">
                                <div className="flex p-1 mb-2">
                                    <input
                                        className="w-full relative right-2 rounded-md border border-silver-300 p-1"
                                        type="text"
                                        placeholder="Enter your comment"
                                        value={commentTexts[post.id] || ""}
                                        onChange={handleCommentChange(post.id)}
                                    />
                                    <button
                                        className="bg-blue-500 text-white w-60 p-2"
                                        onClick={() => handleCommentSubmit(post.id)}
                                    >
                                        Submit Comment
                                    </button>
                                </div>
                                <div className="text-gray-600 mt-4">
                                    {post.comments.map((comment) => (
                                        <div key={comment.id} className="mb-2">
                                            {comment.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feed;
