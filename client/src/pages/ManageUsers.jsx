import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AccountNav from '../components/AccountNav/AccountNav';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/customers');
        setUsers(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchHosts = async () => {
      try {
        const response = await axios.get('/hosts');
        setHosts(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
    fetchHosts();
  }, []);

  const toggleStatus = async (id, currentStatus, type) => {
    try {
      const newStatus = currentStatus === 'active' ? 'deactivated' : 'active';
      const response = await axios.put(`/auth/updateStatus/${id}`, { status: newStatus });
      const updatedUser = response.data;
      console.log(updatedUser);

      // Update the UI
      if (type === 'user') {
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user._id === id ? { ...user, status: updatedUser.status } : user))
        );
      } else if (type === 'host') {
        setHosts((prevHosts) =>
          prevHosts.map((host) => (host._id === id ? { ...host, status: updatedUser.status } : host))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div>
      <AccountNav />

      <div className="container flex justify-around p-4">
        <div>
          <h2 className="text-2xl font-bold mb-4">User Table</h2>
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">User Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className={`px-4 py-2 rounded ${
                        user.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                      } text-white`}
                      onClick={() => toggleStatus(user._id, user.status, 'user')}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Host Table</h2>
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Host Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {hosts.map((host) => (
                <tr key={host._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{host.name}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className={`px-4 py-2 rounded ${
                        host.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                      } text-white`}
                      onClick={() => toggleStatus(host._id, host.status, 'host')}
                    >
                      {host.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
