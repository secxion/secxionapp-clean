import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import productCategory from '../helpers/productCategory';
import SummaryApi from '../common';
import { FaFilter } from 'react-icons/fa';
import ProductListView from '../Components/ProductListView';
import debounce from 'lodash.debounce';
import SecxionSpinner from '../Components/SecxionSpinner';
import GetInTouchFooter from '../Components/GetInTouchFooter';

const CategoryProduct = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const urlSearch = new URLSearchParams(location.search);
  const urlCategoryListinArray = urlSearch.getAll('category');
  const urlCategoryListObject = urlCategoryListinArray.reduce(
    (acc, el) => ({ ...acc, [el]: true }),
    {},
  );

  const [selectCategory, setSelectCategory] = useState(urlCategoryListObject);
  const [filterCategoryList, setFilterCategoryList] = useState(
    Object.keys(urlCategoryListObject),
  );

  useEffect(() => {
    const selected = Object.keys(selectCategory).filter(
      (key) => selectCategory[key],
    );
    setFilterCategoryList(selected);
  }, [selectCategory]);

  useEffect(() => {
    navigate(
      `/product-category?${filterCategoryList
        .map((cat) => `category=${cat}`)
        .join('&')}`,
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: categories }),
        });

        const json = await response.json();
        if (!response.ok) throw new Error(json.message || 'Fetch failed');

        setData(json.data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
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
    <div className="fixed bottom-0 left-0 right-0 top-[126px] flex flex-col bg-brand-dark-base p-2 text-white md:top-[153px] md:flex-row">
      {/* Mobile Top Bar Filter */}
      <div className="md:hidden w-full bg-brand-dark-base px-2 py-3 flex overflow-x-auto gap-3 scrollbar-hide border-b border-white/5">
        {productCategory.map((category) => (
          <label
            key={category.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-[10px] font-bold font-spaceGrotesk uppercase tracking-widest border transition-all duration-300 ${
              selectCategory[category.value]
                ? 'bg-brand-gold text-brand-dark-base border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                : 'bg-white/5 text-gray-400 border-white/10 hover:border-brand-gold/50'
            }`}
          >
            <input
              type="checkbox"
              value={category.value}
              checked={!!selectCategory[category.value]}
              onChange={handleSelectCategory}
              className="hidden"
            />
            <span>{category.label}</span>
          </label>
        ))}
      </div>

      {/* Desktop Sidebar Filter */}
      <aside className="hidden md:block md:w-[280px] bg-brand-dark-elevated p-6 shadow-2xl overflow-y-auto border-r border-white/5">
        <h4 className="text-xs font-black mb-8 flex items-center tracking-[0.3em] text-brand-gold uppercase font-spaceGrotesk">
          <FaFilter className="mr-3 text-brand-gold/50" /> System Filters
        </h4>
        <form className="space-y-3">
          {productCategory.map((category) => (
            <label
              key={category.id}
              className={`group flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                selectCategory[category.value]
                  ? 'bg-brand-gold/10 border-brand-gold/50 shadow-[inset_0_0_20px_rgba(212,175,55,0.1)]'
                  : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  value={category.value}
                  checked={!!selectCategory[category.value]}
                  onChange={handleSelectCategory}
                  className="peer h-5 w-5 rounded-lg border-white/10 bg-black/20 text-brand-gold focus:ring-brand-gold/50 focus:ring-offset-brand-dark-elevated transition-all"
                />
              </div>
              <span
                className={`text-sm font-bold font-spaceGrotesk tracking-wide transition-colors ${
                  selectCategory[category.value]
                    ? 'text-brand-gold'
                    : 'text-gray-400 group-hover:text-gray-200'
                }`}
              >
                {category.label}
              </span>
            </label>
          ))}
        </form>
      </aside>
      {/* Product List */}
      <main className="flex-1 overflow-hidden premium-bg p-6 pb-28 md:pb-24">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            {filterCategoryList.length > 0 && (
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold/60 font-spaceGrotesk">
                ACTIVE SECTORS:{' '}
                {filterCategoryList.map((cat, i) => (
                  <span key={cat}>
                    <span className="text-white">
                      {productCategory.find((p) => p.value === cat)?.label ||
                        cat}
                    </span>
                    {i < filterCategoryList.length - 1 ? ' | ' : ''}
                  </span>
                ))}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto rounded-3xl glass-panel p-6 shadow-2xl scrollbar-hide border-white/5">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <SecxionSpinner size="large" message="Loading products..." />
              </div>
            ) : error ? (
              <p
                className="text-red-400 font-semibold text-center "
                aria-live="assertive"
                role="alert"
                tabIndex={0}
              >
                {error}
              </p>
            ) : data.length === 0 ? (
              <p
                className="text-gray-400 text-center text-sm "
                aria-live="polite"
                role="status"
                tabIndex={0}
              >
                {filterCategoryList.length === 0
                  ? 'Select a category.'
                  : 'No products found.'}
              </p>
            ) : (
              <ProductListView data={data} loading={loading} />
            )}
          </div>
        </div>
      </main>
      <GetInTouchFooter />
    </div>
  );
};

export default CategoryProduct;
