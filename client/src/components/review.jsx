import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReviewSection = ({place, user, placeid}) => {
//   const [reviews, setReviews] = useState([]); // To store all customer reviews
  const userName = user.name;
  const reviews = place.review?.reviews; 
  
  const [review, setReview] = useState(''); // For the current review input
  const [rating, setRating] = useState(0); // For the current rating input
  const [loading, setLoading] = useState(false); // Loading state for submission
  const [message, setMessage] = useState(''); // Success/error message


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
      const response = await axios.post(`/reviews/${placeid}`, reviewData);
      setMessage('Review submitted successfully!');
      setReview('');
      setRating(0);
    //   fetchReviews(); // Refresh the reviews after submission
    } catch (error) {
        console.log(error);
      setMessage('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl ml-16 p-6 bg-white shadow-md rounded-lg">
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

        {message && <p className="text-sm mb-4 text-red-500">{message}</p>}

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
          reviews.map((rev, index) => (
            <div key={index} className="border-b pb-4 mb-4">
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
                <p className="text-lg font-medium mb-1">{rev.text}</p>
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
