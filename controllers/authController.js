import User from "../models/User.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "dotenv"
config()

const JWT_SECRET = process.env.JWT_SECRET




const saltRound = 10;

export const registerUser = async (req, res)=>{

    try {
        const {fullname, username, email, phone, address, gender, password, role} = req.body;

        const user = await User.findOne({username: username});

        if(user){
            res.status(400).json({message: "username already exists, please choose another username"})
        }

        const hashedPassword = bcrypt.hash(password, saltRound)

        const userData = {
            fullname: fullname,
            username: username,
            email: email,
            phone: phone,
            address: address,
            gender: gender,
            password: hashedPassword,
            role: role
        }

        const newUser = User(userData)

        await newUser.save();
        
    } catch (error) {
        res.status(500).json({message: "Internal server error", error: error})
    }
        
}


export const loginUSer = async (req, res) => {

    const {username, password} = req.body;


    const user = await User.findOne({username: username});

    if(!user){
         res.status(401).json({message: "Username or Password is incorrect"})
    }

    const isMatched = await bcrypt.compare(password, user.password)

    if(isMatched){
        const token = jwt.sign({id: user._id, role: user.role, name: user.fullname}, JWT_SECRET, {expiresIn: 60 * 60 * 24 * 1});
        return res.status(200).json({message: "user successfully logged in", token, role: user.role})
    }else{
        return res.status(401).json({message: "Username or Password is incorrect"})
    }

}



export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // You can select specific fields if needed
    const { _id, fullname, username, email, phone, address, gender, role } = req.user;

    return res.status(200).json({
      success: true,
      user: {
        id: _id,
        fullname,
        username,
        email,
        phone,
        address,
        gender,
        role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};
