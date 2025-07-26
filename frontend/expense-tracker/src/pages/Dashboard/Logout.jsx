import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LuLogOut, LuArrowLeft } from 'react-icons/lu'
import { UserContext } from '../../context/UserContext'

function Logout() {
  const navigate = useNavigate()
  const { clearUser } = useContext(UserContext)

  const handleLogout = () => {
    try {
      // Clear authentication data from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Clear user context
      clearUser()
      
      // Show success message
      toast.success('Logged out successfully!')
      
      // Redirect to login page
      navigate('/login')
    } catch (error) {
      console.error('Error during logout:', error)
      toast.error('Error logging out. Please try again.')
    }
  }

  const handleCancel = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <LuLogOut className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign Out
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to sign out of your account?
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleLogout}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
          >
            <LuLogOut className="h-5 w-5 mr-2" />
            Yes, Sign Out
          </button>

          <button
            onClick={handleCancel}
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out"
          >
            <LuArrowLeft className="h-5 w-5 mr-2" />
            Cancel
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            You will be redirected to the login page after signing out
          </p>
        </div>
      </div>
    </div>
  )
}

export default Logout
