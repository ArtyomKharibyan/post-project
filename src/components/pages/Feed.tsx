import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import FeedPosts from "../feedPosts/FeedPosts"
import axiosInstance from "../server/axios";
import showErrorToast from "../toastService/toastService";
import { Post } from "./Posts";

const Feed: React.FC = () => {
  const [postList, setPostList] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [allDataCount, setAllDataCount] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
	
  const getPosts = async (page: number) => {
    try {
      const { data } = await axiosInstance.get(`/feed?page=${page}`);
      if (data.posts) {
        const posts = data.posts.map((post: Post) => ({
          ...post,
        })) as Post[];
        setAllDataCount(data.countAllData)
        if (page === 1) {
          setPostList(posts);
        } else {
          setPostList((prevPostList) => [...prevPostList, ...posts]);
        }
      } else {
        showErrorToast("Error showing posts.")
        setPostList([]);
      }
    } catch (error) {
      showErrorToast("Error showing posts.")
    }
  };
	
  useEffect(() => {
    getPosts(currentPage);
  }, [currentPage]);
	
  const fetchMoreData = () => {
    if (postList.length) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };
	
  useEffect(() => {
    if(allDataCount) {
      setHasMore(currentPage * 6 < allDataCount);
    } else {
      setHasMore(false)
    }
  },[currentPage, allDataCount])
	
  return (
    <div>
      <InfiniteScroll
        className="w-full flex-col flex justify-center items-center"
        dataLength={postList.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<p>Loading...</p>}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          {postList.map(post => (
            <FeedPosts post={post} setPostList={setPostList} key={post.id} />
          ))}
        </div>
			
      </InfiniteScroll>
    </div>
  );
};

export default Feed;
