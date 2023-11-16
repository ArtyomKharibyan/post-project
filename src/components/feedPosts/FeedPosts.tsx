import React, { useState } from "react";

import CommentInputSection from "../commentSection/CommentInputSection";
import CommentSection from "../commentSection/CommentSection";
import { defaultFeedPostImage } from "../constants/avatarUrl"
import { initialCommentsCount } from "../constants/constants";
import { Post } from "../pages/Posts";

interface FeedPostsProps {
	post: Post;
	setPostList: React.Dispatch<React.SetStateAction<Post[]>>;
}

const FeedPosts: React.FC<FeedPostsProps> = ({
  post,
  setPostList,
}) => {
  const [visibleCommentsCounts, setVisibleCommentsCounts] = useState<number>(initialCommentsCount);
	
  const loadMoreComments = () => {
    setVisibleCommentsCounts((prevState => prevState + 3))
  }
	
  return (
    <div className="p-3 rounded-2xl bg-purple-200" key={post.id}>
      <div>
        <img
          src={post?.imageUrl || defaultFeedPostImage}
          alt={post.imageUrl ? "" : "No Image"}
          className="w-full h-96 object-cover"/>
      </div>
      <>
        <p className="text-xl font-semibold p-3">{post.title}</p>
        <div className="text-center p-5 text-gray-600 overflow-hidden">{post.postText}</div>
      </>
      <CommentInputSection
        postId={post.id}
        setPostList={setPostList}
        setVisibleCommentsCounts={setVisibleCommentsCounts}
      />
      <CommentSection
        post={post}
        visibleCommentsCount={visibleCommentsCounts}
        loadMoreComments={loadMoreComments}
      />
    </div>
  );
};

export default FeedPosts;
