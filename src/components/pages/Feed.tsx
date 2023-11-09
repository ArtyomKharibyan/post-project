import React, { useCallback, useEffect, useState } from "react";
import { UserAuth } from "../../context/UserAuthContext";
import InfiniteScroll from "react-infinite-scroll-component";
import axiosInstance from "../server/axios";
import CommentSection from "../commentSection/CommentSection";

export interface PostWithLoading {
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

export interface Comment {
	id: null;
	text: string;
	userName: string;
	userSurname: string;
	created_at: string;
}

const initialCommentsCount = 3;
const loadMoreCommentsCount = 3;

const Feed: React.FC = () => {
  const [postList, setPostList] = useState<PostWithLoading[]>([]);
  const [commentTexts, setCommentTexts] = useState<{ [postId: string]: string }>({});
  const [visibleCommentsCounts, setVisibleCommentsCounts] = useState<{ [postId: string]: number }>({});
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allDataCount, setAllDataCount] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { isAuth, profileData } = UserAuth();
  const profileId = profileData?.id || null;
	
  const getPosts = async (page: number) => {
    try {
      const response = await axiosInstance.get(`/feed?page=${page}`);
      if (response.data.posts) {
        const posts = response.data.posts.map((post: { comment: string }) => ({
          ...post,
          comments: post.comment || [],
        })) as PostWithLoading[];
        setAllDataCount(response.data.countAllData)
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
        console.error("Invalid or empty response data");
        setPostList([]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };
	
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
      setHasMore(currentPage * 6 <= allDataCount);
    } else {
      setHasMore(false)
    }
  },[currentPage, allDataCount])
	
  const handleCommentChange = useCallback((postId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentTexts((prevCommentTexts) => ({ ...prevCommentTexts, [postId]: e.target.value }));
  }, []);
	
  const handleCommentSubmit = async (postId: string) => {
    setIsCommentSubmitting(true);
    try {
      const currentUserName = profileData?.name || "";
      const currentUserSurname = profileData?.surname || "";
      const newComment: Comment = {
        text: commentTexts[postId] || "",
        id: null,
        userName: currentUserName,
        userSurname: currentUserSurname,
        created_at: new Date().toISOString(),
      };
      setPostList((prevPostList) =>
        prevPostList.map((post) =>
          post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
        )
      );
      setVisibleCommentsCounts((prevVisibleCommentsCounts) => ({
        ...prevVisibleCommentsCounts,
        [postId]: (prevVisibleCommentsCounts[postId] || 0) + 1,
      }));
      const response = await axiosInstance.post(`/comment`, {
        text: newComment.text,
        profileId: profileId,
        postId: postId,
        userName: newComment.userName,
        userSurname: newComment.userSurname,
        created_at: newComment.created_at,
      });
      if (response.data.posts) {
        setPostList((prevPostList) =>
          prevPostList.map((post) =>
            post.id === postId ? { ...post, comments: [...post.comments, response.data.posts] } : post
          )
        );
      }
      setCommentTexts((prevCommentTexts) => ({ ...prevCommentTexts, [postId]: "" }));
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsCommentSubmitting(false);
      setCommentTexts({});
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
                        className={`bg-blue-500 text-white w-60 p-2 ${!commentTexts[post.id]?.trim() ? "opacity-60" : ""}`}
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={!commentTexts[post.id]?.trim()}
                      >
												Submit Comment
                      </button>
                    )}
                  </div>
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
              )}
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default Feed;
