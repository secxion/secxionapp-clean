import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import productCategory from "../helpers/productCategory";
import SummaryApi from "../common";
import {
  FaCreditCard,
  FaGift,
  FaMoneyBillWave,
  FaFilter,
} from "react-icons/fa";
import VerticalCard from "../Components/VerticalCard";
import debounce from "lodash.debounce";
import ClipLoader from "react-spinners/ClipLoader";

const iconMap = {
  "gift cards": <FaGift className="text-emerald-400 w-4 h-4 glossy-icon-text" />, // Applied glossy-icon-text
  "visa / creditcards": <FaCreditCard className="text-yellow-400 w-4 h-4 glossy-icon-text" />, // Applied glossy-icon-text
  "Online Payments": <FaMoneyBillWave className="text-indigo-400 w-4 h-4 glossy-icon-text" />, // Applied glossy-icon-text
};

const CategoryProduct = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const urlSearch = new URLSearchParams(location.search);
  const urlCategoryListinArray = urlSearch.getAll("category");
  const urlCategoryListObject = urlCategoryListinArray.reduce(
    (acc, el) => ({ ...acc, [el]: true }),
    {}
  );

  const [selectCategory, setSelectCategory] = useState(urlCategoryListObject);
  const [filterCategoryList, setFilterCategoryList] = useState(
    Object.keys(urlCategoryListObject)
  );

  useEffect(() => {
    const selected = Object.keys(selectCategory).filter((key) => selectCategory[key]);
    setFilterCategoryList(selected);
  }, [selectCategory]);

  useEffect(() => {
    navigate(
      `/product-category?${filterCategoryList
        .map((cat) => `category=${cat}`)
        .join("&")}`
    );

    const fetchData = debounce(async (categories) => {
      if (categories.length === 0) {
        setData([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(SummaryApi.filterProduct.url, {
          method: SummaryApi.filterProduct.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: categories }),
        });

        const json = await response.json();
        if (!response.ok) throw new Error(json.message || "Fetch failed");

        setData(json.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 500);

    fetchData(filterCategoryList);
  }, [filterCategoryList, navigate]);

  const handleSelectCategory = (e) => {
    const { value, checked } = e.target;
    setSelectCategory((prev) => ({ ...prev, [value]: checked }));
  };

  return (
    <div className="p-2 fixed top-[80px] left-0 right-0 bottom-0 rounded-2xl flex flex-col md:flex-row bg-white text-white"> {/* Changed rounded-md to rounded-2xl */}
      {/* Mobile Top Bar Filter */}
      <div className="md:hidden w-full bg-white px-2 py-1 flex overflow-x-auto gap-3 scrollbar-thin scrollbar-thumb-gray-400"> {/* Bold yellow border applied */}
        {productCategory.map((category) => (
          <label key={category.id} className="flex items-center gap-1 bg-gray-900 px-2 py-2 rounded whitespace-nowrap text-xs border border-gray-700 hover:border-yellow-400 transition-all duration-200"> {/* Applied glossy-text and hover border */}
            {iconMap[category.value]}
            <input
              type="checkbox"
              value={category.value}
              checked={!!selectCategory[category.value]}
              onChange={handleSelectCategory}
              className="accent-blue-500 h-4 w-4 text-gray-500"
            />
            <span>{category.label}</span>
          </label>
        ))}
      </div>

      {/* Desktop Sidebar Filter */}
      <aside className="hidden md:block md:w-[250px] bg-gray-900 p-4 shadow-lg overflow-y-auto border-r border-gray-800 border-4 border-yellow-500 rounded-bl-xl rounded-tl-xl"> {/* Added rounded corners to match parent */}
        <h4 className="text-lg font-semibold mb-3 flex items-center glossy-heading"> {/* Applied glossy-heading */}
          <FaFilter className="mr-2" /> Filter
        </h4>
        <form className="space-y-4 ">
          {productCategory.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-blue-600/50 transition border border-gray-700 hover:border-yellow-400 " // Applied glossy-text and hover border
            >
              {iconMap[category.value]}
              <input
                type="checkbox"
                value={category.value}
                checked={!!selectCategory[category.value]}
                onChange={handleSelectCategory}
                className="accent-blue-500 h-4 w-4"
              />
              <span className="text-sm text-gray-400">{category.label}</span>
            </label>
          ))}
        </form>
        <div className="mt-6 text-sm text-gray-400 border-t border-gray-800 pt-3 "> {/* Applied glossy-text */}
          Can't find it? <br />
          <Link to="/report" className="text-green-400 underline hover:text-green-300">Report here</Link>
        </div>
      </aside>

      {/* Product List */}
      <main className="flex-1 bg-gray-950 p-3 overflow-hidden border-2 border-black rounded-tr-xl rounded-br-xl"> {/* Black border applied, Added rounded corners to match parent */}
        <div className="h-full flex flex-col">
          {filterCategoryList.length > 0 && (
            <p className="mb-2 text-xs text-blue-400 "> {/* Applied glossy-text */}
              Showing:{" "}
              {filterCategoryList.map((cat, i) => (
                <span key={cat}>
                  <span className="text-gray-400 font-semibold"> {/* Applied glossy-text */}
                    {productCategory.find((p) => p.value === cat)?.label || cat}
                  </span>
                  {i < filterCategoryList.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          )}

          <div className="flex-1 overflow-y-auto rounded-lg border border-blue-700 bg-gray-900 p-3 shadow-inner scrollbar-thin scrollbar-thumb-blue-500 border-4 border-yellow-500"> {/* Bold yellow border applied */}
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <ClipLoader loading={loading} size={40} color="#3b82f6" />
              </div>
            ) : error ? (
              <p className="text-red-400 font-semibold text-center glossy-text"> {/* Applied glossy-text */}
                {error}
              </p>
            ) : data.length === 0 ? (
              <p className="text-gray-400 text-center text-sm glossy-text"> {/* Applied glossy-text */}
                {filterCategoryList.length === 0
                  ? "Select a category."
                  : "No products found."}
              </p>
            ) : (
              <VerticalCard data={data} loading={loading} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CategoryProduct;