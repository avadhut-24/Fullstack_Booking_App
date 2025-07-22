import React from 'react'
import {Link, Navigate, useLocation} from "react-router-dom";
import {useContext, useState} from "react";
import axios from "axios";
import {UserContext} from "../../UserContext.jsx";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const role = useLocation().state?.role;
  const [redirect, setRedirect] = useState(false);
  const {setUser} = useContext(UserContext);
  async function handleLoginSubmit(ev) {
    ev.preventDefault();
    try {
        const { data } = await axios.post('/auth/login', { email, password, role }, { withCredentials: true });
        setUser(data);
        alert('Login successful');
        setRedirect(true);
    } catch (e) {
        // Log the full error object for debugging
        console.error('Error object:', e);

        // Check for specific response properties
        if (e.response) {
            const { status, data: responseData } = e.response;

            if (status === 403 && responseData === 'Account deactivated') {
                alert('Your account has been deactivated. Please contact support.');
            } else if (status === 422) {
                alert('Incorrect email, password, or role.');
            } else {
                alert(`Login failed with error: ${responseData}`);
            }
        } else {
            alert('Login failed. Please check your network connection.');
        }
    }
}

  if (redirect) {
    return <Navigate to={'/index'} />
  }
  
return (
  <div className="mt-4 grow flex items-center justify-around">
    <div className="mb-64">
      <h1 className="text-4xl text-center mb-4">Login</h1>
      <form className="max-w-md mx-auto" onSubmit={handleLoginSubmit}>
        <input type="email"
               placeholder="your@email.com"
               value={email}
               onChange={ev => setEmail(ev.target.value)} />
        <input type="password"
               placeholder="password"
               value={password}
               onChange={ev => setPassword(ev.target.value)} />
        <button className="primary">Login</button>
        <div className="text-center py-2 text-gray-500">
        Don't have an account yet? <Link className="underline text-black" to={'/register'} state={{ role: role }}>Register now</Link>
        </div>
      </form>
    </div>
  </div>
)
}

export default LoginPage