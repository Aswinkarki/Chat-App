import React, { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import uploadFile from '../helpers/uploadFiles';
import Divider from './Divider';
import axios from 'axios';
import toast from 'react-hot-toast'; // Fixed typo: taost -> toast
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';

const EditUserDetails = ({ onClose, user }) => {
  const [data, setData] = useState({
    name: user?.user || user?.name || '', // Adjusted for potential user object structure
    profile_pic: user?.profile_pic || ''
  });
  const uploadPhotoRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      name: user?.user || user?.name || '', // Ensure correct field
      profile_pic: user?.profile_pic || ''
    }));
  }, [user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenUploadPhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadPhotoRef.current.click();
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    const uploadPhoto = await uploadFile(file);
    setData((prev) => ({
      ...prev,
      profile_pic: uploadPhoto?.url
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const URL = `${import.meta.env.VITE_BACKEND_URL}/api/update-user`;
      const payload = {
        name: data.name,
        profile_pic: data.profile_pic
      };

      const response = await axios.post(URL, payload, {
        withCredentials: true
      });

      console.log('response', response);
      toast.success(response?.data?.message);

      if (response.data.success) {
        dispatch(setUser(response.data.data));
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update user details');
    }
  };

  return (
    <div className='fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-20'>
      <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-md'>
        <h2 className='text-xl font-semibold text-gray-800 mb-2'>Profile Details</h2>
        <p className='text-sm text-gray-600 mb-4'>Edit user details</p>

        <form className='space-y-4' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1'>
            <label htmlFor='name' className='text-sm font-medium text-gray-700'>Name:</label>
            <input
              type='text'
              name='name'
              id='name'
              value={data.name}
              onChange={handleOnChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='text-sm font-medium text-gray-700'>Photo:</label>
            <div className='mt-2 flex items-center gap-4'>
              <Avatar
                width={40}
                height={40}
                imageUrl={data?.profile_pic}
                name={data?.name}
              />
              <button
                type='button'
                className='text-blue-600 font-medium hover:text-blue-800 transition'
                onClick={handleOpenUploadPhoto}
              >
                Change Photo
              </button>
              <input
                type='file'
                id='profile_pic'
                className='hidden'
                onChange={handleUploadPhoto}
                ref={uploadPhotoRef}
              />
            </div>
          </div>

          <Divider />

          <div className='flex gap-3 justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(EditUserDetails);