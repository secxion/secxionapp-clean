import { useContext, useEffect, useRef, useState } from 'react';
import fetchCategoryWiseProduct from '../helpers/fetchCategoryWiseProduct';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import addToCart from '../helpers/addToCart';
import Context from '../Context';
import SecxionShimmer from './SecxionShimmer';

const VerticalCardProduct = ({ category, heading }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const [scroll, setScroll] = useState(0);
  const scrollElement = useRef();

  const { fetchUserAddToCart } = useContext(Context);

  const handleAddToCart = async (e, id) => {
    await addToCart(e, id);
    fetchUserAddToCart();
  };

  const handleSell = async (e, id) => {
    await addToCart(e, id);
    fetchUserAddToCart();
    navigate('/cart');
  };

  const fetchData = async () => {
    setLoading(true);
    const categoryProduct = await fetchCategoryWiseProduct(category);
    setLoading(false);

    setData(categoryProduct?.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const scrollRight = () => {
    scrollElement.current.scrollLeft += 300;
  };
  const scrollLeft = () => {
    scrollElement.current.scrollLeft -= 300;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 my-6 relative">
        <h2 className="text-2xl font-semibold py-4">{heading}</h2>
        <SecxionShimmer type="grid" count={6} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 my-6 relative">
      <h2 className="text-2xl font-semibold py-4"> {heading} </h2>
      <div
        className="flex items-center gap-4 md:gap-6 overflow-x-scroll scrollbar-none transition-all"
        ref={scrollElement}
      >
        <button
          className="bg-white shadow-md rounded-full p-1 absolute left-0 text-lg hidden md:block"
          onClick={scrollLeft}
        >
          <FaAngleLeft />
        </button>
        <button
          className="bg-white shadow-md rounded-full p-1 absolute right-0 text-lg hidden md:block"
          onClick={scrollRight}
        >
          <FaAngleRight />
        </button>
        {data.map((product, index) => {
          return (
            <Link
              to={'product/' + product?._id}
              className="p-2 cursor-pointer"
              key={product?._id}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden p-4 bg-slate-100 flex items-center justify-center">
                <img
                  src={product?.productImage[0]}
                  alt="{product?.category}"
                  className="h-full object-scale-down mix-blend-multiply hover:scale-150 transition-all"
                />
              </div>
              <p className="text-center font-bold text-sm md:text-base capitalize">
                {product?.category}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default VerticalCardProduct;
