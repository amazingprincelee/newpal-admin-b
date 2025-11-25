import mongoose from "mongoose";

const withdrawalRequestSchema = new mongoose.Schema({
  financeUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  bankName: String,
  bankCode: String,
  accountNumber: String,
  status: { type: String, default: "pending" }
});

export default mongoose.model("WithdrawalRequest", withdrawalRequestSchema);
