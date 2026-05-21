import { useEffect, useState } from "react";
import TableProduct from "../../Component/TableProduct";
import { productData, tableByDate } from "../../Fetch/FetchAPI";

const DashBoardMain = ({ data, selectedDate }) => {
  const [items, setItems] = useState([]);

  // Function to fetch data based on the selected date
  const fetchDataByDate = async () => {
    try {
      const data = await tableByDate(selectedDate);
      // Use selectedDate here
      setItems(data || { data: [] });
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const fetchData = async () => {
    try {
      const data = await productData();
      setItems(data || { data: [] });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (selectedDate === "ALL") {
      fetchData();
    } else {
      fetchDataByDate();
    }
  }, [selectedDate]);  // Watch for changes in selectedDate

  return (
    <main className="pt-8">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3 w-full mb-10">
        {data.map((element, index) => (
          <div
            key={index}
            className="relative overflow-hidden border-2 border-gray-200 rounded-2xl p-6 flex flex-col bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
          >
            {/* Gradient decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {element.label}
                </h1>
                <p className="text-xs text-gray-500 mb-2">{element.date} MONTH</p>
                <h2 className="text-4xl font-extrabold text-primary">
                  {element.total}
                </h2>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl w-16 h-16 flex justify-center items-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <img
                  src={element.img}
                  alt={element.label}
                  className="w-10 h-10 object-contain"
                />
              </div>
            </div>
            
            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-DarkGreen"></div>
          </div>
        ))}
      </section>

      {/* Render Table for Inventory */}
      <section className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
        <div className="p-6 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-2xl font-extrabold text-primary flex items-center gap-3">
            Inventory Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">Manage product inventory and stock levels</p>
        </div>
        <div className="p-6">
          <TableProduct title="Inventory" items={items?.data || { data: [] }} />
        </div>
      </section>
    </main>
  );
};

export default DashBoardMain;
