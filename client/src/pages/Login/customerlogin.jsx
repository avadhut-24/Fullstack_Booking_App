import React from 'react'
import {Link, Navigate} from "react-router-dom";
import {useContext, useState} from "react";
import axios from "axios";
import {UserContext} from "../../UserContext.jsx";

const customerlogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const role = "Customer";
  const [redirect, setRedirect] = useState(false);
  const {setUser} = useContext(UserContext);
  async function handleLoginSubmit(ev) {
    ev.preventDefault();
    try {
      const {data} = await axios.post('/login', {email,password, role});
      setUser(data);
      alert('Login successful');
      console.log(data);
      
      setRedirect(true);
    } catch (e) {
      alert('Login failed');
      console.log(e);
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
          Don't have an account yet? <Link className="underline text-black" to={'/customerregister'}>Register now</Link>
        </div>
      </form>
    </div>
  </div>
)
}

export default customerlogin