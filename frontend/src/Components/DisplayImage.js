import React from "react";
import { AiFillCloseSquare } from "react-icons/ai";



const DisplayImage = ({ 
    imgUrl, 
    onClose 
}) => {
  return (
    <div className="fixed bottom-0 top-0 right-0 left-0 flex justify-center items-center">

        <div className="bg-white shadow-lg rounded max-w-5xl mx-auto p-4">
                <div className='w-fit ml-auto text-2xl hover:text-slate-400 cursor-pointer' onClick={onClose}>
                    <AiFillCloseSquare />
                </div>



                <div className="flex justify-center max-w-[60vh] max-h-[60vh]">               
                <img src={imgUrl} alt={imgUrl} className=""/>
                </div>        
        </div>




    </div>
  )
}

export default DisplayImage
