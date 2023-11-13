import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "react-toastify";

import CommentInputSection from "../commentSection/CommentInputSection";
import CommentSection from "../commentSection/CommentSection";
import { initialCommentsCount, loadMoreCommentsCount } from "../constants/constants"
import axiosInstance from "../server/axios";
import { Post } from "./Posts";

export interface Comments {
	id: null;
	text: string;
	userName?: string;
	userSurname?: string;
	created_at: string;
}

const Feed: React.FC = () => {
  const [postList, setPostList] = useState<Post[]>([]);
  const [visibleCommentsCounts, setVisibleCommentsCounts] = useState<{ [postId: string]: number }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [allDataCount, setAllDataCount] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
	
  const getPosts = async (page: number) => {
    try {
      const { data } = await axiosInstance.get(`/feed?page=${page}`);
      if (data.posts) {
        const posts = data.posts.map((post: { comment: string }) => ({
          ...post,
          comments: post.comment || [],
        })) as Post[];
        setAllDataCount(data.countAllData)
        if (page === 1) {
          setPostList(posts);
        } else {
          setPostList((prevPostList) => [...prevPostList, ...posts]);
        }
        const newVisibleCommentsCounts: { [postId: string]: number } = {};
        posts.forEach((post) => {
          newVisibleCommentsCounts[post.id] = initialCommentsCount;
        });
        setVisibleCommentsCounts((prevVisibleCommentsCounts) => ({ ...prevVisibleCommentsCounts, ...newVisibleCommentsCounts }));
      } else {
        toast.error("Error fetching token. Please try again.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setPostList([]);
      }
    } catch (error) {
      toast.error("Error fetching token. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };
	
  const loadMoreComments = (postId: string) => {
    setVisibleCommentsCounts((prevVisibleCommentsCounts) => ({
      ...prevVisibleCommentsCounts,
      [postId]: (prevVisibleCommentsCounts[postId] || 0) + loadMoreCommentsCount,
    }));
  }
	
  useEffect(() => {
    getPosts(currentPage);
  }, [currentPage]);
	
  const fetchMoreData = () => {
    if (postList.length) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };
	
  useEffect(() => {
    if(allDataCount) {
      setHasMore(currentPage * 6 < allDataCount);
    } else {
      setHasMore(false)
    }
  },[currentPage, allDataCount])
	
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
          {postList.map((post) => (
            <div className="p-3 rounded-2xl bg-purple-200" key={post.id}>
              <div>
                <img
                  src={post?.imageUrl || "https://firebasestorage.googleapis.com/v0/b/post-project-80c0a.appspot.com/o/images%2FNo-Image-Placeholder.svg.png?alt=media&token=3cbf17a7-c089-494a-b2ab-feeeac5fa57c"}
                  alt={post.imageUrl ? "" : "No Image"}
                  className="w-full h-96 object-cover"
                />
              </div>
              <>
                <p className="text-xl font-semibold p-3">{post.title}</p>
                <div className="text-center p-5 text-gray-600 overflow-hidden">{post.postText}</div>
              </>
              <CommentInputSection
                postId={post.id}
                setVisibleCommentsCounts={setVisibleCommentsCounts}
                setPostList={setPostList}
              />
              <CommentSection
                post={post}
                visibleCommentsCount={visibleCommentsCounts[post.id] || initialCommentsCount}
                loadMoreComments={() => loadMoreComments(post.id)}
              />
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default Feed;
