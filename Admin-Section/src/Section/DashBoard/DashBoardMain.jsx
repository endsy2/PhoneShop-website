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
    <main className="pt-20">

      <section className="grid grid-cols-1 gap-20 lg:grid-cols-2 xl:grid-cols-3 w-full">
        {data.map((element, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-md p-6 flex flex-col bg-white shadow-md hover:shadow-lg transition-shadow "
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-primary text-lg font-semibold mb-2">
                  {element.label}

                </h1>
                <p className="text-primary text-sm">{element.date} MONTH</p>
                <h2 className="text-primary text-xl font-bold">
                  {element.total}
                </h2>
              </div>
              <div className="bg-gray-100 rounded-full w-12 h-12 flex justify-center items-center">
                <img
                  src={element.img}
                  alt={element.label}
                  className="w-8 h-8"
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Render Table for Inventory */}
      <section className="mt-10">
        <TableProduct title="Inventory" items={items?.data || { data: [] }} />
      </section>
    </main>
  );
};

export default DashBoardMain;
