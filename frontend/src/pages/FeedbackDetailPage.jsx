import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFeedbackDetails, addComment } from '../api';
import { useAuth } from '../contexts/AuthContext';

const FeedbackDetailPage = () => {
  const { id } = useParams();
  const [feedback, setFeedback] = useState(null);
  const [comment, setComment] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await getFeedbackDetails(id);
        setFeedback(data);
      } catch (error) {
        // console.error('Error fetching feedback details:', error);
      }
    };
    fetchFeedback();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const newComment = await addComment(id, comment);
      setFeedback(prevFeedback => ({
        ...prevFeedback,
        comments: [...(prevFeedback.comments || []), newComment]
      }));
      setComment('');
    } catch (error) {
      // console.error('Failed to add comment:', error);
    }
  };

  if (!feedback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-2">{feedback.title}</h1>
        <p className="text-gray-700 mb-4">{feedback.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Upvotes: {feedback.upvotes}</span>
          <span>Status: {feedback.status}</span>
          <span>Category: {feedback.category}</span>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        <div className="space-y-4">
          {feedback.comments && feedback.comments.map(c => (
            <div key={c.id} className="bg-gray-100 p-4 rounded-lg">
              <p>{c.content}</p>
              <p className="text-xs text-gray-500 mt-2">by {c.author.username} on {new Date(c.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      {user && (
        <form onSubmit={handleCommentSubmit} className="mt-8">
          <h3 className="text-xl font-bold mb-2">Add a comment</h3>
          <textarea
            className="w-full p-2 border rounded-lg"
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
          ></textarea>
          <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Post Comment
          </button>
        </form>
      )}
    </div>
  );
};

export default FeedbackDetailPage;
