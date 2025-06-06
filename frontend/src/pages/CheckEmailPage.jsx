import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import uploadFile from '../helpers/uploadFiles';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PiUserCircle } from "react-icons/pi";

const CheckEmailPage = () => {
  const [data, setData] = useState({
    email: "",
  });
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/email`;

    try {
      const response = await axios.post(URL, data);
      toast.success(response.data.message);

      if (response.data.success) {
        setData({
          email: "",
        });
        navigate('/password', {
          state: response?.data?.data,
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white max-w-md w-full p-6 rounded-lg shadow-lg'>
        <div className='flex justify-center mb-4'>
          <PiUserCircle size={100} className='text-gray-400' />
        </div>

        <h3 className='text-2xl font-semibold text-center text-gray-800 mb-4'>Welcome to Chat App!</h3>

        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>Email :</label>
            <input
              type='email'
              id='email'
              name='email'
              placeholder='enter your email'
              className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={data.email}
              onChange={handleOnChange}
              required
            />
          </div>

          <button
            className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200'
          >
            Let's Go
          </button>
        </form>

        <p className='mt-4 text-center text-sm text-gray-600'>
          New User? <Link to={"/register"} className='text-blue-600 hover:text-blue-800 font-medium'>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default CheckEmailPage;