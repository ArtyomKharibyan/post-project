import React, {ChangeEvent, useState} from "react"
import {Post as PostType} from "../pages/Posts"
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "../../firebase/firebase";

interface EditPostProps {
    editingPost: PostType | null;
    setEditingPost: React.Dispatch<React.SetStateAction<PostType | null>>;
    tempImageUrl: string | null;
    setTempImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
    setImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
    handleSubmitEdit: () => void;
    editCancel: () => void,
    imageUrl: string | null;
}

const EditPost: React.FC<EditPostProps> = ({
                                               editingPost,
                                               setEditingPost,
                                               tempImageUrl,
                                               setTempImageUrl,
                                               setImageUrl,
                                               handleSubmitEdit,
                                               editCancel,
                                           }) => {

    const [isUploading, setIsUploading] = useState(false);

    const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setIsUploading(true);
                const imageRef = ref(storage, `images/${file.name}`);
                await uploadBytes(imageRef, file);
                const url = await getDownloadURL(imageRef);

                setTempImageUrl(url);
                setImageUrl(url);

                setEditingPost((prevEditingPost) => {
                    if (prevEditingPost) {
                        return {
                            ...prevEditingPost,
                            imageUrl: url,
                        };
                    }
                    return prevEditingPost;
                });
            } catch (error) {
                console.error("Error uploading file:", error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div>
            {editingPost && (
                <div className="fixed inset-0 flex justify-center items-center">
                    <div className="grid bg-white shadow-lg rounded-lg h-max w-max">
                        <h2 className="text-2xl font-semibold h-10 relative top-3 left-2">Edit Post</h2>
                        <div className="grid items-center py-8 justify-center">
                            <div className="grid p-3 justify-items-center">
                                <input
                                    placeholder="Title..."
                                    className="h-8 relative bottom-4 w-96 border border-silver-300 rounded-md"
                                    type="text"
                                    value={editingPost.title}
                                    onChange={(e) =>
                                        setEditingPost({...editingPost, title: e.target.value})
                                    }
                                />
                                {tempImageUrl && (
                                    <img className="w-40 h-40 mb-2" src={tempImageUrl} alt="Selected"/>
                                )}
                                {isUploading && <p>Uploading...</p>}
                                <div className="flex flex-col items-center">
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        handleImageChange(e as unknown as ChangeEvent<HTMLInputElement>);
                                        handleSubmitEdit()
                                    }}>

                                        <input
                                            type="file"
                                            id="file-input"
                                            name="file-input"
                                            className="hidden"
                                            onChange={(event) => {
                                                if (event?.target?.files?.[0]) {
                                                    handleImageChange(event);
                                                }
                                            }}
                                        />

                                        <label
                                            htmlFor="file-input"
                                            className="bg-blue-500 text-white rounded-md py-2 px-4 cursor-pointer hover:bg-blue-700 transition duration-300 ease-in-out"
                                        >
                                            Select a File
                                        </label>

                                    </form>
                                </div>

                                <textarea
                                    placeholder="PostText..."
                                    className="resize-none border relative top-4 border-silver-300 w-96 h-24 rounded-md"
                                    value={editingPost.postText}
                                    onChange={(e) =>
                                        setEditingPost({...editingPost, postText: e.target.value})
                                    }
                                />
                            </div>
                        </div>

                        <div className=" justify-center items-center w-full">
                            <div className="flex justify-around p-2 relative bottom-3 w-full">
                                <button
                                    className="bg-blue-500 text-white w-32 p-2"
                                    onClick={handleSubmitEdit}
                                >
                                    Save
                                </button>
                                <button
                                    className=" bg-red-500 text-white w-32 p-2"
                                    onClick={editCancel}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EditPost