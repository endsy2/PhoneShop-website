import { useEffect, useState } from "react";
import { ProductSort } from "../../Constants";
import { categoryFetch, tableByCategory } from "../../Fetch/FetchAPI";
import TableProduct from "../../Component/TableProduct";
const ProductCaterogy = () => {
  const [category, setCategory] = useState([]);
  const [select, setSelect] = useState('');
  const [items, setItems] = useState([]);

  const fetchCategory = async () => {
    try {
      const data = await categoryFetch();
      console.log('here category' + data);

      const categories = data?.data || [];
      setCategory(categories);
      if (!select && categories.length > 0) {
        setSelect(categories[0].category_name || categories[0].category || '');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchProducts = async () => {
    if (!select) return;
    try {
      const data = await tableByCategory({ category: select }); // Wait for the async function to resolve
      setItems(data); // Set the data once it's fetched
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  useEffect(() => {
    fetchCategory();
    fetchProducts();
  }, [select])
  return (
    <>

      <section className="flex my-24 justify-between">
        <div className="flex justify-center items-center gap-2">
          <h2 className="text-primary text-2xl font-bold font-Roboto">
            Categories:
          </h2>

          <select
            name="category"
            id="category"
            className="border-2 py-2 px-5 rounded-xl "
            onChange={e => setSelect(e.target.value)}
          >
            {category.map((element) => (
              <option value={element.category_name} key={element.category_name} className="" >
                {element.category_name}{""}
              </option>
            ))}
          </select>
        </div>

      </section>
      <TableProduct title="All Product" items={items} category={select} />
      {console.log("here is your items")
      }
    </>
  );
};

export default ProductCaterogy;
