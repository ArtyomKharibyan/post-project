import React from "react";

type PostProps = {
    selectPostMessage: { id: string; title: string; postText: string } | null;
};

const Post: React.FC<PostProps> = ({ selectPostMessage }) => {
    return (
        <div>
            <div className="w-full p-3 bg-blue-200">
                {selectPostMessage ? (
                    <>
                        <p className="text-slate-800">{selectPostMessage.title}</p>
                        <p className="text-slate-800">{selectPostMessage.postText}</p>
                    </>
                ) : (
                    <p className="text-slate-800">No post selected</p>
                )}
            </div>
        </div>
    );
};

export default Post;
