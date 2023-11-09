import React from "react";
import { format, parseISO } from "date-fns";
import { Comment } from "../pages/Feed";

interface CommentSectionProps {
	post: {
		id: string;
		name: string;
		surname: string;
		comments: Comment[];
	};
	visibleCommentsCount: number;
	loadMoreComments: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  post,
  visibleCommentsCount,
  loadMoreComments,
}) => {
	
  const formatDate = (created_at: string) => {
    const parsedDate = parseISO(created_at);
    return format(parsedDate, "HH:mm");
  };
	
  return (
    <div>
      <div className="text-gray-600 mt-4">
        {post.comments.slice(0, visibleCommentsCount).map((comment, index) => (
          <div key={index} className="mb-2 bg-slate-100 relative right-2 rounded-2xl p-2">
            <strong>User: {`${comment?.userName} ${comment?.userSurname}`}</strong>
            <br />
            <div className="flex break-all flex-row justify-between">
              {comment.text}
              <span className="flex justify-end text-xs text-current">{formatDate(comment.created_at)}</span>
            </div>
          </div>
        ))}
        {post.comments.length > visibleCommentsCount && (
          <button
            className="text-blue-700 cursor-pointer"
            onClick={() => {
              loadMoreComments();
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
  );
};

export default CommentSection;
