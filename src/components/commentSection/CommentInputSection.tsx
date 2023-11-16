import React, {useCallback, useEffect, useState} from "react";

import { UserAuth } from "../../context/UserAuthContext";
import { Post } from "../pages/Posts"
import axiosInstance from "../server/axios";
import showErrorToast from "../toastService/toastService";

interface CommentInputSectionProps {
	postId: number;
	setVisibleCommentsCounts: React.Dispatch<React.SetStateAction<number>>;
	setPostList: React.Dispatch<React.SetStateAction<Post[]>>;
	postList: Post[]
}

const CommentInputSection: React.FC<CommentInputSectionProps> = ({
  postId,
  setVisibleCommentsCounts,
  setPostList,
  postList
}) => {
	
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [commentTexts, setCommentTexts] = useState<string>("");
  const { isAuth, profileData } = UserAuth();
  const profileId = profileData?.id || null;
	
  const handleCommentChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCommentTexts(event.target.value);
  }, []);
	
  const handleCommentSubmit = async (postId: number) => {
    setIsCommentSubmitting(true);
    try {
      const response = await axiosInstance.post(`/comment`, {
        text: commentTexts,
        profileId,
        postId
      });
			
      const newComment = {
        id: response.data.id,
        text: commentTexts,
        profileId: Number(profileId),
        postId,
        userName: profileData?.name,
        userSurname: profileData?.surname,
        created_at: new Date().toISOString(),
      }
      setPostList((prevPostList) =>
        prevPostList.map((post) =>
          post.id === postId ? { ...post, comment: [...(post.comment || []), newComment] } : post
        )
      );
			
      console.log(postList)
			
    } catch (error) {
      showErrorToast("Error fetching token. Please try again.")
    } finally {
      setIsCommentSubmitting(false);
      setCommentTexts("")
    }
  };
	
  useEffect(() => {
    setVisibleCommentsCounts(3)
  }, [])
	
  return (
    <>
      {isAuth && (
        <div className="mt-4 relative bottom-2 left-2">
          <div className="flex p-1 mb-2">
            <input
              className="w-full relative right-2 rounded-md border border-silver-300 p-1"
              type="text"
              placeholder="Enter your comment"
              value={commentTexts || ""}
              onChange={handleCommentChange}
            />
            {isCommentSubmitting ? (
              <div>Loading...</div>
            ) : (
              <button
                className={`bg-blue-500 text-white w-60 p-2 ${!commentTexts.trim() ? "opacity-60" : ""}`}
                onClick={() => handleCommentSubmit(postId)}
                disabled={!commentTexts.trim() || isCommentSubmitting}
              >
                {isCommentSubmitting ? "Submitting..." : "Submit Comment"}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default CommentInputSection;
