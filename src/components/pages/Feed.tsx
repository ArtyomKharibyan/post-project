import React, {useEffect, useState, useCallback } from "react";
import axios from "../server/axios";
import Header from "./Header";
import { UserAuth } from "../../context/UserAuthContext";
import { AiFillDelete, AiOutlineEdit } from "react-icons/ai";
import {Api_Url} from "../server/config";

interface Post {
    name: string;
    surname: string;
    id: string;
    title: string;
    postText: string;
    profileId: number;
    imageUrl: string;
    fullName: string;
    comments: Comment[];
    loading: boolean;
}

interface Comment {
    id: string;
    text: string;
    userName: string;
    userSurname: string;
}

const Feed: React.FC = () => {
    const [postList, setPostList] = useState<Post[]>([]);
    const [editedTitle, setEditedTitle] = useState<string>("");
    const [editedContent, setEditedContent] = useState<string>("");
    const [commentTexts, setCommentTexts] = useState<{ [postId: string]: string }>({});
    const [visibleCommentsCounts, setVisibleCommentsCounts] = useState<{ [postId: string]: number }>({});
    const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
    const [editPostId, setEditPostId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const { isAuth, profileData } = UserAuth();
    const profileId = profileData?.id || "";

    const initialCommentsCount = 3;
    const loadMoreCommentsCount = 3;

    useEffect(() => {
        const getPosts = async () => {
            try {
                const response = await axios.get(`${Api_Url}/feed?page=1`);
                if (Array.isArray(response.data)) {
                    const posts = response.data.map((post: any) => ({
                        ...post,
                        comments: post.comment || [],
                    })) as Post[];

                    setPostList(posts);
                    const initialVisibleCommentsCounts: { [postId: string]: number } = {};
                    posts.forEach((post) => {
                        initialVisibleCommentsCounts[post.id] = initialCommentsCount;
                    });
                    setVisibleCommentsCounts(initialVisibleCommentsCounts);
                } else {
                    console.error("Invalid or empty response data");
                    setPostList([]);
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        getPosts();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY || document.documentElement.scrollTop;

            if (windowHeight + scrollTop >= documentHeight - 200) {
                loadMorePosts();
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [isLoading, currentPage]);

    const loadMorePosts = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const response = await axios.get(`${Api_Url}/feed?page=${currentPage + 1}`);
            if (Array.isArray(response.data)) {
                const newPosts = response.data.map((post: any) => ({
                    ...post,
                    comments: post.comment || [],
                })) as Post[];
                setPostList((prevPostList) => [...prevPostList, ...newPosts]);

                setVisibleCommentsCounts((prevVisibleCommentsCounts) => {
                    const updatedCounts = { ...prevVisibleCommentsCounts };
                    newPosts.forEach((post) => {
                        updatedCounts[post.id] = initialCommentsCount;
                    });
                    return updatedCounts;
                });

                setCurrentPage(currentPage + 1);
            }
        } catch (error) {
            console.error("Error fetching more posts:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleDeletePost = async (postId: string) => {
        try {
            await axios.delete(`${Api_Url}/post/${postId}`);
            setPostList((prevPostData) => prevPostData.filter((post) => post.id !== postId));
        } catch (error) {
            console.error("Error deleting post: ", error);
        }
    };

    const handleEditPost = (postId: string) => {
        const postToEdit = postList.find((post) => post.id === postId);
        if (postToEdit) {
            setEditedTitle(postToEdit.title);
            setEditedContent(postToEdit.postText);
            setEditPostId(postId);
        }
    };

    const handleSaveEdit = async () => {
        if (!editPostId || !editedTitle || !editedContent) return;
        try {
            await axios.patch(`${Api_Url}/post/${editPostId}`, {
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

    const handleCommentChange = useCallback(
        (postId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setCommentTexts((prevCommentTexts) => ({
                ...prevCommentTexts,
                [postId]: e.target.value,
            }));
        },
        []
    );

    const handleCommentSubmit = async (postId: string) => {
        setIsCommentSubmitting(true);
        try {
            const currentUserName = profileData?.name || "";
            const currentUserSurname = profileData?.surname || "";

            const newComment: Comment = {
                text: commentTexts[postId] || "",
                id: "",
                userName: currentUserName,
                userSurname: currentUserSurname,
            };

            setPostList((prevPostList) =>
                prevPostList.map((post) =>
                    post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
                )
            );

            setVisibleCommentsCounts((prevVisibleCommentsCounts) => ({
                ...prevVisibleCommentsCounts,
                [postId]: (prevVisibleCommentsCounts[postId] || 0) + 1, // Increment the count to show newly added comment
            }));

            const response = await axios.post(`${Api_Url}/comment`, {
                text: newComment.text,
                profileId: profileId,
                postId: postId,
                userName: newComment.userName,
                userSurname: newComment.userSurname,
            });

            if (response.data.id) {
                setPostList((prevPostList) =>
                    prevPostList.map((post) =>
                        post.id === postId ? { ...post, comments: [...post.comments, response.data] } : post
                    )
                );
            }

            setCommentTexts((prevCommentTexts) => ({
                ...prevCommentTexts,
                [postId]: "",
            }));
        } catch (error) {
            console.error("Error submitting comment:", error);
        } finally {
            setIsCommentSubmitting(false);
        }
    };

    return (
        <div>
            <Header />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {postList
                    .map((post) => (
                        <div className="p-3 rounded-2xl bg-purple-200 border border-black" key={post.id}>
                            <div>
                                {post.imageUrl && (
                                    <img
                                        src={post.imageUrl}
                                        alt=""
                                        className="w-full h-96 object-cover"
                                    />
                                )}
                            </div>
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
                                        className="w-full mb-2 p-1 rounded-md border border-silver-300 resize-none"
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
                                    <p className="text-xl font-semibold p-3">
                                        {post.title}
                                    </p>
                                    <div className="text-center p-5 text-gray-600 overflow-hidden">{post.postText}</div>
                                </>
                            )}
                            {isAuth && profileId === post.profileId && (
                                <>
                                    <button onClick={() => handleEditPost(post.id)}>
                                        <AiOutlineEdit className="h-7 w-7 mr-2" />
                                    </button>
                                    <button onClick={() => handleDeletePost(post.id)}>
                                        <AiFillDelete style={{ color: "red" }} className="bg-red h-7 w-7" />
                                    </button>
                                </>
                            )}

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
                                        {isCommentSubmitting ? (
                                            <div>Loading...</div>
                                        ) : (
                                            <button
                                                className={`bg-blue-500 text-white w-60 p-2 ${!commentTexts[post.id]?.trim() ? 'opacity-60' : ''}`}
                                                onClick={() => handleCommentSubmit(post.id)}
                                                disabled={!commentTexts[post.id]?.trim()}
                                            >
                                                Submit Comment
                                            </button>
                                        )}

                                    </div>
                                    <div className="text-gray-600 mt-4">
                                        {post.comments.slice(0, visibleCommentsCounts[post.id] || initialCommentsCount).map((comment, index) => (
                                            <div key={index} className="mb-2 bg-slate-100 relative right-2 rounded-2xl p-2">
                                                <strong>User: {`${comment?.userName} ${comment?.userSurname}`}</strong> <br />
                                                {comment.text}
                                            </div>
                                        ))}
                                        {post.comments.length > initialCommentsCount && visibleCommentsCounts[post.id] < post.comments.length && (
                                            <button
                                                className="text-blue-700 cursor-pointer"
                                                onClick={() => {
                                                    setVisibleCommentsCounts((prevVisibleCommentsCounts) => ({
                                                        ...prevVisibleCommentsCounts,
                                                        [post.id]: prevVisibleCommentsCounts[post.id] + loadMoreCommentsCount,
                                                    }));
                                                }}
                                            >
                                                Show more comments
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="font-semibold">
                                Author: {post.name} {post.surname}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Feed;