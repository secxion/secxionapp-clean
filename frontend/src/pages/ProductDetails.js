import React, { useCallback, useContext, useEffect, useState } from 'react'
import  { useNavigate, useParams } from 'react-router-dom'
import SummaryApi from '../common'
import { FaStar } from "react-icons/fa";
import { FaStarHalf } from "react-icons/fa";
import displayINRCurrency from '../helpers/displayCurrency';
import addToCart from '../helpers/addToCart';
import Context from '../Context';
import CategroyWiseProductDisplay from '../Components/CategroyWiseProductDisplay';
import SecxionLoader from '../Components/SecxionLoader'

const ProductDetails = () => {
  const [data,setData] = useState({
    productName : "",
    brandName : "",
    category : "",
    productImage : [],
    description : "",
    price : "",
    sellingPrice : ""
  })
  const params = useParams()
  const [loading,setLoading] = useState(true)
  const productImageListLoading = new Array(4).fill(null)
  const [activeImage,setActiveImage] = useState("")

  const [zoomImageCoordinate,setZoomImageCoordinate] = useState({
    x : 0,
    y : 0
  })
  const [zoomImage,setZoomImage] = useState(false)

  const { fetchUserAddToCart } = useContext(Context)

  const navigate = useNavigate()

  const fetchProductDetails = async()=>{
    setLoading(true)
    const response = await fetch(SummaryApi.productDetails.url,{
      method : SummaryApi.productDetails.method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body : JSON.stringify({
        productId : params?.id
      })
    })
    setLoading(false)
    const dataReponse = await response.json()

    setData(dataReponse?.data)
    setActiveImage(dataReponse?.data?.productImage[0])

  }

  console.log("data",data)

  useEffect(()=>{
    fetchProductDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[params])

  const handleMouseEnterProduct = (imageURL)=>{
    setActiveImage(imageURL)
  }

  const handleZoomImage = useCallback((e) =>{
    setZoomImage(true)
    const { left , top, width , height } = e.target.getBoundingClientRect()
    // console.log("coordinate", left, top , width , height)

    const x = (e.clientX - left) / width
    const y = (e.clientY - top) / height

    setZoomImageCoordinate({
      x,
      y
    })
  },[])

  const handleLeaveImageZoom = ()=>{
    setZoomImage(false)
  }


  const handleAddToCart = async(e,id) =>{
    await addToCart(e,id)
    fetchUserAddToCart()
  }

  const handleBuyProduct = async(e,id)=>{
    await addToCart(e,id)
    fetchUserAddToCart()
    navigate("/cart")

  }

  if (loading) {
    return <SecxionLoader size="large" message="Loading product details..." />
}

  return (
    
  <div className='container mx-auto px-2 py-4 sm:px-4'>

  <div className='min-h-[200px] flex flex-col lg:flex-row gap-4'>
          <div className='h-96 flex flex-col lg:flex-row-reverse gap-3 sm:gap-4'>

              <div className='h-[260px] w-[260px] sm:h-[300px] sm:w-[300px] lg:h-96 lg:w-96 bg-slate-200 relative p-2 rounded-xl shadow'>
                  <img src={activeImage} alt={data?.productName || "Product image"} className='h-full w-full object-scale-down mix-blend-multiply rounded-lg' onMouseMove={handleZoomImage} onMouseLeave={handleLeaveImageZoom}/>

                    {
                      zoomImage && (
                        <div className='hidden lg:block absolute min-w-[500px] overflow-hidden min-h-[400px] bg-slate-200 p-1 -right-[510px] top-0'>
                          <div
                            className='w-full h-full min-h-[400px] min-w-[500px] mix-blend-multiply scale-150'
                            style={{
                              background : `url(${activeImage})`,
                              backgroundRepeat : 'no-repeat',
                              backgroundPosition : `${zoomImageCoordinate.x * 100}% ${zoomImageCoordinate.y * 100}% `
    
                            }}
                          >
    
                          </div>
                        </div>
                      )
                    }
                  
              </div>

              <div className='h-full'>
                {
                  loading ? (
                    <div className='flex gap-2 lg:flex-col overflow-x-auto lg:overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 h-full'>
                      {
                        productImageListLoading.map((el,index) =>(
                          <div className='h-16 w-16 sm:h-20 sm:w-20 bg-slate-200 rounded animate-pulse' key={"loadingImage"+index}></div>
                        ))
                      }
                    </div>
                  ) : (
                    <div className='flex gap-2 lg:flex-col overflow-x-auto lg:overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 h-full'>
                      {
                        data?.productImage?.map((imgURL,index) =>(
                          <div className='h-16 w-16 sm:h-20 sm:w-20 bg-slate-200 rounded p-1 flex-shrink-0' key={imgURL}>
                            <img src={imgURL} alt={data?.productName ? `${data.productName} thumbnail` : "Product thumbnail"} className='w-full h-full object-scale-down mix-blend-multiply cursor-pointer rounded' onMouseEnter={()=>handleMouseEnterProduct(imgURL)}  onClick={()=>handleMouseEnterProduct(imgURL)}/>
                          </div>
                        ))
                      }
                    </div>
                  )
                }
              </div>
          </div>

           {
            loading ? (
              <div className='grid gap-1 w-full'>
                <p className='bg-slate-200 animate-pulse  h-6 lg:h-8 w-full rounded-full inline-block'></p>
                <h2 className='text-2xl lg:text-4xl font-medium h-6 lg:h-8  bg-slate-200 animate-pulse w-full' aria-label="Loading product name">&nbsp;</h2>
                <p className='capitalize text-slate-400 bg-slate-200 min-w-[100px] animate-pulse h-6 lg:h-8  w-full'></p>

                <div className='text-red-600 bg-slate-200 h-6 lg:h-8  animate-pulse flex items-center gap-1 w-full'>
    
                </div>

                <div className='flex items-center gap-2 text-2xl lg:text-3xl font-medium my-1 h-6 lg:h-8  animate-pulse w-full'>
                  <p className='text-red-600 bg-slate-200 w-full'></p>
                  <p className='text-slate-400 line-through bg-slate-200 w-full'></p>
                </div>

                <div className='flex items-center gap-3 my-2 w-full'>
                  <button className='h-6 lg:h-8  bg-slate-200 rounded animate-pulse w-full'></button>
                  <button className='h-6 lg:h-8  bg-slate-200 rounded animate-pulse w-full'></button>
                </div>

                <div className='w-full'>
                  <p className='text-slate-600 font-medium my-1 h-6 lg:h-8   bg-slate-200 rounded animate-pulse w-full'></p>
                  <p className=' bg-slate-200 rounded animate-pulse h-10 lg:h-12  w-full'></p>
                </div>
              </div>
            ) : 
            (
              <div className='flex flex-col gap-2 sm:gap-3 mt-2'>
                <p className='bg-red-200 text-red-600 px-2 py-1 rounded-full inline-block w-fit text-xs sm:text-sm'>{data?.brandName}</p>
                <h2 className='text-xl sm:text-2xl lg:text-4xl font-medium'>{data?.productName}</h2>
                <p className='capitalize text-slate-400 text-sm sm:text-base'>{data?.category}</p>

                <div className='text-red-600 flex items-center gap-1 text-base sm:text-lg'>
                  <FaStar/>
                  <FaStar/>
                  <FaStar/>
                  <FaStar/>
                  <FaStarHalf/>
                </div>

                <div className='flex items-center gap-2 text-xl sm:text-2xl lg:text-3xl font-medium my-1'>
                  <p className='text-red-600'>{displayINRCurrency(data.sellingPrice)}</p>
                  <p className='text-slate-400 line-through'>{displayINRCurrency(data.price)}</p>
                </div>

                <div className='flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3 my-2'>
                  <button className='border-2 border-red-600 rounded px-4 py-2 min-w-[120px] text-red-600 font-medium hover:bg-red-600 hover:text-white text-base sm:text-lg transition' onClick={(e)=>handleBuyProduct(e,data?._id)}>Buy</button>
                  <button className='border-2 border-red-600 rounded px-4 py-2 min-w-[120px] font-medium text-white bg-red-600 hover:text-red-600 hover:bg-white text-base sm:text-lg transition' onClick={(e)=>handleAddToCart(e,data?._id)}>Add To Cart</button>
                </div>

                <div>
                  <p className='text-slate-600 font-medium my-1 text-sm sm:text-base'>Description : </p>
                  <p className='text-xs sm:text-base'>{data?.description}</p>
                </div>
              </div>
            )
           }

      </div>



      {
        data.category && (
          <CategroyWiseProductDisplay category={data?.category} heading={"Recommended Product"}/>
        )
      }
     



    </div>
  )
}

export default ProductDetails