import productModel from "../../models/productModel.js";

const SearchProduct = async(req,res)=>{
    try{
        const query = req.query.q

        const regex = new RegExp(query,'i','g')

        const product = await productModel.find({
            "$or" :[
                {
                    productName : regex
                },
                {
                    category : regex
                }
            ]
        })

        res.json({
            data : product,
            message : "Search Trade",
            error : false,
            success : true,
        })

    }catch(err){
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

export default SearchProduct