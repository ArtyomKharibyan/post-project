import React from "react";
import {format} from "date-fns";

interface CommentSectionProps {
    comments: Comment[];
    visibleCommentsCount: number;
    loadMoreComments: () => void;
}

interface Comment {
    userName: string;
    userSurname: string;
    text: string;
    created_at: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({
                                                           comments,
                                                           visibleCommentsCount,
                                                           loadMoreComments,
                                                       }) => {
    return (
        <div className="text-gray-600 mt-4">
            {comments.slice(0, visibleCommentsCount).map((comment, index) => (
                <div key={index} className="mb-2 bg-slate-100 relative right-2 rounded-2xl p-2">
                    <strong>User: {`${comment?.userName} ${comment?.userSurname}`}</strong>
                    <br/>
                    <div className="flex break-all flex-row justify-between">
                        {comment.text}
                        <span className="flex justify-end text-xs text-current">
              {format(new Date(comment.created_at), "HH:mm")}
            </span>
                    </div>
                </div>
            ))}
            {comments.length > visibleCommentsCount && (
                <button className="text-blue-700 cursor-pointer" onClick={loadMoreComments}>
                    Show more comments
                </button>
            )}
        </div>
    );
};

export default CommentSection;
