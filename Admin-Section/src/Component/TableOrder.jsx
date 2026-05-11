import { useEffect, useState } from "react";
import { trash } from "../Assets";
import { tableHeadOrder } from "../Constants";
import { Link } from "react-router-dom";
import { removeOrder, searchOrder } from "../Fetch/FetchAPI.js";

const TableOrder = ({ title, items }) => {
    const [datatable, setDataTable] = useState(items || []);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]); // Track selected row IDs
    const [searchData, setSearchData] = useState("");

    useEffect(() => {
        setDataTable(items);
    }, [items]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

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



    return (
        <section className="mt-16 bg-white rounded-lg p-6 sm:p-10 shadow-lg border border-gray-400">
            <section className="flex flex-col sm:flex-row justify-between mx-4 sm:mx-10 mb-5 sm:mb-10">
                <h1 className="green-text mt-4 sm:mt-10 font-semibold text-lg lg:text-3xl">
                    {title}
                </h1>

                <form className="flex gap-2 sm:gap-10 items-center mt-3 sm:mt-10">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="input-style text-sm sm:text-base"
                        onChange={(e) => setSearchData(e.target.value)}
                    />
                    <button
                        className="green-btn h-10 sm:h-12 w-[100px] sm:w-[150px] text-sm sm:text-base"
                        onClick={handleSearch}
                    >
                        Search
                    </button>

                </form>
            </section>

            {/* Table Section */}
            <div className="overflow-x-auto">
                <table className="table-auto w-full border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-DarkLightGray text-white border-b-2 border-gray-300">
                            {tableHeadOrder.map((header, index) => (
                                <th
                                    key={index}
                                    className={`table-data text-sm sm:text-xl px-4 sm:px-6 py-3 sm:py-4 ${index === 0 ? "rounded-l-lg" : ""
                                        } border-r border-gray-200`}
                                >
                                    {header === "ID" ? (
                                        <>
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                                className="mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5 border-2 border-white rounded"
                                            />
                                            {header}
                                        </>
                                    ) : (
                                        header
                                    )}
                                </th>
                            ))}
                            <th className="rounded-r-lg text-sm sm:text-xl px-4 sm:px-6 py-3 sm:py-4 border-l border-gray-200">
                                <button onClick={(e) => handleSelectRemove(e)}><img src={trash} alt="" /></button>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.isArray(datatable?.data) && datatable.data.length > 0 ? (
                            datatable.data.map((element) => (
                                <tr
                                    key={element.order_id}
                                    className="hover:bg-gray-50 transition duration-200 border-b border-gray-200"
                                >
                                    <td className="table-data px-4 sm:px-6 py-3 sm:py-4">

                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(element.order_id)}
                                            onChange={() => handleRowSelect(element.order_id)}
                                            className="mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5"
                                        />
                                        <Link
                                            to={`/dashboard/order/${element.order_id}`}
                                            className="hover:underline text-sm sm:text-base"
                                        >
                                            {element.order_id}
                                        </Link>
                                    </td>
                                    <td className="table-data px-4 sm:px-6 py-3 sm:py-4">
                                        <Link
                                            to={`/dashboard/order/${element.order_id}`}
                                            className="hover:underline text-sm sm:text-base"
                                        >
                                            {element.display_name || element.recipient_name || element.username}
                                        </Link>
                                    </td>
                                    <td className="table-data px-4 sm:px-6 py-3 sm:py-4">
                                        <Link
                                            to={`/dashboard/order/${element.order_id}`}
                                            className="hover:underline text-sm sm:text-base"
                                        >
                                            {element.location}
                                        </Link>
                                    </td>
                                    <td className="table-data px-4 sm:px-6 py-3 sm:py-4">
                                        <Link
                                            to={`/dashboard/order/${element.order_id}`}
                                            className="hover:underline text-sm sm:text-base"
                                        >
                                            {formatDate(element.order_date)}
                                        </Link>
                                    </td>
                                    <td className="table-data px-4 sm:px-6 py-3 sm:py-4">
                                        <Link
                                            to={`/dashboard/order/${element.order_id}`}
                                            className="hover:underline text-sm sm:text-base"
                                        >
                                            {element.total_amount}
                                        </Link>
                                    </td>
                                    <td className="table-data px-4 sm:px-6 py-3 sm:py-4">
                                        <Link
                                            to={`/dashboard/order/${element.order_id}`}
                                            className="flex justify-center"
                                        >
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                element.payment_verified === 1 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {element.payment_verified === 1 ? '✓ Paid' : '⏳ Pending'}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="table-data px-4 sm:px-6 py-3 sm:py-4">
                                        <Link
                                            to={`/dashboard/order/${element.order_id}`}
                                            className="flex justify-center"
                                        >
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                element.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' :
                                                element.status?.toLowerCase() === 'shipping' ? 'bg-blue-100 text-blue-700' :
                                                element.status?.toLowerCase() === 'completed' ? 'bg-purple-100 text-purple-700' :
                                                element.status?.toLowerCase() === 'canceled' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {element.status?.toLowerCase() === 'delivered' ? '✅ Delivered' :
                                                 element.status?.toLowerCase() === 'shipping' ? '🚚 Shipping' :
                                                 element.status?.toLowerCase() === 'completed' ? '✓ Completed' :
                                                 element.status?.toLowerCase() === 'canceled' ? '❌ Canceled' :
                                                 '⏳ Pending'}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="table-data flex justify-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
                                        <button
                                            onClick={() => handleRemove(element.order_id)}
                                            className="flex"
                                        >
                                            <img
                                                src={trash}
                                                alt="Delete"
                                                className="cursor-pointer max-w-[25px] max-h-[25px] sm:max-w-[30px] sm:max-h-[30px]"
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="text-center text-sm sm:text-base py-6">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default TableOrder;