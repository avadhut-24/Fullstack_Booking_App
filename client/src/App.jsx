
import {Route, Routes} from "react-router-dom";
import MainLoginPage from "./pages/Login/mainlogin.jsx";
import AdminLoginPage from "./pages/Login/adminlogin.jsx";
import HostLoginPage from "./pages/Login/hostlogin.jsx";
import CustomerLoginPage from "./pages/Login/customerlogin.jsx";
import AdminRegsiterPage from "./pages/Register/adminregister.jsx";
import HostRegsiterPage from "./pages/Register/hostregister.jsx";
import CustomerRegsiterPage from "./pages/Register/customerregister.jsx"
import AdminIndexPage from "./pages/IndexPages/adminIndex.jsx";
import HostIndexPage from "./pages/IndexPages/hostIndex.jsx";
import CustomerIndexPage from "./pages/IndexPages/customerIndex.jsx";
import IndexPage from "./pages/IndexPage.jsx";
import LoginPage from "./pages/LoginPage";
import Layout from "./Layout";
import RegisterPage from "./pages/RegisterPage";
import axios from "axios";
import {UserContextProvider} from "./UserContext";
import ProfilePage from "./pages/ProfilePage.jsx";
import PlacesPage from "./pages/PlacesPage";
import PlacesFormPage from "./pages/PlacesFormPage";
import PlacePage from "./pages/PlacePage";
import BookingsPage from "./pages/BookingsPage";
import BookingPage from "./pages/BookingPage";
import ManageUsersPage from "./pages/ManageUsers.jsx";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
  return (
    
    
      <UserContextProvider>   
      <Routes>
        <Route path="/" element={<MainLoginPage />}  />
        <Route path="/adminlogin" element={<AdminLoginPage />}  />
        <Route path="/hostlogin" element={<HostLoginPage />}  />
        <Route path="/customerlogin" element={<CustomerLoginPage />}  />
        <Route path="/adminregister" element={<AdminRegsiterPage />}  />
        <Route path="/hostregister" element={<HostRegsiterPage />}  />
        <Route path="/customerregister" element={<CustomerRegsiterPage />}  />
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