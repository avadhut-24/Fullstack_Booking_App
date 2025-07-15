import {useContext, useEffect, useState} from "react";
import {differenceInCalendarDays} from "date-fns";
import axios from "axios";
import {Navigate} from "react-router-dom";
import {UserContext} from "./UserContext.jsx";


export default function BookingWidget({place}) {
  const [checkIn,setCheckIn] = useState('');
  const [checkOut,setCheckOut] = useState('');
  const [numberOfGuests,setNumberOfGuests] = useState(1);
  const [name,setName] = useState('');
  const [phone,setPhone] = useState('');
  const [redirect,setRedirect] = useState('');
  const {user} = useContext(UserContext);

  useEffect(() => {
    
    if (user) {
      console.log(user);
      setName(user.name);
    }
  }, [user]);

  let numberOfNights = 0;
  if (checkIn && checkOut) {
    numberOfNights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
  }

  const [amount, setAmount] = useState(500); // Amount in smallest unit (e.g., ₹5.00 = 500)

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded correctly");
      return;
    }

    try {   
      // Call backend to create order
      const { data } = await axios.post('/bookings/createOrder', { amount });
      console.log(data);

      // Check if order was created successfully
      if (!data.success) {
        alert('Unable to create order. Please try again.');
        return;
      }

      // const { order } = data; // Order object from backend
      // console.log(order);
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;


      // Initialize Razorpay payment
      const options = {
        key: razorpayKey, // Replace with your Razorpay API Key
        amount: data.amount, // Payment amount in the smallest unit
        currency: data.currency, // Currency (e.g., INR)
        name: 'Booking App',
        description: 'Test Transaction',
        order_id: data.orderId, // Order ID from Razorpay
        handler: async function (response) {
          try {
            // Extract the payment details from Razorpay's response
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
        
            // Call your backend to save booking details
            const bookingResponse = await axios.post('/bookings', {
              checkIn,
              checkOut,
              numberOfGuests,
              name,
              phone,
              place: place._id,
              price: numberOfNights * place.price,
              paymentDetails: {
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
              }, // Pass payment details to store in the backend
            })
        
            console.log(bookingResponse);
            // Extract the booking ID from the backend response
            const bookingId = bookingResponse.data._id;
        
            // Redirect the user to their bookings page
            setRedirect(`/account/bookings/${bookingId}`);
            alert('Payment Successful! Booking saved in the database.');
          } catch (error) {
            console.error('Error saving booking details:', error);
            alert('Payment succeeded but there was an issue saving the booking. Please contact support.');
          }
        }
        ,
        prefill: {
          name: 'Your Name', // Prefill customer details
          email: 'youremail@example.com',
          contact: '9876543210',
        },
        notes: {
          address: 'Your Address',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.log('Error in payment:', error);
      alert('Payment failed. Please try again.');
    }
  };


  async function bookThisPlace() {
    const response = await axios.post('/bookings', {
      checkIn,checkOut,numberOfGuests,name,phone,
      place:place._id,
      price:numberOfNights * place.price,
    });
    const bookingId = response.data._id;
    setRedirect(`/account/bookings/${bookingId}`);
  }

  if (redirect) {
    return <Navigate to={redirect} />
  }

  if(user.role == "Admin") return null;

  return (
    <div className="bg-white shadow p-4 rounded-2xl">
      <div className="text-2xl text-center">
        Price: ${place.price} / per night
      </div>
      <div className="border rounded-2xl mt-4">
        <div className="flex">
          <div className="py-3 px-4">
            <label>Check in:</label>
            <input type="date"
                   value={checkIn}
                   onChange={ev => setCheckIn(ev.target.value)}/>
          </div>
          <div className="py-3 px-4 border-l">
            <label>Check out:</label>
            <input type="date" value={checkOut}
                   onChange={ev => setCheckOut(ev.target.value)}/>
          </div>
        </div>
        <div className="py-3 px-4 border-t">
          <label>Number of guests:</label>
          <input type="number"
                 value={numberOfGuests}
                 onChange={ev => setNumberOfGuests(ev.target.value)}/>
        </div>
        {numberOfNights > 0 && (
          <div className="py-3 px-4 border-t">
            <label>Your full name:</label>
            <input type="text"
                   value={name}
                   onChange={ev => setName(ev.target.value)}/>
            <label>Phone number:</label>
            <input type="tel"
                   value={phone}
                   onChange={ev => setPhone(ev.target.value)}/>
          </div>
        )}
      </div>
      <button onClick={handlePayment} className="primary mt-4">
        Book this place
        {numberOfNights > 0 && (
          <span> ${numberOfNights * place.price}</span>
        )}
      </button>
    </div>
  );
}