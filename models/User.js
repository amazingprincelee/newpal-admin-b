import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
    fullname: {type: String , required: true},
    username: {type: String, required: true, unique: true},
    email: {type: String},
    phone: {type: String, required: true},
    address: {type: String, required: true},
    gender: {type: String, enum: ["female", "male", "other"]},
    role: {
        type: String, 
        enum: [
            "super-admin", 
            "admin", 
            "gate", 
            "security", 
            "weighbridge",
            "inventory",
            "procurement",
            "sales",
            "dispatch",
            "production",
            "qa",
            "lab",
            "finance"
        ]},
    createdAt: {type: Date, default: Date.now},    
});


const User = mongoose.model("user", UserSchema);

export default User;