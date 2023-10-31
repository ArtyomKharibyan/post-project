import React, { useEffect, useState } from "react";
import axios from "../server/axios";
import Api_Url from "../server/config";
import CommentSection from "../commentSection/CommentSection";
import InfiniteScroll from "react-infinite-scroll-component"

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
    created_at: string;
}

const initialCommentsCount = 3;
const loadMoreCommentsCount = 3;

const Guest = () => {
    const [postList, setPostList] = useState<PostWithLoading[]>([]);
    const [visibleCommentsCounts, setVisibleCommentsCounts] = useState<{ [postId: string]: number }>({});
    const [currentPage, setCurrentPage] = useState<number>(1);

    const fetchPosts = async (page: number) => {
        try {
            const response = await axios.get(`${Api_Url}/guest?page=${page}`);

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
                    return { ...prevVisibleCommentsCounts, ...newVisibleCommentsCounts };
                });
            } else {
                console.error("Invalid or empty response data");
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    let fetchMoreTimeout: NodeJS.Timeout;

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage]);

    const fetchMoreData = () => {
        clearTimeout(fetchMoreTimeout);

        fetchMoreTimeout = setTimeout(() => {
            setCurrentPage(prevPage => prevPage + 1);
        }, 500);
    };

    return (
        <div>
            <InfiniteScroll
                            dataLength={postList.length}
                            next={fetchMoreData}
                            hasMore={true}
                            loader={<p> </p>}
            >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {postList.map((post, index,) => (
                    <div className="p-3 rounded-2xl bg-purple-200" key={index}>
                        <div>
                            {post?.imageUrl ? (
                                <img src={post.imageUrl} alt="" className="w-full h-96 object-cover" />
                            ) : (
                                <img src="https://firebasestorage.googleapis.com/v0/b/post-project-80c0a.appspot.com/o/images%2FNo-Image-Placeholder.svg.png?alt=media&token=3cbf17a7-c089-494a-b2ab-feeeac5fa57c" alt="No Image" className="w-full h-96 object-cover" />
                            )}
                        </div>
                        <>
                            <p className="text-xl font-semibold p-3">{post.title}</p>
                            <div className="text-center p-5 text-gray-600 overflow-hidden">{post.postText}</div>
                        </>

                        {post.comments.length > initialCommentsCount && (
                            <CommentSection
                                comments={post.comments}
                                visibleCommentsCount={visibleCommentsCounts[post.id] || initialCommentsCount}
                                loadMoreComments={() => {
                                    setVisibleCommentsCounts((prevVisibleCommentsCounts) => ({
                                        ...prevVisibleCommentsCounts,
                                        [post.id]: (prevVisibleCommentsCounts[post.id] || 0) + loadMoreCommentsCount,
                                    }));
                                }}
                            />
                        )}

                        <div className="font-semibold">
                            Author: {post.name} {post.surname}
                        </div>
                    </div>
                ))}
            </div>
            </InfiniteScroll>
        </div>
    );
};

export default Guest;
