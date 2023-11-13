import React, { useCallback, useState } from "react";
import { toast } from "react-toastify";

import { UserAuth } from "../../context/UserAuthContext";
import { Comments } from "../pages/Feed";
import { Post } from "../pages/Posts";
import axiosInstance from "../server/axios";
import CommentSubmitButton from "./CommentSubmitButton";

interface CommentInputSectionProps {
	postId: string;
	setPostList: React.Dispatch<React.SetStateAction<Post[]>>;
	setVisibleCommentsCounts: React.Dispatch<React.SetStateAction<{ [postId: string]: number }>>;
}

const CommentInputSection: React.FC<CommentInputSectionProps> = ({
  postId,
  setPostList,
  setVisibleCommentsCounts
}) => {
	
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [commentTexts, setCommentTexts] = useState<{ [postId: string]: string }>({});
  const { isAuth, profileData } = UserAuth();
  const profileId = profileData?.id || null;
	
  const handleCommentChange = useCallback((postId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentTexts((prevCommentTexts) => ({...prevCommentTexts, [postId]: e.target.value}));
  }, []);
	
  const handleCommentSubmit = async (postId: string) => {
    setIsCommentSubmitting(true);
    try {
      const currentUserName = profileData?.name || "";
      const currentUserSurname = profileData?.surname || "";
      const newComment: Comments = {
        text: commentTexts[postId] || "",
        id: null,
        userName: currentUserName,
        userSurname: currentUserSurname,
        created_at: new Date().toISOString(),
      };
      setVisibleCommentsCounts((prevVisibleCommentsCounts) => ({
        ...prevVisibleCommentsCounts,
        [postId]: (prevVisibleCommentsCounts[postId] || 0) + 1,
      }));
      const response = await axiosInstance.post(`/comment`, {
        text: newComment.text,
        profileId: profileId,
        postId: postId,
      });
      if (response.data.posts) {
        setPostList((prevPostList) =>
          prevPostList.map((post) =>
            post.id === postId ? {...post, comments: [...post.comments, response.data.posts]} : post
          )
        );
      }
      setPostList((prevPostList) =>
        prevPostList.map((post) =>
          post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
        )
      );
      setCommentTexts((prevCommentTexts) => ({...prevCommentTexts, [postId]: ""}));
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
    } finally {
      setIsCommentSubmitting(false);
      setCommentTexts((prevCommentTexts) => ({ ...prevCommentTexts, [postId]: "" }));
    }
  };
	
  return (
    <>
      {isAuth && (
        <div className="mt-4 relative bottom-2 left-2">
          <div className="flex p-1 mb-2">
            <input
              className="w-full relative right-2 rounded-md border border-silver-300 p-1"
              type="text"
              placeholder="Enter your comment"
              value={commentTexts[postId] || ""}
              onChange={handleCommentChange(postId)}
            />
            {isCommentSubmitting ? (
              <div>Loading...</div>
            ) : (
              <CommentSubmitButton
                isCommentSubmitting={isCommentSubmitting}
                commentText={commentTexts}
                onSubmit={() => handleCommentSubmit(postId)}
                postId={postId}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default CommentInputSection;
