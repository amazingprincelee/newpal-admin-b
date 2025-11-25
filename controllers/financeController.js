import WithdrawalRequest from "../models/withdrawalRequest.js";
import { getPaystackBalance, createRecipient, transferFunds } from "../config/paystack.js";

// FINANCE: View Paystack balance
export const viewPaystackBalance = async (req, res) => {
  const balance = await getPaystackBalance();
  res.json({ balance });
};

// FINANCE: Create withdrawal request
export const requestWithdrawal = async (req, res) => {
  const { amount, bankName, bankCode, accountNumber } = req.body;

  const currentBalance = await getPaystackBalance();

  if (amount > currentBalance) {
    return res.status(400).json({ message: "Amount exceeds available Paystack balance" });
  }

  const newRequest = await WithdrawalRequest.create({
    amount,
    bankName,
    bankCode,
    accountNumber,
    status: "pending",
    financeUser: req.user._id
  });

  res.json({ message: "Withdrawal request submitted", request: newRequest });
};

// ADMIN: Approve withdrawal
export const approveWithdrawal = async (req, res) => {
  const request = await WithdrawalRequest.findById(req.params.id);

  if (!request) return res.status(404).json({ message: "Request not found" });

  // Step 1: Create Paystack recipient
  const recipientCode = await createRecipient({
    name: "Finance Dept",
    account_number: request.accountNumber,
    bank_code: request.bankCode
  });

  // Step 2: Transfer money
  const transfer = await transferFunds({
    amount: request.amount,
    recipient_code: recipientCode
  });

  request.status = "completed";
  await request.save();

  res.json({
    message: "Withdrawal approved & sent successfully",
    transfer
  });
};
