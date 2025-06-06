import React, { useEffect, useState } from 'react';
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { NavLink, useNavigate } from 'react-router-dom';
import { BiLogOut } from "react-icons/bi";
import Avatar from './Avatar';
import { useDispatch, useSelector } from 'react-redux';
import EditUserDetails from './EditUserDetails';
import Divider from './Divider';
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from './SearchUser';
import { FaImage, FaVideo } from "react-icons/fa6";
import { logout } from '../redux/userSlice';

const Sidebar = () => {
  const user = useSelector(state => state?.user);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [allUser, setAllUser] = useState([]);
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const socketConnection = useSelector(state => state?.user?.socketConnection);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('sidebar', user._id);
      
      socketConnection.on('conversation', (data) => {
        console.log('conversation', data);
        
        const conversationUserData = data.map((conversationUser, index) => {
          if (conversationUser?.sender?._id === conversationUser?.receiver?._id) {
            return { ...conversationUser, userDetails: conversationUser?.sender };
          } else if (conversationUser?.receiver?._id !== user?._id) {
            return { ...conversationUser, userDetails: conversationUser.receiver };
          } else {
            return { ...conversationUser, userDetails: conversationUser.sender };
          }
        });

        setAllUser(conversationUserData);
      });

      return () => {
        socketConnection.off('conversation');
      };
    }
  }, [socketConnection, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/email");
    localStorage.clear();
  };

  return (
    <div className='w-full h-full grid grid-cols-[56px,1fr] bg-white'>
      {/* Sidebar Icons */}
      <div className='bg-gray-50 w-14 h-full rounded-tr-lg rounded-br-lg py-6 text-gray-600 flex flex-col justify-between shadow-sm'>
        <div className='flex flex-col gap-2'>
          <NavLink
            className={({ isActive }) =>
              `w-14 h-14 flex justify-center items-center cursor-pointer hover:bg-gray-200 rounded transition ${isActive ? "bg-gray-200" : ""}`
            }
            title='Chat'
            to='/'
          >
            <IoChatbubbleEllipses size={24} />
          </NavLink>

          <button
            title='Add Friend'
            onClick={() => setOpenSearchUser(true)}
            className='w-14 h-14 flex justify-center items-center cursor-pointer hover:bg-gray-200 rounded transition'
          >
            <FaUserPlus size={24} />
          </button>
        </div>

        <div className='flex flex-col items-center gap-2'>
          <button
            title={user?.name}
            onClick={() => setEditUserOpen(true)}
            className='focus:outline-none'
          >
            <Avatar
              width={40}
              height={40}
              name={user?.name}
              imageUrl={user?.profile_pic}
              userId={user?._id}
            />
          </button>
          <button
            title='Logout'
            className='w-14 h-14 flex justify-center items-center cursor-pointer hover:bg-gray-200 rounded transition'
            onClick={handleLogout}
          >
            <BiLogOut size={24} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className='w-full flex flex-col'>
        <div className='h-16 flex items-center px-4'>
          <h2 className='text-2xl font-semibold text-gray-800'>Messages</h2>
        </div>
        <Divider />

        <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
          {allUser.length === 0 ? (
            <div className='flex flex-col items-center mt-16'>
              <FiArrowUpLeft size={60} className='text-gray-400' />
              <p className='text-lg text-gray-500 mt-4 text-center px-4'>
                Explore users to start a conversation.
              </p>
            </div>
          ) : (
            allUser.map((conv) => (
              <NavLink
                to={`/${conv?.userDetails?._id}`}
                key={conv?._id}
                className='flex items-center gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer'
              >
                <Avatar
                  imageUrl={conv?.userDetails?.profile_pic}
                  name={conv?.userDetails?.name}
                  width={40}
                  height={40}
                />
                <div className='flex-1 min-w-0'>
                  <h3 className='text-base font-medium text-gray-800 truncate'>
                    {conv?.userDetails?.name}
                  </h3>
                  <div className='flex items-center gap-1 text-sm text-gray-500'>
                    {conv?.lastMsg?.imageUrl && (
                      <div className='flex items-center gap-1'>
                        <FaImage size={14} className='text-gray-500' />
                        {!conv?.lastMsg?.text && <span>Image</span>}
                      </div>
                    )}
                    {conv?.lastMsg?.videoUrl && (
                      <div className='flex items-center gap-1'>
                        <FaVideo size={14} className='text-gray-500' />
                        {!conv?.lastMsg?.text && <span>Video</span>}
                      </div>
                    )}
                    <p className='truncate'>{conv?.lastMsg?.text}</p>
                  </div>
                </div>
                {Boolean(conv?.unseenMsg) && (
                  <p className='text-xs w-6 h-6 flex justify-center items-center bg-blue-600 text-white rounded-full ml-auto'>
                    {conv?.unseenMsg}
                  </p>
                )}
              </NavLink>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {editUserOpen && (
        <EditUserDetails onClose={() => setEditUserOpen(false)} user={user} />
      )}

      {openSearchUser && (
        <SearchUser onClose={() => setOpenSearchUser(false)} />
      )}
    </div>
  );
};

export default Sidebar;