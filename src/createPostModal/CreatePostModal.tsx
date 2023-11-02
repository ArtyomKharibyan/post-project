import React, {useEffect, useState} from "react";
import axiosInstance from "../components/server/axios";
import {UserAuth} from "../context/UserAuthContext";
import {useNavigate} from "react-router-dom";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "../firebase/firebase";
import Notification from "../components/notification/Notification";

interface ModalProps {
	showModal: boolean;
	setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
	title: string;
	setTitle: React.Dispatch<React.SetStateAction<string>>;
	imageUrl: string | null;
	setImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
	postText: string;
	setPostText: React.Dispatch<React.SetStateAction<string>>;
	getPost: () => Promise<void>;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
	resetForm: () => void;
}


const CreatePostModal: React.FC<ModalProps> = ({
showModal,
setShowModal,
title,
setTitle,
imageUrl,
postText,
setPostText,
getPost,
setCurrentPage,
resetForm,
setImageUrl,

                                              }) => {

	const [showNotification, setShowNotification] = useState(false);
	const [image, setImage] = useState<File | null>(null);

	const {profileData} = UserAuth();
	const profileId = profileData?.id ?? null;

	const navigate = useNavigate();

	const postToServer = async () => {
		let updatedImageUrl = ""
		setImage(null)
		if(image) {
			updatedImageUrl = await handleImageChange(image) as string
		}
		try {
			await axiosInstance.post(
				`/post`,
				{
					title,
					imageUrl: updatedImageUrl ?? imageUrl,
					postText,
					profileId,
				}
			);

		} catch (error) {
			console.error("Network error:", error);
		}
	};

	const fileInputRef = React.useRef<HTMLInputElement | null>(null);

	const handleImageChange = async (file: File | undefined) => {
		if (file) {
			try {
				const imageRef = ref(storage, `images/${file.name}`);
				await uploadBytes(imageRef, file);
				const url = await getDownloadURL(imageRef);

				setImageUrl(url);
				return url as string;
			} catch (error) {
				console.error("Error uploading file:", error);
			}
		}
	};

	const clearImage = () => {
		setImageUrl(null);
	};

	useEffect(() => {

		const objectUrl: string | null = null;

		if(image) {
			const objectUrl = URL.createObjectURL(image)
			setImageUrl(objectUrl)
		}

		return () => {
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	},[image])

	const createPost = async () => {
		try {
        await postToServer();
				await getPost();
				setCurrentPage(1);
				resetForm();
				setShowModal(false);
				setShowNotification(true);

				setTimeout(() => {
					setShowNotification(false);
				}, 3000);

				navigate("/posts");
		} catch (error) {
			console.error("Error creating post: ", error);
		}
	};

	const handleChooseFile = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<>
			{showModal && (
				<div
					className="justify-center items-center flex fixed inset-0 z-50 outline-none outline-none overflow-y-auto max-h-screen"
				>
					<div className="relative w-auto my-6 mx-auto max-w-3xl">
						<div
							className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none"
						>
							<div
								className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t"
							>
								<h3 className="text-3xl font-semibold">Create Post</h3>
							</div>
							<div className="overflow-y-auto overflow-x-hidden relative w-96 p-3 h-96">
								<div className="flex flex-col">
									<div className="flex flex-col h-24 p-1">
										<input
											className="border-2 border-silver rounded-md p-1 z-0"
											placeholder="Title..."
											value={title}
											onChange={(event) => {
												setTitle(event.target.value);
											}}
										/>
									</div>
									<div className="w-full max-h-[300px] overflow-y-auto">
										<form onSubmit={(e) => {
											e.preventDefault();
											createPost()
										}}>
											<input
												className="overflow-x-hidden flex justify-center items-center overflow-y-auto"
												type="file"
												ref={fileInputRef}
												key={imageUrl || undefined}
												onChange={(event) => {
													if (event?.target?.files?.[0]) {
														setImage(event.target.files[0]);
													}
												}}
												style={{display: "none"}}
											/>
										</form>
										{imageUrl && (
											<div className="relative">
												<img
													className="w-full h-full"
													src={imageUrl}
													alt="Selected"
												/>
												<button
													className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full"
													onClick={clearImage}
												>
													Clear
												</button>
											</div>
										)}
									</div>
									<div className="flex justify-between">
										<button
											onClick={handleChooseFile}
											className="bg-blue-500 w-full text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
										>
											Choose Image
										</button>
									</div>
								</div>
								<div className="flex flex-col h-52">
									<p className="flex justify-left text-white">Content:</p>
									<textarea
										value={postText}
										onChange={(event) => {
											setPostText(event.target.value);
										}}
										placeholder="Content..."
										className="border-2 border-silver rounded-sm h-40 resize-none rounded-md"
									/>
								</div>
							</div>
							<div
								className="flex items-center justify-between p-6 border-t border-solid border-slate-200 rounded-b"
							>
								<button
									className="text-slate-100 bg-red-600 background-transparent font-bold uppercase rounded px-6 py-2  text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
									type="button"
									onClick={() => setShowModal(false)}
								>
									Close
								</button>
								<button
									className={`bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 ${
										(!title || !postText) ? 'opacity-60' : ''
									}`}
									type="button"
									onClick={() => createPost()}
									disabled={!title || !postText}
								>
									Create Post
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			<Notification show={showNotification} />
		</>
	);
};

export default CreatePostModal;
