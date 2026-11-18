import { useEffect, useState } from "react";
import { FiSearch, FiTrash2 } from "react-icons/fi";
import { formatDate, formatPrice } from "../Utils/display";
import { tableHeadOffer } from "../Constants";
import { removeOffer, searchPromotion } from "../Fetch/FetchAPI.js";
import { Link } from "react-router-dom";

const TableOffer = ({ items }) => {
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
        if (!window.confirm(`End promotion #${id}?`)) return;
        try {
            await removeOffer({ deleteid: id });
            setDataTable((prev) => ({
                ...prev,
                data: prev.data.filter((item) => item.promo_id !== id),
            }));
        } catch (error) {
            console.error("Error deleting row:", error);
        }

    };

    const handleSelectRemove = async (e) => {
        e.preventDefault();
        if (!selectedRows.length || !window.confirm(`End ${selectedRows.length} selected promotion(s)?`)) return;

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


    const rows = Array.isArray(datatable?.data) ? datatable.data : [];

    return (
        <section className="card overflow-hidden">
            <form onSubmit={handleSearch} className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-3">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <FiSearch size={16} strokeWidth={1.5} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
                        <input type="search" placeholder="Promotion name" aria-label="Search promotions" className="input h-9 w-64 pl-9" onChange={(e) => setSearchData(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-secondary h-9">Search</button>
                </div>
                {selectedRows.length > 0 && (
                    <button type="button" onClick={handleSelectRemove} className="btn btn-danger h-9">
                        <FiTrash2 size={14} strokeWidth={1.5} />
                        End <span className="price">{selectedRows.length}</span>
                    </button>
                )}
            </form>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                    <thead>
                        <tr className="border-b border-line text-left text-[13px] text-ink-3">
                            <th className="w-10 py-2.5 pl-4">
                                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} aria-label="Select all" className="h-4 w-4 accent-brand" />
                            </th>
                            {tableHeadOffer.map((header) => (
                                <th key={header} className={`px-3 py-2.5 font-normal ${["Price", "Sale price", "Discount"].includes(header) ? "text-right" : ""}`}>{header}</th>
                            ))}
                            <th className="w-12" />
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((element) => {
                                const link = `/dashboard/offer/${element.phone_id}`;
                                return (
                                    <tr key={element.promo_id} className={`border-b border-line last:border-b-0 transition-colors duration-150 ease-out hover:bg-raised ${selectedRows.includes(element.promo_id) ? "bg-raised" : ""}`}>
                                        <td className="py-2.5 pl-4">
                                            <input type="checkbox" checked={selectedRows.includes(element.promo_id)} onChange={() => handleRowSelect(element.promo_id)} aria-label={`Select promotion ${element.promo_id}`} className="h-4 w-4 accent-brand" />
                                        </td>
                                        <td className="price px-3 py-2.5 text-ink-3">{element.promo_id}</td>
                                        <td className="px-3 py-2.5"><Link to={link} className="text-ink hover:underline">{element.name}</Link></td>
                                        <td className="px-3 py-2.5 text-ink-2">{element.promo_name}</td>
                                        <td className="price px-3 py-2.5 text-right text-ink-3 line-through">{formatPrice(element.price)}</td>
                                        <td className="price px-3 py-2.5 text-right text-brand">{formatPrice(element.price_discount)}</td>
                                        <td className="price px-3 py-2.5 text-right text-ink">−{Number(element.discount_percentage || 0)}%</td>
                                        <td className="whitespace-nowrap px-3 py-2.5 text-ink-2">{formatDate(element.end_date)}</td>
                                        <td className="py-2.5 pr-3 text-right">
                                            <button type="button" onClick={() => handleRemove(element.promo_id)} className="icon-btn h-8 w-8 hover:bg-danger-soft hover:text-danger" aria-label={`End promotion ${element.promo_id}`}>
                                                <FiTrash2 size={14} strokeWidth={1.5} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={9} className="py-12 text-center text-sm text-ink-3">No promotions running</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default TableOffer;
