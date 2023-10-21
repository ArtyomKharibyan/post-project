import React, {useEffect, useState} from "react";
import axios from "../server/axios";
import Header from "./Header";
import Api_Url from "../server/config";
import useInfiniteScroll from "../pagination/Pagination";

interface PostWithLoading {
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
    userName: string;
    userSurname: string;
    text: string;
    timestamp: string;
}

const initialCommentsCount = 3;
const loadMoreCommentsCount = 3;

const Guest = () => {
    const [postList, setPostList] = useState<PostWithLoading[]>([]);
    const [visibleCommentsCounts, setVisibleCommentsCounts] = useState<{ [postId: string]: number }>({});
    const [currentPage, setCurrentPage] = useState<number>(1);

    const fetchPosts = async (page: number) => {
        try {
            const response = await axios.get(
                `${Api_Url}/guest?page=${page}`
            );

            if (Array.isArray(response.data)) {
                const posts: PostWithLoading[] = response.data.map((post) => ({
                    ...post,
                    comments: post.comment || [],
                    loading: false,
                }));

                const newVisibleCommentsCounts: { [postId: string]: number } = {};
                posts.forEach((post) => {
                    newVisibleCommentsCounts[post.id] = initialCommentsCount;
                });

                if (page === 1) {
                    setPostList(posts);
                } else {
                    setPostList((prevPostList) => [...prevPostList, ...posts]);
                }

                setVisibleCommentsCounts((prevVisibleCommentsCounts) => {
                    return {...prevVisibleCommentsCounts, ...newVisibleCommentsCounts};
                });
            } else {
                console.error("Invalid or empty response data");
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    useEffect(() => {
        fetchPosts(currentPage)
    }, [currentPage])


    useInfiniteScroll(setCurrentPage);

    return (
        <div>
            <Header/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {postList
                    .map((post, index,) => (
                        <div className="p-3 rounded-2xl bg-purple-200 border border-black" key={index}>
                            <div>
                                {post?.imageUrl && (
                                    <img src={post.imageUrl} alt="" className="w-full h-96 object-cover"/>
                                )}
                            </div>
                            <>
                                <p className="text-xl font-semibold p-3">
                                    {post.title}
                                </p>
                                <div className="text-center p-5 text-gray-600 overflow-hidden">{post.postText}</div>
                            </>

                            <div className="text-gray-600 mt-4">
                                {post.comments.slice(0, visibleCommentsCounts[post.id] || initialCommentsCount).map((comment, index) => (
                                    <div key={index}
                                         className="mb-2 bg-slate-100 relative right-2 rounded-2xl p-2">
                                        <strong>User: {`${comment?.userName} ${comment?.userSurname}`}</strong>
                                        <br/>
                                        <div className="flex break-all flex-row	justify-between"> {comment.text}<span
                                            className="flex justify-end text-xs text-current">{comment.timestamp}</span>
                                        </div>
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

                            <div className="font-semibold">
                                Author: {post.name} {post.surname}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Guest;