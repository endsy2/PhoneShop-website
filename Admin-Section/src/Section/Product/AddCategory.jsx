import { useEffect, useState } from "react";
import { addNewCategoryAPI, categoryFetch, deleteCategoryAPI } from "../../Fetch/FetchAPI";


const AddCategory = () => {

  const [category, setCategory] = useState('');
  const [error, setError] = useState('')
  const [result, setResult] = useState('')
  const [categoryList, setCategoryList] = useState([]);

  const loadCategories = async () => {
    try {
      const data = await categoryFetch();
      setCategoryList(data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await addNewCategoryAPI(category);
      if (data?.status >= 200 && data?.status < 300) {
        setResult("Add Success")
        setError('')
        loadCategories();
      }
      setCategory('');
      console.log(data);
    } catch (error) {
      console.log(error);
      setResult('')
      setError('Something went wrong')

    }

  };

  const handleReset = (e) => {
    e.preventDefault();
    setCategory('');

  }

  const handleDeleteCategory = async (categoryName) => {
    try {
      await deleteCategoryAPI(categoryName);
      setResult("Delete Success");
      setError("");
      loadCategories();
    } catch (err) {
      setResult("");
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="bg-white border-gray-300 border p-8 rounded-lg w-full max-w-4xl mx-auto mt-12 shadow-lg">
      <h1 className="text-center text-3xl text-primary font-bold mb-8">
        Add New Category
      </h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 md:items-center gap-6"
      >
        {/* category */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary mb-2">Category</label>
          <input
            type="text"
            name="brand"
            value={category}
            placeholder="Enter brand name"
            onChange={(e) => setCategory(e.target.value)}
            className="input-style"

            required
          />
        </div>


        {/* Buttons */}
        <div className="md:col-span-2 flex justify-center items-center gap-4 mt-4">
          <button
            type="submit"
            onClick={(e) => handleSubmit(e)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            Submit
          </button>
          <button
            onClick={(e) => handleReset(e)}
            type="reset"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            Reset
          </button>
        </div>
      </form>
      <div className="mt-16">
        {error && <p className="text-red-500">{error}</p>}
        {result && <p className="text-primary">{result}</p>}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-primary mb-3">Category List</h2>
        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          {categoryList.length === 0 ? (
            <p className="p-4 text-gray-500">No categories found.</p>
          ) : (
            categoryList.map((item) => (
              <div key={item.category_name} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-800">{item.category_name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(item.category_name)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
