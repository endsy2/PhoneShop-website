import { useEffect, useState } from "react";
import { dashboardHeaderAll, dashboardHeaderData } from "../../Fetch/FetchAPI";
import DashBoardMain from "./DashBoardMain";
import PageHeader from "../../Component/PageHeader";

const PERIODS = [
  { value: "ALL", label: "All time" },
  { value: "1", label: "Last month" },
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
];

const DashBoardHeader = () => {
  const [period, setPeriod] = useState("ALL");
  const [totals, setTotals] = useState([]);

  useEffect(() => {
    const request = period === "ALL" ? dashboardHeaderAll() : dashboardHeaderData(period);
    request
      .then((response) => setTotals(response?.data?.data || []))
      .catch((error) => console.error("Error fetching dashboard totals:", error));
  }, [period]);

  const periodLabel = PERIODS.find((p) => p.value === period)?.label;

  return (
    <>
      <PageHeader title="Overview" description={periodLabel}>
        <div className="inline-flex rounded-lg border border-line-strong bg-surface p-0.5" role="group" aria-label="Period">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPeriod(value)}
              className={`h-8 rounded-md px-3 text-[13px] transition-colors duration-150 ease-out ${
                period === value ? "bg-raised text-ink" : "text-ink-2 hover:text-ink"
              }`}
              aria-pressed={period === value}
            >
              {label}
            </button>
          ))}
        </div>
      </PageHeader>
      <DashBoardMain totals={totals} selectedDate={period} />
    </>
  );
};

export default DashBoardHeader;
