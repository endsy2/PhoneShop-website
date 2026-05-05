import { useEffect, useState } from "react";
import { trash } from "../Assets";
import { tableHeadOffer } from "../Constants";
import { removeOffer, searchPromotion } from "../Fetch/FetchAPI.js";
import { Link } from "react-router-dom";

const TableOffer = ({ title, items }) => {
    const [datatable, setDataTable] = useState(items || []);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]); // Track selected row IDs
    const [searchData, setSearchData] = useState("");

    useEffect(() => {
        setDataTable(items);
        console.log(items);
    }, [items]);

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        if (newSelectAll) {
            const allIds = datatable?.data?.map((item) => item.promo_id) || [];
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
            await removeOffer({ deleteid: id });
            setDataTable((prev) => ({
                ...prev,
                data: prev.data.filter((item) => item.promo_id !== id),
            }));
        } catch (error) {
            console.error("Error deleting row:", error);
        }
        // console.log(id);

    };


    const handleSelectRemove = async (e) => {
        e.preventDefault();


        try {
            // Loop through each selected row ID and remove it using the removeOneFetch function
            for (const id of selectedRows) {
                await removeOffer({ deleteid: id });
            }

            // Update the data table to remove the deleted rows
            setDataTable((prev) => ({
                ...prev,
                data: prev.data.filter((item) => !selectedRows.includes(item.promo_id)),
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
            const data = await searchPromotion({ promo_name: searchData });
            setDataTable(data);
        } catch (error) {
            console.error("Error fetching search data:", error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        searchDataFetch();
    };



    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <section className="mt-16 bg-white rounded-lg p-6 sm:p-3 shadow-lg border border-gray-400">
            <section className="flex flex-col sm:flex-row justify-between mx-4 sm:mx-10 mb-5 sm:mb-10">
                <h1 className="green-text mt-4 sm:mt-10 font-semibold text-lg lg:text-3xl">
                    {title}
                </h1>

                <form className="flex gap-2 sm:gap-10 items-center mt-3 sm:mt-10">
                    <input
                        type="text"
                        placeholder="Search Promotion Name"
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
                            {tableHeadOffer.map((header, index) => (
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
                                                className="mr-2 sm:mr-3 h-3  w-3 lg:w-4 lg:h-4  border-1 border-white rounded"
                                            />
                                            {header}
                                        </>
                                    ) : (
                                        header
                                    )}

                                </th>
                            ))}

                            <td className="table-data flex justify-center  gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
                                <button
                                    onClick={(e) => handleSelectRemove(e)}
                                    className="flex items-center"
                                >
                                    <img
                                        src={trash}
                                        alt="Remove"
                                        className="w-4 sm:w-6 lg:w-8 h-4 sm:h-6 lg:h-8 object-contain"
                                    />
                                </button>
                            </td>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.isArray(datatable?.data) && datatable.data.length > 0 ? (
                            datatable.data.map((element) => (
                                <tr
                                    key={element.promo_id}
                                    className="hover:bg-gray-50 transition duration-200 border-b border-gray-200"
                                >
                                    <td className="table-data flex justify-start items-center px-4 sm:px-6 py-3 sm:py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(element.promo_id)}
                                            onChange={() => handleRowSelect(element.promo_id)}
                                            className="mr-2 sm:mr-3 h-3 w-3 lg:w-4 lg:h-4 border-1 border-white rounded"
                                        />
                                        <Link
                                            to={`/dashboard/offer/${element.phone_id}`}
                                            className="text-sm sm:text-base"
                                        >
                                            {element.promo_id}
                                        </Link>
                                    </td>
                                    <td className="table-data px-4 sm:px-6 py-3 sm:py-4">
                                        <Link
                                            to={`/dashboard/offer/${element.phone_id}`}
                                            className="text-sm sm:text-base"
                                        >
                                            {element.name}
                                        </Link>
                                    </td>
                                    <td className="table-data px-4 sm:px-6 py-3 sm:py-4 ">
                                        <Link
                                            to={`/dashboard/offer/${element.phone_id}`}
                                            className="text-sm sm:text-base"
                                        >
                                            {element.promo_name}
                                        </Link>
                                    </td>
                                    <td className="table-data px-4 sm:px-6 py-3 sm:py-4">
                                        <Link
                                            to={`/dashboard/offer/${element.phone_id}`}
                                            className="text-sm sm:text-base"
                                        >
                                            {element.price}
                                        </Link>
                                    </td>
                                    <td className="table-data px-4 sm:px-6 py-3 sm:py-4">
                                        <Link
                                            to={`/dashboard/offer/${element.phone_id}`}
                                            className="text-sm sm:text-base"
                                        >
                                            {element.price_discount}
                                        </Link>
                                    </td>
                                    <td className="table-data px-4 sm:px-6 py-3 sm:py-4">
                                        <Link
                                            to={`/dashboard/offer/${element.phone_id}`}
                                            className="text-sm sm:text-base"
                                        >
                                            {element.discount_percentage}
                                        </Link>
                                    </td>
                                    <td className="table-data px-4 sm:px-6 py-3 sm:py-4">
                                        <Link
                                            to={`/dashboard/offer/${element.phone_id}`}
                                            className="text-sm sm:text-base"
                                        >
                                            {formatDate(element.end_date)}
                                        </Link>
                                    </td>
                                    <td className="table-data flex justify-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
                                        <button
                                            onClick={() => handleRemove(element.promo_id)}
                                            className="flex"
                                        >
                                            <img
                                                src={trash}
                                                alt="Remove"
                                                className="w-4 sm:w-6 lg:w-8 h-4 sm:h-6 lg:h-8 object-contain"
                                            />
                                        </button>
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center text-sm sm:text-base py-6">
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

export default TableOffer;
