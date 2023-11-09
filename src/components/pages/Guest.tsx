import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axiosInstance from "../server/axios";
import { PostWithLoading } from "./Feed";
import CommentSection from "../commentSection/CommentSection";

const initialCommentsCount = 3;
const loadMoreCommentsCount = 3;

const Guest = () => {
  const [postList, setPostList] = useState<PostWithLoading[]>([]);
  const [visibleCommentsCounts, setVisibleCommentsCounts] = useState<{ [postId: string]: number }>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [allDataCount, setAllDataCount] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
	
  const fetchPosts = async (page: number) => {
    try {
      const response = await axiosInstance.get(`/guest?page=${page}`);
      if (response.data.posts) {
        const posts: PostWithLoading[] = response.data.posts.map((post: { comment: never }) => ({
          ...post,
          comments: post.comment || [],
          loading: false,
        }));
        setAllDataCount(response.data.countAllData)
        const newVisibleCommentsCounts: { [postId: string]: number } = {};
        posts.forEach((post) => {
          newVisibleCommentsCounts[post.id] = initialCommentsCount;
        });
        setPostList((prevPostList) => (page === 1 ? posts : [...prevPostList, ...posts]));
        setVisibleCommentsCounts((prevVisibleCommentsCounts) => ({
          ...prevVisibleCommentsCounts,
          ...newVisibleCommentsCounts,
        }));
      } else {
        console.error("Invalid or empty response data");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };
	
  useEffect(() => {
    if(allDataCount) {
      setHasMore(currentPage * 6 <= allDataCount);
    }
  },[currentPage])
	
  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);
	
  const fetchMoreData = () => {
    if (postList.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };
	
  return (
    <div>
      <InfiniteScroll
        className="w-full flex-col flex justify-center items-center"
        dataLength={postList.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<p>Loading...</p>}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          {postList.map((post, index) => (
            <div className="p-3 rounded-2xl bg-purple-200" key={index}>
              <div>
                <img
                  src={
                    post?.imageUrl ||
										"https://firebasestorage.googleapis.com/v0/b/post-project-80c0a.appspot.com/o/images%2FNo-Image-Placeholder.svg.png?alt=media&token=3cbf17a7-c089-494a-b2ab-feeeac5fa57c"
                  }
                  alt={post.imageUrl ? "" : "No Image"}
                  className="w-full h-96 object-cover"
                />
              </div>
              <>
                <p className="text-xl font-semibold p-3">{post.title}</p>
                <div className="text-center p-5 text-gray-600 overflow-hidden">{post.postText}</div>
              </>
              <CommentSection
                post={post}
                visibleCommentsCount={visibleCommentsCounts[post.id] || initialCommentsCount}
                loadMoreComments={() => {
                  setVisibleCommentsCounts((prevVisibleCommentsCounts) => ({
                    ...prevVisibleCommentsCounts,
                    [post.id]: (prevVisibleCommentsCounts[post.id] || 0) + loadMoreCommentsCount,
                  }));
                }}
              />
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default Guest;
