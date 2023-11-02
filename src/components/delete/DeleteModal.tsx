import React, {FC} from "react";
import axiosInstance from "../server/axios";
import {Post} from "../pages/Posts";

interface DeleteModalProps {
	showDeleteModal: boolean;
	setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
	setPostData: React.Dispatch<React.SetStateAction<Post[]>>;
	selectedPost: Post | null;
}

const DeleteModal: FC<DeleteModalProps> = ({showDeleteModal, setShowDeleteModal, setPostData, selectedPost}) => {

	const handleDeletePost = async (postToDelete: Post | null): Promise<void> => {
		if (postToDelete !== null) {
			try {
				await axiosInstance.delete(`/post/${postToDelete.id}`);
				setPostData((prevPostData) =>
					prevPostData.filter((post) => post.id !== postToDelete.id)
				);
				setShowDeleteModal(false)
			} catch (error) {
				console.error("Error deleting post: ", error);
			}
		}
	};

	return (
		<>
			{showDeleteModal ? (
				<>
					<div
						className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
					>
						<div className="relative w-auto my-6 mx-auto max-w-3xl">
							<div
								className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
								<div
									className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
									<h3 className="text-3xl font-semibold">
										Delete Modal
									</h3>
									<button
										className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
										onClick={() => setShowDeleteModal(false)}
									>
                    <span
className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
									</button>
								</div>
								<div className="relative p-6 flex-auto">
									<p className="my-4 text-blueGray-500 text-lg leading-relaxed">
										Are you sure you want to delete?
									</p>
								</div>
								<div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
									<div className="flex p-2 w-full justify-around">
										<button
											className="text-slate-200 rounded bg-blue-500 font-bold uppercase px-6 py-3 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear outline-none transition-all duration-150"
											type="button"
											onClick={() => setShowDeleteModal(false)}
										>
											Close
										</button>
										<button
											className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
											type="button"
											onClick={() => handleDeletePost(selectedPost)}
										>
											Delete
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</>
			) : null}
		</>
	);
}

export default DeleteModal