import { useEffect, useState } from "react";
import { FiSearch, FiTrash2 } from "react-icons/fi";
import StatusDot from "./StatusDot";
import { formatDate, formatPrice } from "../Utils/display";
import { tableHeadOrder } from "../Constants";
import { Link } from "react-router-dom";
import { removeOrder, searchOrder } from "../Fetch/FetchAPI.js";

const TableOrder = ({ items }) => {
    const [datatable, setDataTable] = useState(items || []);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]); // Track selected row IDs
    const [searchData, setSearchData] = useState("");

    useEffect(() => {
        setDataTable(items);
    }, [items]);


    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        if (newSelectAll) {
            const allIds = datatable?.data?.map((item) => item.order_id) || [];
            setSelectedRows(allIds);
        } else {
            setSelectedRows([]);
        }
    };

    const handleRowSelect = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const handleRemove = async (id) => {
        if (!window.confirm(`Delete order #${id}? A pending order's items go back to stock.`)) return;
        try {
            await removeOrder({ deleteid: id });
            setDataTable((prev) => ({
                ...prev,
                data: prev.data.filter((item) => item.order_id !== id),
            }));
        } catch (error) {
            console.error("Error deleting row:", error);
        }
    };

    const handleSelectRemove = async (e) => {
        e.preventDefault();
        if (!selectedRows.length || !window.confirm(`Delete ${selectedRows.length} selected order(s)?`)) return;
        try {
            // Loop through each selected row ID and remove it using the removeOneFetch function
            for (const id of selectedRows) {
                await removeOrder({ deleteid: id });
            }

            // Update the data table to remove the deleted rows
            setDataTable((prev) => ({
                ...prev,
                data: prev.data.filter((item) => !selectedRows.includes(item.order_id)),
            }));

            // Reset selection states
            setSelectedRows([]);
            setSelectAll(false);
        } catch (error) {
            console.error("Error deleting selected rows:", error);
        }
    };


    const searchDataFetch = async () => {
        try {
            const data = await searchOrder({ username: searchData });
            setDataTable(data);
        } catch (error) {
            console.error("Error fetching search data:", error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        searchDataFetch();
    };



    const rows = Array.isArray(datatable?.data) ? [...datatable.data].sort((a, b) => b.order_id - a.order_id) : [];

    return (
        <section className="card overflow-hidden">
            <form onSubmit={handleSearch} className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-3">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <FiSearch size={16} strokeWidth={1.5} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
                        <input type="search" placeholder="Customer or recipient" aria-label="Search orders" className="input h-9 w-64 pl-9" onChange={(e) => setSearchData(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-secondary h-9">Search</button>
                </div>
                {selectedRows.length > 0 && (
                    <button type="button" onClick={handleSelectRemove} className="btn btn-danger h-9">
                        <FiTrash2 size={14} strokeWidth={1.5} />
                        Delete <span className="price">{selectedRows.length}</span>
                    </button>
                )}
            </form>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-sm">
                    <thead>
                        <tr className="border-b border-line text-left text-[13px] text-ink-3">
                            <th className="w-10 py-2.5 pl-4">
                                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} aria-label="Select all" className="h-4 w-4 accent-brand" />
                            </th>
                            {tableHeadOrder.map((header) => (
                                <th key={header} className={`px-3 py-2.5 font-normal ${header === "Amount" ? "text-right" : ""}`}>{header}</th>
                            ))}
                            <th className="w-12" />
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((element) => {
                                const link = `/dashboard/order/${element.order_id}`;
                                return (
                                    <tr key={element.order_id} className={`border-b border-line last:border-b-0 transition-colors duration-150 ease-out hover:bg-raised ${selectedRows.includes(element.order_id) ? "bg-raised" : ""}`}>
                                        <td className="py-2.5 pl-4">
                                            <input type="checkbox" checked={selectedRows.includes(element.order_id)} onChange={() => handleRowSelect(element.order_id)} aria-label={`Select order ${element.order_id}`} className="h-4 w-4 accent-brand" />
                                        </td>
                                        <td className="px-3 py-2.5"><Link to={link} className="price text-ink hover:underline">#{element.order_id}</Link></td>
                                        <td className="px-3 py-2.5"><Link to={link} className="text-ink hover:underline">{element.display_name || element.recipient_name || element.username}</Link></td>
                                        <td className="max-w-[220px] truncate px-3 py-2.5 text-ink-2" title={element.location}>{element.location}</td>
                                        <td className="whitespace-nowrap px-3 py-2.5 text-ink-2">{formatDate(element.order_date)}</td>
                                        <td className="price px-3 py-2.5 text-right text-ink">{formatPrice(element.total_amount)}</td>
                                        <td className="px-3 py-2.5"><StatusDot status={element.payment_verified === 1 ? "paid" : "unpaid"} /></td>
                                        <td className="px-3 py-2.5"><StatusDot status={element.status} /></td>
                                        <td className="py-2.5 pr-3 text-right">
                                            <button type="button" onClick={() => handleRemove(element.order_id)} className="icon-btn h-8 w-8 hover:bg-danger-soft hover:text-danger" aria-label={`Delete order ${element.order_id}`}>
                                                <FiTrash2 size={14} strokeWidth={1.5} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={9} className="py-12 text-center text-sm text-ink-3">No orders</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default TableOrder;
