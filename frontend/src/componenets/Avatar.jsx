import React from 'react';
import { PiUserCircle } from "react-icons/pi";
import { useSelector } from 'react-redux';

const Avatar = ({ userId, name, imageUrl, width = 70, height = 70 }) => {
  const onlineUser = useSelector(state => state?.user?.onlineUser);

  let avatarName = "";
  if (name) {
    const splitName = name?.split(" ");
    if (splitName.length > 1) {
      avatarName = splitName[0][0] + splitName[1][0];
    } else {
      avatarName = splitName[0][0];
    }
  }

  const bgColor = [
    'bg-slate-200',
    'bg-teal-200',
    'bg-red-200',
    'bg-green-200',
    'bg-yellow-200',
    'bg-gray-200',
    "bg-cyan-200",
    "bg-sky-200",
    "bg-blue-200"
  ];

  const randomNumber = Math.floor(Math.random() * bgColor.length);
  const isOnline = onlineUser.includes(userId);

  return (
    <div
      className={`relative rounded-full flex items-center justify-center font-bold text-gray-800 transition-transform duration-200 hover:scale-105 hover:shadow-md overflow-hidden`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover rounded-full"
        />
      ) : name ? (
        <div
          className={`w-full h-full flex items-center justify-center text-lg uppercase ${bgColor[randomNumber]}`}
        >
          {avatarName}
        </div>
      ) : (
        <PiUserCircle
          size={width}
          className='text-gray-500'
        />
      )}

      {isOnline && (
        <div
          className='absolute bottom-1 right-0 bg-green-500 p-1 rounded-full border-2 border-white shadow-sm'
          style={{ width: `${width * 0.3}px`, height: `${width * 0.3}px` }}
        />
      )}
    </div>
  );
};

export default Avatar;
