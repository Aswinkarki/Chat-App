import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { HiDotsVertical } from 'react-icons/hi';
import { FaAngleLeft, FaPlus, FaImage, FaVideo } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { IoMdSend } from "react-icons/io";
import uploadFile from '../helpers/uploadFiles';
import Loading from './Loading';
import wallpaper from '../assets/wallapaper.jpeg';
import moment from 'moment';

const MessagePage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const socketConnection = useSelector((state) => state?.user?.socketConnection);
  const user = useSelector((state) => state?.user);
  const [dataUser, setDataUser] = useState({
    name: '',
    email: '',
    profile_pic: '',
    online: false,
    _id: '',
  });
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [message, setMessage] = useState({
    text: '',
    imageUrl: '',
    videoUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const [error, setError] = useState(null);
  const currentMessage = useRef(null);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [allMessage]);

  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload((prev) => !prev);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const uploadPhoto = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);

    setMessage((prev) => ({
      ...prev,
      imageUrl: uploadPhoto.url,
    }));
  };

  const handleClearUploadImage = () => {
    setMessage((prev) => ({
      ...prev,
      imageUrl: '',
    }));
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const uploadPhoto = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);

    setMessage((prev) => ({
      ...prev,
      videoUrl: uploadPhoto.url,
    }));
  };

  const handleClearUploadVideo = () => {
    setMessage((prev) => ({
      ...prev,
      videoUrl: '',
    }));
  };

  useEffect(() => {
    if (socketConnection) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(params.userId);
      console.log('params.userId:', params.userId);
      if (!isValidObjectId) {
        console.error('Invalid userId:', params.userId);
        setError('Invalid user ID. Please select a valid user.');
        navigate('/');
        return;
      }

      socketConnection.emit('message-page', params.userId);
      socketConnection.emit('seen', params.userId);

      socketConnection.on('message-user', (data) => {
        setDataUser(data);
      });

      socketConnection.on('message', (data) => {
        console.log('message data', data);
        setAllMessage(data);
      });

      socketConnection.on('error', (error) => {
        console.error('Socket error:', error.message);
        setError(error.message);
      });

      return () => {
        socketConnection.off('message-user');
        socketConnection.off('message');
        socketConnection.off('error');
      };
    }
  }, [socketConnection, params?.userId, user, navigate]);

  const handleOnChange = (e) => {
    const { value } = e.target;
    setMessage((prev) => ({
      ...prev,
      text: value,
    }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.text || message.imageUrl || message.videoUrl) {
      if (socketConnection) {
        socketConnection.emit('new message', {
          sender: user?._id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user?._id,
        });
        setMessage({
          text: '',
          imageUrl: '',
          videoUrl: '',
        });
      }
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-red-600 text-lg font-medium">{error}</h3>
          <Link to="/" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundImage: `url(${wallpaper})` }} className="bg-no-repeat bg-cover bg-center h-full">
      <header className="sticky top-0 h-16 bg-white shadow-md flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="lg:hidden text-gray-600 hover:text-gray-800 transition">
            <FaAngleLeft size={25} />
          </Link>
          <Avatar
            width={50}
            height={50}
            imageUrl={dataUser?.profile_pic}
            name={dataUser?.name}
            userId={dataUser?._id}
          />
          <div>
            <h3 className="font-semibold text-lg text-gray-800 truncate">{dataUser?.name}</h3>
            <p className="text-sm text-gray-600">
              {dataUser.online ? (
                <span className="text-green-500 font-medium">Online</span>
              ) : (
                <span className="text-gray-400">Offline</span>
              )}
            </p>
          </div>
        </div>
        <button className="text-gray-600 hover:text-blue-600 transition">
          <HiDotsVertical size={24} />
        </button>
      </header>

      <section className="h-[calc(100vh-128px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-gray-50 bg-opacity-80 p-4">
        <div className="flex flex-col gap-3" ref={currentMessage}>
          {allMessage.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg max-w-xs lg:max-w-sm ${
                user._id === msg?.msgByUserId
                  ? 'ml-auto bg-blue-100 text-gray-800'
                  : 'mr-auto bg-white shadow-sm text-gray-800'
              }`}
            >
              {msg?.imageUrl && (
                <img
                  src={msg?.imageUrl}
                  className="w-full h-auto rounded-lg max-h-60 object-contain"
                  alt="message media"
                />
              )}
              {msg?.videoUrl && (
                <video
                  src={msg.videoUrl}
                  className="w-full h-auto rounded-lg max-h-60 object-contain"
                  controls
                />
              )}
              {msg.text && <p className="px-1 py-1">{msg.text}</p>}
              <p className="text-xs text-gray-500 text-right mt-1">
                {moment(msg.createdAt).format('hh:mm A')}
              </p>
            </div>
          ))}
        </div>

        {(message.imageUrl || message.videoUrl) && (
          <div className="sticky bottom-0 bg-gray-800 bg-opacity-70 flex flex-row gap-4 justify-center items-center p-4 rounded-lg mt-2">
            {message.imageUrl && (
              <div className="relative bg-white p-2 rounded-lg max-w-xs">
                <button
                  className="absolute top-1 right-1 text-gray-600 hover:text-red-400 transition"
                  onClick={handleClearUploadImage}
                >
                  <IoClose size={20} />
                </button>
                <img
                  src={message.imageUrl}
                  alt="uploadImage"
                  className="w-full h-auto max-h-40 object-contain rounded"
                />
              </div>
            )}
            {message.videoUrl && (
              <div className="relative bg-white p-2 rounded-lg max-w-xs">
                <button
                  className="absolute top-1 right-1 text-gray-600 hover:text-red-400 transition"
                  onClick={handleClearUploadVideo}
                >
                  <IoClose size={20} />
                </button>
                <video
                  src={message.videoUrl}
                  className="w-full h-auto max-h-40 object-contain rounded"
                  controls
                  autoPlay
                  muted
                />
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="sticky bottom-0 flex justify-center items-center py-4">
            <Loading />
          </div>
        )}
      </section>

      <section className="h-16 bg-white flex items-center px-4 shadow-inner">
        <div className="relative">
          <button
            onClick={handleUploadImageVideoOpen}
            className="flex justify-center items-center w-12 h-12 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition"
          >
            <FaPlus size={20} />
          </button>

          {openImageVideoUpload && (
            <div className="absolute bottom-16 left-0 w-40 bg-white shadow-lg rounded-lg p-2 z-10">
              <label
                htmlFor="uploadImage"
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer transition"
              >
                <FaImage size={18} className="text-blue-500" />
                <span className="text-sm text-gray-700">Image</span>
              </label>
              <label
                htmlFor="uploadVideo"
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer transition"
              >
                <FaVideo size={18} className="text-purple-500" />
                <span className="text-sm text-gray-700">Video</span>
              </label>
              <input type="file" id="uploadImage" onChange={handleUploadImage} className="hidden" />
              <input type="file" id="uploadVideo" onChange={handleUploadVideo} className="hidden" />
            </div>
          )}
        </div>

        <form className="flex-1 flex items-center gap-3 px-3" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800"
            value={message.text}
            onChange={handleOnChange}
          />
          <button
            type="submit"
            className="text-blue-600 hover:text-blue-800 transition"
          >
            <IoMdSend size={28} />
          </button>
        </form>
      </section>
    </div>
  );
};

export default MessagePage;