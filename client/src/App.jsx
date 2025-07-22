
import {Route, Routes} from "react-router-dom";
import MainLoginPage from "./pages/Login/mainlogin.jsx";

import LoginPage from "./pages/Login/LoginPage.jsx";
import RegisterPage from "./pages/Register/RegisterPage.jsx"
import IndexPage from "./pages/IndexPage.jsx";
import axios from "axios";
import {UserContextProvider} from "./UserContext";
import ProfilePage from "./pages/ProfilePage.jsx";
import PlacesPage from "./pages/PlacesPage";
import PlacesFormPage from "./pages/PlacesFormPage";
import PlacePage from "./pages/PlacePage";
import BookingsPage from "./pages/BookingsPage";
import BookingPage from "./pages/BookingPage";
import ManageUsersPage from "./pages/ManageUsers.jsx";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:10000/api";
axios.defaults.withCredentials = true;

function App() {
  return (
    
      <UserContextProvider>   
      <Routes>
        <Route path="/" element={<MainLoginPage />}  />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />}  />
        <Route path="/index" element={<IndexPage />}  />
        <Route path="/account" element={<ProfilePage />} />
        <Route path="/place/:id" element={<PlacePage />} />
        <Route path="/account/bookings" element={<BookingsPage />} />
        <Route path="/account/bookings/:id" element={<BookingPage />} />
        <Route path="/account/manageusers" element={<ManageUsersPage/>} />
        <Route path="/account/places" element={<PlacesPage />} />
        <Route path="/account/places/new" element={<PlacesFormPage />} />
        <Route path="/account/places/:id" element={<PlacesFormPage />} />
        <Route path="/place/:id" element={<PlacePage />} />
      </Routes>
      </UserContextProvider>
    )
    }

export default App