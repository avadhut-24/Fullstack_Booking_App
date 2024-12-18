import React from 'react'
import { useNavigate } from 'react-router-dom'



const Mainlogin = () => {
    const navigate = useNavigate();  

    const handleAdmin = ()=>{
       navigate('/adminlogin');
    }
    const handleHost = ()=>{
       navigate('/hostlogin');
    }
    const handleCustomer = ()=>{
       navigate('/customerlogin');
    }

  return (
    <div className='flex flex-col justify-center'>
        <h1> This is Mainlogin</h1>
        <div className="flex justify-between items-center"> 
            <button onClick={handleAdmin}> Admin </button>
            <button onClick={handleHost}> Host </button>
            <button onClick={handleCustomer}> User </button>

        </div>
        



    </div>
  )
}

export default Mainlogin