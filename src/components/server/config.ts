import axios from "axios";

const API_URL = "http://192.168.10.146:5000/api";

const ApiService = axios.create({
    baseURL: API_URL,
});

export const getPosts = async () => {
    try {
        const response = await ApiService.get("/post");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCommentsForPost = async (postId: string) => {
    try {
        const response = await ApiService.get(`/comment/${postId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deletePost = async (postId: string) => {
    try {
        await ApiService.delete(`/post/${postId}`);
    } catch (error) {
        throw error;
    }
};

export const editPost = async (postId: string, data: { title: string, postText: string }) => {
    try {
        await ApiService.patch(`/post/${postId}`, data);
    } catch (error) {
        throw error;
    }
};

export const addComment = async (postId: string, commentText: string, profileId: string) => {
    try {
        await ApiService.post("/comment", {
            text: commentText,
            profileId: profileId,
            postId: postId,
        });
    } catch (error) {
        throw error;
    }
};

export default ApiService;
