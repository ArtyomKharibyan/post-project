import React, {useEffect, useState} from "react"
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "../../firebase/firebase";
import {UserAuth} from "../../context/UserAuthContext";
import {Post} from "../pages/Posts";
import axiosInstance from "../server/axios";

interface EditPostProps {
	title: string;
	postText: string;
	setPostData: React.Dispatch<React.SetStateAction<Post[]>>;
	setTitle: React.Dispatch<React.SetStateAction<string>>;
	setPostText: React.Dispatch<React.SetStateAction<string>>;
	currentPage: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
	editingPost: Post | null;
	onEditingPostChange: (post: Post | null) => void;
}


const EditModal: React.FC<EditPostProps> = ({
setPostData,
title,
postText,
setTitle,
setPostText,
currentPage,
	setCurrentPage,
	editingPost,
	onEditingPostChange,
	}) => {

	const { profileData} = UserAuth()
	const [editedImageUrl, setEditedImageUrl] = useState<string | null>(editingPost?.imageUrl || null);
	const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [image, setImage] = useState<File>()
	
	const profileId = profileData?.id || null;

	const handleImageChange = async (file: File | undefined) => {
		if (file) {
			try {
				setIsUploading(true);
				const imageRef = ref(storage, `images/${file.name}`);
				await uploadBytes(imageRef, file);
				const url = await getDownloadURL(imageRef);

				return url as string
			} catch (error) {
				console.error("Error uploading file:", error);
			} finally {
				setIsUploading(false);
			}
		}
	};

	useEffect(() => {

		const objectUrl: string | null = null;

		if(image) {
			const objectUrl = URL.createObjectURL(image)
			setTempImageUrl(objectUrl)
		}

		return () => {
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	},[image])

	const handleSubmitEdit = async () => {
		try {
			let updatedImageUrl = ""
			if(image) {
				updatedImageUrl = await handleImageChange(image) as string
			}
			await axiosInstance.patch(`/post/${editingPost?.id}`, {
				title: title,
				postText: postText,
				imageUrl: updatedImageUrl ?? editedImageUrl,
			});

			const response = await axiosInstance.get(`/post/${profileId}?page=${currentPage}`);
			setPostData(response.data);

			setCurrentPage(1)
			onEditingPostChange(null);
			setEditedImageUrl(null);
			setTempImageUrl(null);
		} catch (error) {
			console.error("Error editing post: ", error);
		}
	};

	useEffect(() => {
		if (editingPost) {
			setEditedImageUrl(editingPost.imageUrl || null);
			setTitle(editingPost.title);
			setPostText(editingPost.postText);
		}
	}, [editingPost]);

	const editCancel = () => {
		onEditingPostChange(null)
		setEditedImageUrl(null);
		setTempImageUrl(null);
	}

	const clearImage = () => {
		setTempImageUrl(null)
	}

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
										onEditingPostChange({...editingPost, title: e.target.value})
									}
								/>
								{tempImageUrl && (
									<div className = "relative">
									<img className="w-40 h-40 mb-2" src={tempImageUrl} alt="Selected"/>

									<button
									className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full"
									onClick={clearImage}
									>
									Clear
									</button>
									</div>
								)}
								{isUploading && <p>Uploading...</p>}
								<div className="flex flex-col items-center">

										<input
											type="file"
											id="file-input"
											name="file-input"
											className="hidden"
											onChange={(event) => {
												if (event?.target?.files?.[0]) {
													setImage(event.target.files[0]);
												}
											}}
										/>

										<label
											htmlFor="file-input"
											className="bg-blue-500 text-white rounded-md py-2 px-4 cursor-pointer hover:bg-blue-700 transition duration-300 ease-in-out"
										>
											Select a File
										</label>
								</div>

								<textarea
									placeholder="PostText..."
									className="resize-none border relative top-4 border-silver-300 w-96 h-24 rounded-md"
									value={editingPost.postText}
									onChange={(e) =>
										onEditingPostChange({...editingPost, postText: e.target.value})
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

export default EditModal