import { useEffect, useState } from "react";
import { FiSearch, FiTrash2 } from "react-icons/fi";
import ProductImage from "./ProductImage";
import { formatDate, formatPrice } from "../Utils/display";
import { tableHeadProduct } from "../Constants";
import { Link, useLocation } from "react-router-dom";
import { productByName, removeOneFetch, searchFetchByCategory } from "../Fetch/FetchAPI.js";

const TableProduct = ({ title, items, category }) => {
  const [datatable, setDataTable] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]); // Track selected row IDs
  const [searchData, setSearchData] = useState("");
  const [Category, setCategory] = useState('');
  const location = useLocation();

  useEffect(() => {
    setDataTable(items);
    setCategory(category);
  }, [items]);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      const allIds = datatable?.data?.map((item) => item.phone_id) || [];
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

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This also removes its colours, specs and order lines.`)) return;
    try {
      await removeOneFetch({ deleteid: id });
      setDataTable((prev) => ({
        ...prev,
        data: prev.data.filter((item) => item.phone_id !== id),
      }));
    } catch (error) {
      console.error("Error deleting row:", error);
    }
  };

  const handleSelectRemove = async (e) => {
    e.preventDefault();
    if (!selectedRows.length || !window.confirm(`Delete ${selectedRows.length} selected product(s)?`)) return;
    try {
      // Loop through each selected row ID and remove it using the removeOneFetch function
      for (const id of selectedRows) {
        await removeOneFetch({ deleteid: id });
      }

      // Update the data table to remove the deleted rows
      setDataTable((prev) => ({
        ...prev,
        data: prev.data.filter((item) => !selectedRows.includes(item.phone_id)),
      }));

      // Reset selection states
      setSelectedRows([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error deleting selected rows:", error);
    }
  };

  const searchDataFetchByCategory = async () => {
    try {
      const data = await searchFetchByCategory({ searchData, Category });
      setSearchData('');
      setDataTable(data);
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const searchDataFetchByName = async () => {
    try {
      const data = await productByName(searchData);
      setSearchData('')
      setDataTable(data);
    } catch (error) {
      console.error(error);
    }
  }
  const handleSearchByCategory = (e) => {
    e.preventDefault();
    searchDataFetchByCategory();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchDataFetchByName();
  }

  const rows = Array.isArray(datatable?.data) ? datatable.data : [];
  const detailLink = (element) => `/dashboard/productByName?phone_name=${encodeURIComponent(element.name)}`;

  return (
    <section className="card overflow-hidden">
      <form
        onSubmit={location.pathname === "/dashboard" ? handleSearch : handleSearchByCategory}
        className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-3"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch size={16} strokeWidth={1.5} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              type="search"
              placeholder={`Search ${title.toLowerCase()}`}
              aria-label="Search products"
              className="input h-9 w-64 pl-9"
              onChange={(e) => setSearchData(e.target.value)}
              value={searchData}
            />
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
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[13px] text-ink-3">
              <th className="w-10 py-2.5 pl-4">
                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} aria-label="Select all" className="h-4 w-4 accent-brand" />
              </th>
              {tableHeadProduct.map((header) => (
                <th key={header} className={`px-3 py-2.5 font-normal ${["Price", "Stock"].includes(header) ? "text-right" : ""}`}>{header}</th>
              ))}
              <th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((element) => {
                const stock = Number(element.stock ?? 0);
                return (
                  <tr key={element.phone_id} className={`border-b border-line last:border-b-0 transition-colors duration-150 ease-out hover:bg-raised ${selectedRows.includes(element.phone_id) ? "bg-raised" : ""}`}>
                    <td className="py-2 pl-4">
                      <input type="checkbox" checked={selectedRows.includes(element.phone_id)} onChange={() => handleRowSelect(element.phone_id)} aria-label={`Select ${element.name}`} className="h-4 w-4 accent-brand" />
                    </td>
                    <td className="price px-3 py-2 text-ink-3">{element.phone_id}</td>
                    <td className="px-3 py-2">
                      <Link to={detailLink(element)} className="flex items-center gap-3 text-ink hover:underline">
                        <span className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-raised">
                          <ProductImage src={element.images} alt="" className="h-full w-full p-1" />
                        </span>
                        {element.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-ink-2">{element.category_name}</td>
                    <td className="price px-3 py-2 text-right text-ink">{formatPrice(element.price)}</td>
                    <td className={`price px-3 py-2 text-right ${stock <= 0 ? "text-danger" : stock <= 5 ? "text-warn" : "text-ink"}`}>{stock}</td>
                    <td className="px-3 py-2 text-ink-2">{formatDate(element.release_date)}</td>
                    <td className="py-2 pr-3 text-right">
                      <button type="button" onClick={() => handleRemove(element.phone_id, element.name)} className="icon-btn h-8 w-8 hover:bg-danger-soft hover:text-danger" aria-label={`Delete ${element.name}`}>
                        <FiTrash2 size={14} strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-ink-3">No products</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TableProduct;
