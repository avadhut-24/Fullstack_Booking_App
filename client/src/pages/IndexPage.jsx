
import {useEffect, useState} from "react";
import axios from "axios";
import {Link} from "react-router-dom";
import Image from "../components/Image.jsx";
import {useContext} from "react";
import {UserContext} from "../UserContext.jsx";

export default function IndexPage() {
  const [places,setPlaces] = useState([]);
  useEffect(() => {
    axios.get('/places').then(response => {
      setPlaces(response.data);
      console.log(response.data);
    });
  }, []);

  const {user} = useContext(UserContext);

  return (
    <div>
      <header className="flex justify-between mt-3 mx-5">
      <Link to={'/index'} className="flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 -rotate-90">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
        <span className="font-bold text-xl">airbnb</span>
      </Link>
      <div className="flex gap-2 border border-gray-300 rounded-full py-2 px-4 shadow-md shadow-gray-300">
        <div>Anywhere</div>
        <div className="border-l border-gray-300"></div>
        <div>Any week</div>
        <div className="border-l border-gray-300"></div>
        <div>Add guests</div>
        <button className="bg-primary text-white p-1 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </div>
      <Link to={user?'/account':'/'} className="flex items-center gap-2 border border-gray-300 rounded-full py-2 px-4 ">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        <div className="bg-gray-500 text-white rounded-full border border-gray-500 overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 relative top-1">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
          </svg>
        </div>
        {!!user && (
          <div>
            {user.name}
          </div>
        )}
      </Link>
      </header>

      <div className="mt-8 mx-5 grid gap-x-14 gap-y-8 grid-cols-3 md:grid-cols-3 lg:grid-cols-3">
      {places.length > 0 && places.map(place => (
        <Link to={'/place/' + place._id} key={place._id} className="group">
          {/* Image Container */}
          <div className="bg-gray-500 rounded-2xl overflow-hidden">
            {place.photos?.[0] && (
              <img
                className="h-[200px] w-full object-cover"
                src={place.photosPURLs[0]}
                alt=""
                
              />
            )}
          </div>
          {/* Text Details */}
          <h2 className="font-bold mt-2">{place.address}</h2>
          <h3 className="text-sm text-gray-500">{place.title}</h3>
          <div className="mt-1">
            <span className="font-bold">${place.price}</span> per night
          </div>
        </Link>
      ))}
  </div>  
</div>
  );
}
