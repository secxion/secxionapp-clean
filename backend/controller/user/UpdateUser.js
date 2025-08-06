import userModel from "../../models/userModel.js";

async function updateUser(req,res){
    try{
        const sessionUser = req.userId

        const { userId , email, password, name, role} = req.body

        const payload = {
            ...( email && { email : email}),
            ...( password && { password : password}),
            ...( name && { name : name}),
            ...( role && { role : role}),
        }

        const user = await userModel.findById(sessionUser)

        const updateUser = await userModel.findByIdAndUpdate(userId,payload)

        
        res.json({
            data : updateUser,
            message : "User Updated",
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


export default updateUser