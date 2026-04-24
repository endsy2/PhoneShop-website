import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
      const response = await logoutFetch();
      Cookies.remove('token')
      localStorage.removeItem('adminToken');
      console.log(response);

    } catch (error) {
      console.log(error);

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
      <section className="flex justify-between">
        <div className="flex gap-16">
          <h1 className="green-txt text-4xl max-lg:text-2xl">
            Listing OrderView
          </h1>
          <select
            name="date"
            id="date"
            className="p-2 px-4 text-lg max-lg:p-1 max-lg:px-2 max-lg:text-sm border-gray-300 border focus:right-0 text-primary rounded-xl"
            onChange={(e) => setSelectDate(e.target.value)}
          >
            <option value="ALL">ALL</option>
            <option value="1">Last 1 month</option>
            <option value="2">Last 2 months</option>
            <option value="3">Last 3 months</option>
            <option value="6">Last 6 months</option>

          </select>
        </div>
        <Link
          to="/"
          className="red-btn mr-6 max-lg:w-28 max-lg:h-11 max-lg:text-sm"
          onClick={() => handleLogout()}
        >
          LogOut
        </Link>
      </section>
      <DashBoardMain data={mergedData} selectedDate={selectDate} />
    </>
  );
};

export default DashBoardHeader;
