import { useEffect, useState } from "react";
import TableProduct from "../../Component/TableProduct";
import { productData, tableByDate } from "../../Fetch/FetchAPI";
import { formatPrice } from "../../Utils/display";

const Stat = ({ label, value, className = "" }) => (
  <div className={`card p-5 ${className}`}>
    <p className="text-[13px] text-ink-3">{label}</p>
    <p className="price mt-3 text-[28px] leading-none text-ink">{value}</p>
  </div>
);

const DashBoardMain = ({ totals, selectedDate }) => {
  const [items, setItems] = useState({ data: [] });
  const byLabel = Object.fromEntries((totals || []).map((t) => [t.label, t.total]));

  useEffect(() => {
    const request = selectedDate === "ALL" ? productData() : tableByDate(selectedDate);
    request
      .then((data) => setItems(data || { data: [] }))
      .catch((error) => console.error("Error fetching products:", error));
  }, [selectedDate]);

  return (
    <div className="mt-6 space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="card p-5 md:col-span-2">
          <p className="text-[13px] text-ink-3">Revenue</p>
          <p className="price mt-3 text-[40px] leading-none tracking-[-0.02em] text-ink">{formatPrice(byLabel["Total Revenue"])}</p>
          <p className="mt-3 text-[13px] text-ink-3">Canceled orders excluded</p>
        </div>
        <Stat label="Orders" value={Number(byLabel["Total Order"] || 0).toLocaleString("en-US")} />
        <Stat label="Customers who ordered" value={Number(byLabel["Total Customer"] || 0).toLocaleString("en-US")} />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-medium">Inventory</h2>
          <span className="text-[13px] text-ink-3">{selectedDate === "ALL" ? "All products" : "Released in this period"}</span>
        </div>
        <TableProduct title="Inventory" items={items?.data || { data: [] }} />
      </section>
    </div>
  );
};

export default DashBoardMain;
