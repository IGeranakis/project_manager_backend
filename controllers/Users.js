const e = require("express");
const User = require("../models/userModel.js");
const argon2 = require("argon2");

const getUsers = async(req,res)=>{

    
    try{
        const response = await User.findAll({
            attributes:['uuid','name','email','role','profileImage']
        });
        res.status(200).json(response);
    } catch(error){
        res.status(500).json({msg:error.message});

    }

}

const getUserById = async(req,res)=>{
    try{
        const response = await User.findOne({
            attributes:['uuid','name','email','role','profileImage'],
            where:{
                uuid:req.params.id
            }
        });
        res.status(200).json(response);

    } catch (error){
        res.status(500).json({ msg:error.message });
    }
    
}
const createUser = async (req, res) => {
    const { name, email, password, confPassword, role } = req.body;

    // Check if passwords match
    if (password !== confPassword) return res.status(400).json({ msg: "Password confirmation doesn't match" });

    // Hash the password
    const hashPassword = await argon2.hash(password);

    // Handle the file upload if it exists
    let profileImage = 'uploads\\default.png';
    if (req.file) {
        profileImage = req.file.path;  // Save the path of the uploaded image

    }

    try {
        await User.create({
            name: name,
            email: email,
            password: hashPassword,
            role: role,
            profileImage: profileImage  // Save the image path in the database
        });
        res.status(201).json({ msg: "User registered successfully" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

const updateUser = async (req, res) => {
    const user = await User.findOne({
        where: {
            uuid: req.params.id
        }
    });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const { name, email, password, confPassword, role } = req.body;
    let hashPassword = user.password;

    // Update the password if it's provided
    if (password && password !== "") {
        if (password !== confPassword) return res.status(400).json({ msg: "Password confirmation doesn't match" });
        hashPassword = await argon2.hash(password);
    }

    // Handle the file upload if a new image is provided
    let profileImage = user.profileImage;  // Keep existing image if not updated
    if (req.file) {
        profileImage = req.file.path;  // Update the path with the new file
    }

    try {
        await User.update({
            name: name,
            email: email,
            password: hashPassword,
            role: role,
            profileImage: profileImage  // Save the updated image path
        }, {
            where: {
                id: user.id
            }
        });
        res.status(200).json({ msg: "User updated successfully" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};


const deleteUser = async(req,res)=>{
    const user = await User.findOne({
        where:{
            uuid:req.params.id
        }
    });
    if (!user) return res.status(404).json({msg:"User tideak ditek"});
 try{
        await User.destroy({
            
      
            where:{
                id:user.id
            }
        });
        res.status(200).json({msg:"user deleted"});
    
    } catch(error){
        res.status(400).json({msg:error.message});
    
    }

}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};