import { useEffect, useState } from "react";
import { headerOrder } from "../../Fetch/FetchAPI";
import StatusDot from "../../Component/StatusDot";

// Order counts per status
const Order_main = () => {
  const [counts, setCounts] = useState([]);

  useEffect(() => {
    headerOrder()
      .then((header) => setCounts(header?.data || []))
      .catch((error) => console.error("Error fetching order counts:", error));
  }, []);

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {counts.map((element) => (
        <div key={element.status} className="card p-5">
          <StatusDot status={element.status} />
          <p className="price mt-3 text-[28px] leading-none text-ink">{Number(element.count || 0).toLocaleString("en-US")}</p>
        </div>
      ))}
    </section>
  );
};

export default Order_main;
