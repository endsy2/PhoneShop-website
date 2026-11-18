import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { addNewCategoryAPI, categoryFetch, deleteCategoryAPI } from "../../Fetch/FetchAPI";
import Notice from "../../Component/Notice";

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
      console.error(err);
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
        setResult(`Added ${category}`)
        setError('')
        loadCategories();
      }
      setCategory('');
    } catch {
      setResult('')
      setError('Couldn\u2019t add the category. It may already exist')

    }

  };

  const handleReset = (e) => {
    e.preventDefault();
    setCategory('');

  }

  const handleDeleteCategory = async (categoryName) => {
    if (!window.confirm(`Remove the category ${categoryName}?`)) return;
    try {
      await deleteCategoryAPI(categoryName);
      setResult(`Removed ${categoryName}`);
      setError("");
      loadCategories();
    } catch (err) {
      setResult("");
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit} onReset={handleReset} className="card space-y-4 p-6">
        <h2 className="text-base font-medium">New category</h2>
        <div>
          <label htmlFor="category" className="label">Name</label>
          <input id="category" type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="input" required />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-dark">Add category</button>
          <button type="reset" className="btn btn-ghost">Clear</button>
        </div>
        <Notice>{result}</Notice>
        <Notice tone="error">{error}</Notice>
      </form>

      <section className="card">
        <div className="flex items-baseline justify-between border-b border-line px-5 py-3">
          <h2 className="text-sm font-medium">Categories</h2>
          <span className="price text-[13px] text-ink-3">{categoryList.length}</span>
        </div>
        {categoryList.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-3">No categories yet</p>
        ) : (
          <ul className="max-h-96 divide-y divide-line overflow-y-auto">
            {categoryList.map((item) => (
              <li key={item.category_name} className="flex h-11 items-center justify-between px-5 text-sm">
                {item.category_name}
                <button type="button" onClick={() => handleDeleteCategory(item.category_name)} className="icon-btn h-8 w-8 hover:bg-danger-soft hover:text-danger" aria-label={`Remove ${item.category_name}`}>
                  <FiX size={14} strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AddCategory;
