import React from 'react';
import { useNavigate } from 'react-router-dom';

const Mainlogin = () => {
  const navigate = useNavigate();

  const handleAdmin = () => {
    navigate('/adminlogin');
  };
  const handleHost = () => {
    navigate('/hostlogin');
  };
  const handleCustomer = () => {
    navigate('/customerlogin');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Welcome to the Login Page</h1>
      <div className="w-80 bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-700 text-lg mb-4 text-center">Choose your login type:</p>
        <div className="flex flex-col gap-4">
          <button
            onClick={handleAdmin}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200"
          >
            Admin
          </button>
          <button
            onClick={handleHost}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200"
          >
            Host
          </button>
          <button
            onClick={handleCustomer}
            className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200"
          >
            User
          </button>
        </div>
      </div>
    </div>
  );
};

export default Mainlogin;
