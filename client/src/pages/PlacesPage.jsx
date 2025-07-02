import {Link, useParams} from "react-router-dom";
import AccountNav from "../AccountNav";
import {useEffect, useState} from "react";
import axios from "axios";
import PlaceImg from "../PlaceImg";
export default function PlacesPage() {
  const [places,setPlaces] = useState([]);
  useEffect(() => {
    axios.get('/places/user-places').then(({data}) => {
      setPlaces(data);
    });
  }, []);
  return (
    <div>
      <AccountNav />
        <div className="text-center">
          <Link className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full" to={'/account/places/new'}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            Add new place
          </Link>
        </div>
        <div className="mt-4 grid gap-x-8 gap-y-8 grid-cols-3 mx-5">
          {places.length > 0 && places.map(place => (
            <Link to={'/account/places/'+place._id} className="cursor-pointer gap-4 bg-gray-100 p-4 rounded-2xl">
             
                <div>
                  {/* <PlaceImg place={place} className={"h-[200px] w-full object-cover"} /> */}
                  {console.log(place)}
                  <img src={place.photosPURLs?.[0]} alt="" />
                  <h2 className="font-bold mt-2">{place.address}</h2>
                  <h3 className="text-sm text-gray-500">{place.title}</h3>
                  <div className="mt-1">
                    <span className="font-bold">${place.price}</span> per night
                  </div>
                </div>
             
            </Link>
          ))}
        </div>
    </div>
  );
}