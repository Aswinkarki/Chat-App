import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import uploadFile from '../helpers/uploadFiles';
import axios from 'axios';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: ""
  });
  const [uploadPhoto, setUploadPhoto] = useState("");
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    const uploadPhotoResult = await uploadFile(file);
    setUploadPhoto(file);
    setData((prev) => ({
      ...prev,
      profile_pic: uploadPhotoResult?.url
    }));
  };

  const handleClearUploadPhoto = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setUploadPhoto(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/register`;

    try {
      const response = await axios.post(URL, data);
      console.log("response", response);
      toast.success(response.data.message);

      if (response.data.success) {
        setData({
          name: "",
          email: "",
          password: "",
          profile_pic: ""
        });
        navigate('/email');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
    console.log('data', data);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white max-w-md w-full p-6 rounded-lg shadow-lg'>
        <h3 className='text-2xl font-semibold text-center text-gray-800 mb-6'>Welcome to Chat App!</h3>

        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700'>Name :</label>
            <input
              type='text'
              id='name'
              name='name'
              placeholder='Enter your name'
              className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={data.name}
              onChange={handleOnChange}
              required
            />
          </div>

          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>Email :</label>
            <input
              type='email'
              id='email'
              name='email'
              placeholder='Enter your email'
              className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={data.email}
              onChange={handleOnChange}
              required
            />
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700'>Password :</label>
            <input
              type='password'
              id='password'
              name='password'
              placeholder='Enter your password'
              className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={data.password}
              onChange={handleOnChange}
              required
            />
          </div>

          <div>
            <label htmlFor='profile_pic' className='block text-sm font-medium text-gray-700'>Profile Photo :</label>
            <div className='mt-1 h-12 bg-gray-100 flex items-center justify-between px-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition'>
              <p className='text-sm text-gray-600 truncate'>
                {uploadPhoto?.name ? uploadPhoto.name : "Upload profile photo"}
              </p>
              {uploadPhoto?.name && (
                <button
                  className='text-gray-600 hover:text-red-600'
                  onClick={handleClearUploadPhoto}
                >
                  <IoClose size={20} />
                </button>
              )}
            </div>
            <input
              type='file'
              id='profile_pic'
              name='profile_pic'
              className='hidden'
              onChange={handleUploadPhoto}
            />
          </div>

          <button
            className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200'
          >
            Register
          </button>
        </form>

        <p className='mt-4 text-center text-sm text-gray-600'>
          Already have an account? <Link to={"/email"} className='text-blue-600 hover:text-blue-800 font-medium'>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;