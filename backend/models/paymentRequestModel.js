import mongoose from 'mongoose';

const paymentRequestSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        walletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Wallet',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0.01,
        },
        paymentMethod: {
            type: String,
            required: true,
            default: 'Bank Transfer',
        },
        bankAccountDetails: {
            accountNumber: {
                type: String,
                required: true,
            },
            bankName: {
                type: String,
                required: true,
            },
            accountHolderName: {
                type: String,
                required: true,
            },
        },
        status: {
            type: String,
            enum: ['pending', 'approved-processing', 'rejected', 'completed'],
            default: 'pending',
        },
        requestDate: {
            type: Date,
            default: Date.now,
        },
        approvalDate: {
            type: Date,
        },
        rejectionReason: {
            type: String,
        },
        referenceId: {
            type: String,
        },
    },
    { timestamps: true }
);

const PaymentRequest = mongoose.model('PaymentRequest', paymentRequestSchema);

export default PaymentRequest;