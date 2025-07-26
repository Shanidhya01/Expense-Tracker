import React from 'react'
import CARD_2 from "../../assets/images/card2.png"
import { LuTrendingUpDown } from "react-icons/lu"


function AuthLayout({ children }) {
  return (
    <div className='flex min-h-screen bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100'>
      <div className='w-full md:w-[60vw] h-screen px-12 pt-10 pb-12 flex flex-col justify-center bg-white/80 backdrop-blur-lg shadow-xl rounded-r-3xl'>
        <h2 className='text-2xl font-bold text-purple-700 mb-8 tracking-wide drop-shadow-lg'>Expense Tracker</h2>
        <div className='flex-1 flex items-center justify-center'>
          {children}
        </div>
      </div>
      <div className="hidden md:flex w-[40vw] h-screen bg-gradient-to-br from-violet-200 via-purple-300 to-fuchsia-200 bg-auth-bg-img bg-cover bg-no-repeat bg-center overflow-hidden p-8 relative items-center justify-center">
        <div className='relative w-full h-full flex flex-col items-center justify-start'>
          <div className='relative z-30 w-full flex items-center justify-center pt-2 pb-4'>
            <StatsInfoCard
              icon={<LuTrendingUpDown />}
              label = "Track Your Income & Expenses"
              value = "₹4,30,000"
              color = "bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-violet-500"
              currencySymbol="₹"
            />
          </div>
          <div className='absolute -top-15 -left-15 w-59 h-59 rounded-[40px] bg-purple-600 shadow-2xl shadow-purple-400/30 animate-pulse-slow'></div>
          <div className='absolute top-45 -right-25 w-48 h-56 rounded-[40px] border-[16px] border-fuchsia-400 shadow-lg shadow-fuchsia-300/30'></div>
          <div className='absolute -bottom-10 -left-10 w-52 h-52 rounded-[40px] bg-violet-500 shadow-xl shadow-violet-400/30'></div>
          <div className='relative z-20 flex flex-col items-center gap-8 mt-56'>
            <img
              src={CARD_2}
              className='w-64 lg:w-[95%] rounded-2xl shadow-2xl shadow-blue-400/20 border-4 border-white/60 animate-float'
              alt='Card'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout;

const StatsInfoCard = ({icon, label, value, color}) => {
  return(
    <div className='flex gap-6 items-center bg-white/90 rounded-2xl shadow-xl shadow-purple-400/10 border border-gray-200/40 px-6 py-5 hover:scale-[1.03] transition-transform duration-300 z-10'>
      <div className={`w-14 h-14 flex items-center justify-center text-[30px] text-white ${color} rounded-full drop-shadow-2xl shadow-fuchsia-400/30 animate-bounce-slow`}>
        {icon}
      </div>
      <div>
        <h6 className='text-sm text-gray-500 mb-2 font-semibold tracking-wide'>{label}</h6>
        {/* <span className='text-[22px] font-bold text-purple-700 drop-shadow-md'>{typeof currencySymbol !== 'undefined' ? currencySymbol : '$'}{value}</span> */}
        <span className='text-[22px] font-bold text-purple-700 drop-shadow-md'>{value}</span>
      </div>
    </div>
  )
}
