import React, {useCallback, useEffect, useState} from "react";
import {UserAuth} from "../../context/UserAuthContext";
import EditModal from "../edit/EditModal";
import CreatePostModal from "../../createPostModal/CreatePostModal";
import InfiniteScroll from "react-infinite-scroll-component"
import DeleteModal from "../delete/DeleteModal"
import {Api_Url} from "../server/config"
import axios from "../server/axios";

export interface Post {
	id: number;
	imageUrl: string;
	postText: string;
	title: string;
	profileId?: number;
	name?: string;
	surname?: string;
	comment?: Comment[];
}

interface Comment {
	id: number;
	text: string;
	profileId: number;
	postId: number;
	userName?: string;
	userSurname?: string;
}

const Posts: React.FC = () => {
	const [showModal, setShowModal] = useState(false);
	const [title, setTitle] = useState<string>("");
	const [postText, setPostText] = useState<string>("");
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [postData, setPostData] = useState<Post[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [editingPost, setEditingPost] = useState<Post | null>(null);
	const [showDeleteModal, setShowDeleteModal] = React.useState(false);
	const [selectedPost, setSelectedPost] = useState<Post | null>(null);

	const {profileData} = UserAuth();
	const profileId = profileData?.id || null;

	const getPost = useCallback(async (isFetch?: boolean) => {
		try {
			if (profileId) {
				const response = await axios.get(`${Api_Url}/post/${profileId}?page=${currentPage}`);
				if (isFetch) {
					setPostData(prevState => [...prevState, ...response.data]);
				} else {
					setPostData(response.data);
				}
			}
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	}, [currentPage, profileId]);


	useEffect(() => {
		(async () => {
			if (currentPage === 1) {
				await getPost(false)
			} else {
				await getPost(true)
			}
		})();
	}, [getPost, currentPage]);

	const fetchMoreData = async () => {
		setCurrentPage(prevPage => prevPage + 1);
	};

	console.log(currentPage)

	const handleDeletePost = async (postToDelete: Post): Promise<void> => {
		setShowDeleteModal(true)
		setSelectedPost(postToDelete)
	}

	const resetForm = () => {
		setTitle("");
		setPostText("");
		setImageUrl(null);
	};

	const openCreatePostModal = () => {
		resetForm();
		setShowModal(true);
	};

	const handleEditingPostChange = (post: Post | null) => {
		setEditingPost(post);
	}

	return (
		<div>
			<div>
				<div className="flex justify-center items-center">
					<button
						className="bg-blue-500 text-white active:bg-blue-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 h-full"
						type="button"
						onClick={openCreatePostModal}
					>
						Create Post
					</button>
				</div>
				<div>
					<InfiniteScroll className="flex-col flex justify-center"
						dataLength={postData.length}
						next={fetchMoreData}
						hasMore={true}
						loader={<p className = "flex w-full bg-red  justify-center">Loading...</p>}
					>
						<div className="grid items-center justify-center grid-cols-1 md:grid-cols-1 gap-4 justify-items-center">
							<div className="grid grid-cols-1 gap-2 w-6/12 justify-items-center">
								<>
									{
										postData.map((post) => (
												<div
													key={post.id}
													className=" w-full bg-purple-200 border border-slate-300 my-4 rounded-3xl"
												>
													<div className="min-w-2xl">
														{post.imageUrl && (
															<img
																src={post.imageUrl}
																alt=""
																className="w-full rounded-tl-3xl rounded-tr-3xl h-full object-cover"
															/>
														)}

														<p className="text-xl font-semibold p-3">{post.title}</p>
														<div
															className="text-center p-5 text-gray-600 overflow-hidden line-clamp-3 break-all">
															{post.postText}
														</div>
														<>
															<div className="mt-4">
																{post.comment && post.comment.length > 0 && (
																	<div className="text-left text-gray-600 mb-2">
																		<h3
																			className="font-semibold text-slate-600 border-b border-solid border-zinc-700 rounded-sm w-full text-xl p-2 mb-2">Comments:</h3>
																		{post.comment.map((comment) => (
																			<div key={comment.id} className="p-2">
																				<div
																					className="font-semibold">{comment.userName} {comment.userSurname}</div>
																				{comment.text}
																				<div className="bg-slate-100 h-px w-full mt-4"/>
																			</div>
																		))}
																	</div>
																)}
															</div>
														</>
													</div>
													<div className="bg-slate-700 h-px w-full mt-4"/>
													<div className="mt-4 relative bottom-2 left-2">
														<button
															onClick={() => handleDeletePost(post)}
															className="mr-2 bg-red-500 text-white px-2 py-1 rounded"
														>
															Delete
														</button>
														<button
															onClick={() => handleEditingPostChange(post)}
															className="bg-blue-500 text-white px-2 py-1 rounded"
														>
															Edit
														</button>
													</div>
												</div>
											)
										)}
								</>
							</div>
						</div>
					</InfiniteScroll>
				</div>
			</div>

			<EditModal
				title={title}
				postText={postText}
				setTitle={setTitle}
				setPostData={setPostData}
				setPostText={setPostText}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
				editingPost={editingPost}
				onEditingPostChange={handleEditingPostChange}
			/>

			<CreatePostModal
				showModal={showModal}
				setShowModal={setShowModal}
				title={title}
				setTitle={setTitle}
				imageUrl={imageUrl}
				setImageUrl={setImageUrl}
				postText={postText}
				setPostText={setPostText}
				getPost={getPost}
				setCurrentPage={setCurrentPage}
				resetForm={resetForm}
			/>

			<DeleteModal
			showDeleteModal={showDeleteModal}
			setShowDeleteModal={setShowDeleteModal}
			selectedPost={selectedPost}
			setPostData={setPostData}/>
		</div>
	);
};

export default Posts