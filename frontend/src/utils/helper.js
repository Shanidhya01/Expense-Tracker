import moment from "moment";

export const validEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
  return regex.test(email);
};

export const getInitials = (name) => {
  if(!name)  return "";

  const words = name.split(" ");
  let initials= "";

  for(let i=0;i<Math.min(words.length, 2);i++){
    initials += words[i][0];
  }
  return initials.toUpperCase();
}

export const addThousandSeparator = (num) => {
  if(num === null || isNaN(num)) return "";
  const [integerPart, fractionalPart] = num.toString().split(".");
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return fractionalPart
    ? `${formattedIntegerPart}.${fractionalPart}`
    : formattedIntegerPart;
};

export const prepareExpenseBarChartData = (data = []) => {
  console.log('prepareExpenseBarChartData - Input data:', data);
  
  if (!data || data.length === 0) {
    console.log('prepareExpenseBarChartData - No data provided');
    return [];
  }

  // Group expenses by date and sum the amounts
  const groupedData = {};
  
  data.forEach((item) => {
    if (!item?.date || !item?.amount) {
      console.log('prepareExpenseBarChartData - Invalid item:', item);
      return;
    }
    
    const date = moment(item.date).format("Do MMM");
    console.log('prepareExpenseBarChartData - Processing date:', item.date, '-> formatted:', date);
    
    if (groupedData[date]) {
      groupedData[date] += item.amount;
    } else {
      groupedData[date] = item.amount;
    }
  });

  console.log('prepareExpenseBarChartData - Grouped data:', groupedData);

  // Convert to array format expected by the chart
  const chartData = Object.entries(groupedData)
    .map(([date, amount]) => ({
      month: date, // Using 'month' to match the XAxis dataKey
      amount: amount,
    }))
    .sort((a, b) => {
      // Simple sort by converting back to moment for comparison
      const dateA = moment(a.month, "Do MMM");
      const dateB = moment(b.month, "Do MMM");
      return dateA.valueOf() - dateB.valueOf();
    });

  console.log('prepareExpenseBarChartData - Final chart data:', chartData);
  return chartData;
}

export const prepareIncomeBarChartData = (data = []) => {
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartData = sortedData.map((item) => ({
    month : moment(item?.date).format("Do MMM"),
    amount : item?.amount,
    source : item?.source
  }));

  return chartData;
};

export const prepareExpenseLineChartData = (data = []) => {
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartData = sortedData.map((item) => ({
    date: moment(item?.date).format("Do MMM"),
    amount: item?.amount,
    category: item?.category,
  }));

  return chartData;
}