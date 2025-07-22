import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReviewSection = ({place, user, placeid}) => {
//   const [reviews, setReviews] = useState([]); // To store all customer reviews
  const userName = user.name;

  const [reviews, setReviews] = useState(place.reviews || []);
  useEffect(() => {
    setReviews(place.reviews || []);
  }, [place.reviews]);

  
  const [review, setReview] = useState(''); // For the current review input
  const [rating, setRating] = useState(0); // For the current rating input
  const [loading, setLoading] = useState(false); // Loading state for submission
  const [message, setMessage] = useState(''); // Success/error message

  const [editingId, setEditingId] = useState(null); // Which review is being edited
  const [editReview, setEditReview] = useState(''); // Edit review text
  const [editRating, setEditRating] = useState(0); // Edit review rating

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);



  const handleReviewSubmit = async () => {
    console.log(place);
    console.log(userName);
    console.log(placeid);
    if (!review || rating <= 0) {
      setMessage('Please provide a valid review and rating.');
      return;
    }

    const reviewData = {
      review,
      rating,
      userName,
    };

    try {
      setLoading(true);

      const response = await axios.post(`places/reviews/add/${placeid}`, reviewData);
      setMessage('Review submitted successfully!');
      setReview('');
      setRating(0);
      // Update local reviews state
      setReviews(response.data);

    //   fetchReviews(); // Refresh the reviews after submission
    } catch (error) {
        console.log(error);
      setMessage('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete review handler
  const handleDeleteReview = async (reviewId) => {
    try {
      setLoading(true);
      const response = await axios.delete(`places/reviews/delete/${placeid}/${reviewId}`);
      setMessage('Review deleted successfully!');
      setReviews(response.data);
    } catch (error) {
      setMessage('Failed to delete review.');
    } finally {
      setLoading(false);
    }
  };

  // Start editing a review
  const handleEditClick = (reviewId, rev) => {
    setEditingId(reviewId);
    setEditReview(rev.review);
    setEditRating(rev.rating);
  };

  // Submit edited review
  const handleEditSubmit = async (reviewId) => {
    try {
      setLoading(true);
      const response = await axios.put(`places/reviews/update/${placeid}/${reviewId}`, {
        review: editReview,
        rating: editRating,
        userName: userName,
      });
      setMessage('Review updated successfully!');
      setEditingId(null);
      // Update local reviews state
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? response.data : r)));
    } catch (error) {
      setMessage('Failed to update review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl ml-16 p-6 bg-white shadow-md rounded-lg">
      {message && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-800 border border-green-300 text-center font-medium">
          {message}
        </div>
      )}
      <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>

      {/* Write Review Section */}
      <div className="mb-6 border-b pb-4">
        <h3 className="text-xl font-medium mb-2">Write a Review</h3>

        <textarea
          className="w-full border border-gray-300 rounded-md p-2 mb-4"
          rows="4"
          placeholder="Write your review here..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        ></textarea>

        <div className="flex items-center mb-4">
          <label className="mr-2 font-medium">Rating:</label>
          <input
            type="number"
            className="w-16 border border-gray-300 rounded-md p-1 text-center"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />
          <span className="ml-2 text-gray-500">/ 5</span>
        </div>

        {message && <p className="text-sm mb-4">{message}</p>}

        <button
          className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleReviewSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>

      {/* List of Reviews */}
      <div>
        {reviews?.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev._id} className="border-b pb-4 mb-4">
                <div className="flex items-center mb-2">
                    {/* Customer SVG Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 14c3.866 0 7 2.239 7 5v1a1 1 0 01-1 1H2a1 1 0 01-1-1v-1c0-2.761 3.134-5 7-5m7-4a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h6 className="font-medium">{rev.userName}</h6>
                </div>
                <div className="flex items-center text-yellow-500">
                    {'★'.repeat(rev.rating)}{' '}
                    <span className="ml-2 text-gray-500">({rev.rating}/5)</span>
                </div>
                {editingId === rev._id ? (
                  <div className="my-2">
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-2 mb-2"
                      rows="3"
                      value={editReview}
                      onChange={(e) => setEditReview(e.target.value)}
                    ></textarea>
                    <input
                      type="number"
                      className="w-16 border border-gray-300 rounded-md p-1 text-center mb-2"
                      min="1"
                      max="5"
                      value={editRating}
                      onChange={(e) => setEditRating(Number(e.target.value))}
                    />
                    <button
                      className="bg-green-500 text-white py-1 px-3 rounded mr-2"
                      onClick={() => handleEditSubmit(rev._id)}
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-400 text-white py-1 px-3 rounded"
                      onClick={() => setEditingId(null)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-1">{rev.review}</p>
                    {userName === rev.userName && (
                      <>
                        <button
                          className="bg-yellow-500 text-white py-1 px-3 rounded mr-2"
                          onClick={() => handleEditClick(rev._id, rev)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white py-1 px-3 rounded"
                          onClick={() => handleDeleteReview(rev._id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </>
                )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
