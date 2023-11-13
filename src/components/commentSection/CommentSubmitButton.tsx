import React from "react";

interface CommentSubmitButtonProps {
	isCommentSubmitting: boolean;
	commentText: { [postId: string]: string };
	onSubmit: () => void;
	postId: string;
}

const CommentSubmitButton: React.FC<CommentSubmitButtonProps> = ({ isCommentSubmitting, commentText, onSubmit, postId }) => {
  const text = commentText[postId] || "";
  return (
    <button
      className={`bg-blue-500 text-white w-60 p-2 ${!text.trim() ? "opacity-60" : ""}`}
      onClick={onSubmit}
      disabled={!text.trim() || isCommentSubmitting}
    >
      {isCommentSubmitting ? "Submitting..." : "Submit Comment"}
    </button>
  );
};

export default CommentSubmitButton;
