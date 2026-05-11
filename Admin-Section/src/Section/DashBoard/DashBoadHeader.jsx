import { useEffect, useState } from "react";
import { dashboardHeaderAll, dashboardHeaderData, logoutFetch } from "../../Fetch/FetchAPI";
import { dashBoradMain_item } from "../../Constants";
import DashBoardMain from "./DashBoardMain";
import Cookies from "js-cookie";

const DashBoardHeader = () => {
  const [selectDate, setSelectDate] = useState("ALL");
  const [mergedData, setMergedData] = useState([]);

  const fetchDate = async () => {
    try {
      const response = await dashboardHeaderData(selectDate);
      const data = response.data || [];
      const merged = data.data.map((value, index) => ({
        ...(value || {}), // Ensure value is not null or undefined
        ...(dashBoradMain_item[index] || {}), // Handle mismatched lengths
        date: selectDate, // Add selected date
      }));
      setMergedData(merged); // Set merged data
    } catch (error) {
      console.error("Error fetching date data:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutFetch();
    } catch (error) {
      console.log(error);
    } finally {
      Cookies.remove('token');
      Cookies.remove('access-token');
      localStorage.removeItem('adminToken');
      window.location.href = '/';
    }
  }

  const fetchAll = async () => {
    try {
      const response = await dashboardHeaderAll();
      const data = response.data || [];
      const merged = data.data.map((value, index) => ({
        ...(value || {}),
        ...(dashBoradMain_item[index] || {}),
        date: "ALL",
      }));
      setMergedData(merged); // Set merged data
    } catch (error) {
      console.error("Error fetching all data:", error);
    }
  };

  useEffect(() => {
    if (selectDate === "ALL") {
      fetchAll();
    } else {
      fetchDate();
    }
  }, [selectDate]);

  return (
    <>
      <section className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex gap-6 items-center flex-wrap">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Dashboard Overview
          </h1>
          <select
            name="date"
            id="date"
            className="p-3 px-5 text-base border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-green-200 text-primary rounded-xl bg-white shadow-sm hover:border-primary transition-all"
            onChange={(e) => setSelectDate(e.target.value)}
          >
            <option value="ALL">ALL</option>
            <option value="1">Last 1 month</option>
            <option value="2">Last 2 months</option>
            <option value="3">Last 3 months</option>
            <option value="6">Last 6 months</option>
          </select>
        </div>
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
          onClick={() => handleLogout()}
        >
          <span>🚪</span>
          <span>LogOut</span>
        </button>
      </section>
      <DashBoardMain data={mergedData} selectedDate={selectDate} />
    </>
  );
};

export default DashBoardHeader;
