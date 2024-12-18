import React, { useEffect, useState } from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';
import AccountNav from '../AccountNav';


const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    const fetchdata = async () => {
      try{
        const response = await axios.get('/customers');
        console.log(response);
        setUsers(response.data);
      }
      catch(err){
         console.log(err);
      }
  }
  fetchdata();
  }, []);

  useEffect( ()=>{
    const fetchdata = async () =>{
      try{
        const response = await axios.get('/hosts');
        console.log(response);
        setHosts(response.data);
      }
      catch(err){
         console.log(err);
      }
    }
     
   fetchdata();  
  }, []);

  return (
    <div>
    <AccountNav/>
  

    <div className="container flex justify-around p-4">

    <div>
    <h2 className="text-2xl font-bold mb-4">User Table</h2>
    <table className="table-auto w-full border-collapse border border-gray-200">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-300 px-4 py-2 text-left">User Name</th>
          <th className="border border-gray-300 px-4 py-2 text-left">Deactivate</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
         
          <tr key={user.id} className="hover:bg-gray-50">
            <td className="border border-gray-300 px-4 py-2">{user.name}</td>
            <td className="border border-gray-300 px-4 py-2">
            <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Deactivate
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
          <th className="border border-gray-300 px-4 py-2 text-left">Deactivate</th>
        </tr>
      </thead>
      <tbody>
        {hosts.map((host) => (
          (
          <tr key={host.id} className="hover:bg-gray-50">
            <td className="border border-gray-300 px-4 py-2">{host.name}</td>
            <td className="border border-gray-300 px-4 py-2">
            <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Deactivate
            </button>
            </td>
          </tr>
         )
        ))}
      </tbody>
    </table>
    </div>

   </div>
    </div>
    
);
}

export default ManageUsers;

