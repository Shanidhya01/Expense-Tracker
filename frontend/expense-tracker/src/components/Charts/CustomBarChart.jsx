import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'

const CustomBarChart = ({ data }) => {
  console.log('CustomBarChart - Received data:', data);

  if (!data || data.length === 0) {
    return (
      <div className='bg-white mt-6 flex items-center justify-center h-[300px]'>
        <p className='text-gray-500'>No data available for chart</p>
      </div>
    );
  }

  // Determine which field to use for X-axis (month for date-based, category for category-based)
  const xAxisKey = data[0]?.month ? 'month' : 'category';
  console.log('CustomBarChart - Using X-axis key:', xAxisKey);

  //function to get bar color based on index
  const getBarColor = (index) =>{
    return index % 2 === 0 ? '#875cf5' : '#cfbefb' 
  };

  const CustomTooltip = ({ active, payload}) => {
    if(active && payload && payload.length) {
      const displayLabel = payload[0].payload.month || payload[0].payload.category;
      return (
        <div className='bg-white shadow-md rounded-lg p-2 border border-gray-300'>
          <p className='text-xs font-semibold text-purple-800 mb-1'>{displayLabel}</p>
          <p className='text-sm text-gray-600'>
            Amount: <span className='text-sm font-medium text-gray-900'>₹{payload[0].payload.amount}</span>
          </p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className='bg-white mt-6'>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="none" />
          <XAxis dataKey={xAxisKey} tick={{fontSize: 12,fill:'#555'}} stroke='none' />
          <YAxis tick={{fontSize: 12,fill:'#555'}} stroke='none' />

          <Tooltip content={CustomTooltip} />

          <Bar
            dataKey="amount"
            fill="#FF8042"
            radius={[10, 10, 0, 0]}
            activeDot={{ r: 8, fill: 'yellow' }}
            activeStyle={{fill:'green'}}
          >
            {data && data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CustomBarChart
