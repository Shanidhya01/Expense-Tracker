import React, { useEffect } from 'react'
import { prepareExpenseBarChartData } from '../../utils/helper';
import CustomBarChart from '../Charts/CustomBarChart';

const Last30DaysExpense = ({ data }) => {
  const [chartData, setChartData] = React.useState([]);

  useEffect(() => {
    console.log('Last30DaysExpense - Raw data:', data);
    const result = prepareExpenseBarChartData(data);
    console.log('Last30DaysExpense - Prepared chart data:', result);
    setChartData(result);

    return () => {}
  }, [data]);

  return (
    <div className='card col-span-1'>
      <div className='flex items-center justify-between'>
        <h5 className='text-lg'>Recent Expense Trends</h5>
      </div>

      <CustomBarChart data={chartData} />
    </div>
  )
}

export default Last30DaysExpense
