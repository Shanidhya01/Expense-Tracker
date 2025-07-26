import React, { useEffect } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useUserAuth } from '../../hooks/useUserAuth';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import InfoCard from '../../components/Cards/InfoCard';

import { LuHandCoins, LuWalletMinimal } from 'react-icons/lu';
import { IoMdCard } from 'react-icons/io';
import { addThousandSeparator } from '../../utils/helper';
import RecentTransactions from '../../components/Dashboard/RecentTransactions';
import FinanceOverview from '../../components/Dashboard/FinanceOverview';
import ExpenseTransactions from '../../components/Dashboard/ExpenseTransactions';
import Last30DaysExpense from '../../components/Dashboard/Last30DaysExpense';
import RecentIncomeWithChart from '../../components/Dashboard/RecentIncomeWithChart';
import RecentIncome from '../../components/Dashboard/RecentIncome';

function Home() {
  useUserAuth();

  const navigate = useNavigate();
  const [DashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const fetchDashboardData = async () => {
    if(loading) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${API_PATHS.DASHBOARD.GET_DATA}`
      );

      if(response.data) {
        setDashboardData(response.data);
      }
    }catch(error){
      console.error("Error fetching dashboard data:", error);
    }finally{
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
    return () => {}
  },[]);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className='my-5 mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={addThousandSeparator(DashboardData?.totalBalance || 0)}
            color="bg-primary"
          />

          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={addThousandSeparator(DashboardData?.totalIncome || 0)}
            color="bg-orange-500"
          />

          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expense"
            value={addThousandSeparator(DashboardData?.totalExpense || 0)}
            color="bg-red-500"
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
          <RecentTransactions
            transactions={DashboardData?.recentTransactions}
            onSeeMore={() => navigate("/expense")}
          />
          <FinanceOverview
            totalBalance={DashboardData?.totalBalance || 0}
            totalIncome={DashboardData?.totalIncome || 0}
            totalExpense={DashboardData?.totalExpense || 0}
          />
          <ExpenseTransactions
            transactions={DashboardData?.last30DaysExpense?.transactions || []}
            onSeeMore={() => navigate("/expense")}
          />
          <Last30DaysExpense
            data={DashboardData?.last30DaysExpense?.transactions || []}
          />

          <RecentIncomeWithChart
            data={DashboardData?.last60DaysIncome?.transactions?.slice(0, 4) || []}
            totalIncome={DashboardData?.totalIncome || 0}
          />

          <RecentIncome
            transactions={DashboardData?.last60DaysIncome?.transactions || []}
            onSeeMore={() => navigate("/income")}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Home
