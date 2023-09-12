import React, { useState } from 'react';
import './App.css';
import Header from "./components/Header";
import Feed from "./components/Feed";
import Post from "./components/Post";

function App() {
    const [selectedPost, setSelectedPost] = useState<{ id: string; title: string; postText: string } | null>(null);

    return (
        <div className="h-800">
            <Header/>
            <div className="flex">
                <Feed onSelectPost={setSelectedPost} />
                <Post selectPostMessage={selectedPost} />
            </div>
        </div>
    );
}

export default App;
