import axios from 'axios';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logout, setOnlineUser, setSocketConnection, setUser } from '../redux/userSlice';
import Sidebar from '../componenets/Sidebar';
import wallapaper from '../assets/wallapaper.jpeg';
import io from 'socket.io-client';

const Home = () => {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('user', user);

  const fetchUserDetails = async () => {
    try {
      const URL = `${import.meta.env.VITE_BACKEND_URL}/api/user-details`;
      const response = await axios({
        url: URL,
        withCredentials: true,
      });

      dispatch(setUser(response.data.data));

      if (response.data.data.logout) {
        dispatch(logout());
        navigate("/email");
      }
      console.log("current user Details", response);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  /***socket connection */
  useEffect(() => {
    const socketConnection = io(import.meta.env.VITE_BACKEND_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socketConnection.on('onlineUser', (data) => {
      console.log(data);
      dispatch(setOnlineUser(data));
    });

    dispatch(setSocketConnection(socketConnection));

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const basePath = location.pathname === '/';

  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen bg-gray-100'>
      <section className={`bg-white shadow-lg ${!basePath && "hidden"} lg:block transition-all duration-300`}>
        <Sidebar />
      </section>

      {/**message component**/}
      <section className={`${basePath && "hidden"} bg-white lg:bg-gray-50`}>
        <Outlet />
      </section>

      <div className={`justify-center items-center flex-col gap-4 hidden ${!basePath ? "hidden" : "lg:flex"} bg-gray-50`}>
        <div className='flex flex-col items-center'>
          <img
            src={wallapaper}
            width={250}
            alt='logo'
            className='rounded-lg shadow-md'
          />
          <p className='text-lg mt-4 text-gray-600 font-medium'>
            Select a user to start messaging
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;