import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Avatar from '../componenets/Avatar'
import { useDispatch } from 'react-redux'
import { setToken, setUser } from '../redux/userSlice'

const CheckPasswordPage = () => {
  const [data, setData] = useState({
    password: '',
    userId: '',
  })
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!location?.state?.name) {
      navigate('/email')
    }
  }, [])

  const handleOnChange = (e) => {
    const { name, value } = e.target

    setData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/password`

    try {
      const response = await axios({
        method: 'post',
        url: URL,
        data: {
          userId: location?.state?._id,
          password: data.password,
        },
        withCredentials: true,
      })

      toast.success(response.data.message)

      if (response.data.success) {
        dispatch(setToken(response?.data?.token))
        localStorage.setItem('token', response?.data?.token)

        setData({
          password: '',
        })
        navigate('/')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
    }
  }

  return (
    <div className="mt-10 flex justify-center">
      <div className="bg-white w-full max-w-md shadow-lg rounded-xl p-6 mx-4 border border-gray-200">
        <div className="w-fit mx-auto mb-4 flex justify-center items-center flex-col">
          <Avatar
            width={70}
            height={70}
            name={location?.state?.name}
            imageUrl={location?.state?.profile_pic}
          />
          <h2 className="font-semibold text-xl mt-2 text-gray-800">
            {location?.state?.name}
          </h2>
        </div>

        <form className="grid gap-5 mt-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-gray-700 font-medium">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="bg-gray-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={data.password}
              onChange={handleOnChange}
              required
            />
          </div>

          <button
            className="bg-green-500 hover:bg-blue-500 text-white text-lg font-bold py-2 rounded-md transition duration-300"
            type="submit"
          >
            Login
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          <Link
            to="/forgot-password"
            className="text-green-600 hover:text-blue-600 font-semibold"
          >
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  )
}

export default CheckPasswordPage
