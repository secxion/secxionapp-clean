import userModel from "../../models/userModel.js"

async function allUsers(req,res){
    try{

        const allUsers = await userModel.find()
        
        res.json({
            message : "All User ",
            data : allUsers,
            success : true,
            error : false
        })
    }catch(err){
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

export default allUsers