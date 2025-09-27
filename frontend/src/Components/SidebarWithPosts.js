import React, { useState } from 'react';
import MyPosts from './MyPosts';

const SidebarWithPosts = () => {
  const [scrollToPostId, setScrollToPostId] = useState(null);

  const handlePostClick = (postId) => {
    setScrollToPostId(postId);
  };

  const postList = [
    { id: '123', title: 'Post 1' },
    { id: '456', title: 'Post 2' },
    // etc.
  ];

  return (
    <div className="container flex">
      <aside className="w-1/4 p-4 border-r border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-2">My Posts</h3>
        <ul>
          {postList.map((post) => (
            <li key={post.id}>
              <button
                onClick={() => handlePostClick(post.id)}
                className="text-blue-600 hover:underline text-sm mb-1"
              >
                {post.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1">
        <MyPosts scrollToPostId={scrollToPostId} />
      </main>
    </div>
  );
};

export default SidebarWithPosts;
