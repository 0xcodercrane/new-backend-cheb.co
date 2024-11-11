// Server functions

import { ethers } from 'ethers';
import abi from './abi/abi.json' assert { type: 'json' };
import dotenv from 'dotenv';

dotenv.config();

const RPC_URL = process.env.SKALE_TESTNET_RPC;
const CONTRACT_ADDRESS = process.env.SKALE_CHEB_PAYMENTS;
const PLATFORM_PRIVATE_KEY = process.env.PLATFORM_PRIVATE_KEY;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const platformWallet = new ethers.Wallet(PLATFORM_PRIVATE_KEY, provider);


/**
 * 
 *  READ HOOKS
 * 
 */
export const getOrderDetails = async (orderHash) => {
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
        const data = await contract.getOrderDetails(orderHash);
        return {
            success: true,
            order: {
                exists: data[0],
                productPrice: data[1].toString(),
                platformFee: data[2].toString(),
                isDelivered: data[3],
                isPaid: data[4],
                isCancelled: data[5]
            }
        };
    } catch (err) {
        console.error("Error getting order details:", err);
        return { success: false, error: err };
    }
};

export const getTreasury = async () => {
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
        const treasury = await contract.getTreasury();
        return { success: true, treasury };
    } catch (err) {
        console.error("Error getting treasury address:", err);
        return { success: false, error: err };
    }
};

export const calculatePlatformFee = async (productPrice) => {
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
        const fee = await contract.calculatePlatformFee(productPrice);
        return { success: true, fee: fee.toString() };
    } catch (err) {
        console.error("Error calculating platform fee:", err);
        return { success: false, error: err };
    }
};

export const getTotalAmount = async (productPrice) => {
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
        const total = await contract.getTotalAmount(productPrice);
        return { success: true, totalAmount: total.toString() };
    } catch (err) {
        console.error("Error calculating total amount:", err);
        return { success: false, error: err };
    }
};

export const calculateCancellationAmounts = async (productPrice) => {
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
        const [buyerRefund, sellerCompensation] = await contract.calculateCancellationAmounts(productPrice);
        return {
            success: true,
            buyerRefund: buyerRefund.toString(),
            sellerCompensation: sellerCompensation.toString()
        };
    } catch (err) {
        console.error("Error calculating cancellation amounts:", err);
        return { success: false, error: err };
    }
};


/**
 * 
 *  WRITE HOOKS
 * 
 */
export const platformConfirmDelivery = async (orderHash) => {
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, platformWallet);
        
        const gasEstimate = await contract.confirmDelivery.estimateGas(orderHash);
        console.log("Estimated gas for delivery confirmation:", gasEstimate.toString());

        const tx = await contract.confirmDelivery(
            orderHash,
            {
                gasLimit: Math.ceil(gasEstimate * 1.2) // Add 20% buffer
            }
        );

        const receipt = await tx.wait();

        return {
            success: true,
            transactionHash: tx.hash,
            orderHash
        };
    } catch (err) {
        console.error("Error confirming delivery:", err);
        return { success: false, error: err };
    }
};

export const platformCancelOrder = async (orderHash) => {
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, platformWallet);
        
        const gasEstimate = await contract.cancelOrder.estimateGas(orderHash);
        console.log("Estimated gas for order cancellation:", gasEstimate.toString());

        const tx = await contract.cancelOrder(
            orderHash,
            {
                gasLimit: Math.ceil(gasEstimate * 1.2)
            }
        );

        const receipt = await tx.wait();

        return {
            success: true,
            transactionHash: tx.hash,
            orderHash
        };
    } catch (err) {
        console.error("Error cancelling order:", err);
        return { success: false, error: err };
    }
};



export const validateOrderData = (orderData) => {
    if (!orderData.orderHash || !ethers.isHexString(orderData.orderHash, 32)) {
        return { success: false, error: "Invalid order hash" };
    }

    if (!orderData.seller || !ethers.isAddress(orderData.seller)) {
        return { success: false, error: "Invalid seller address" };
    }

    if (!orderData.productPrice || BigInt(orderData.productPrice) <= 0n) {
        return { success: false, error: "Invalid product price" };
    }

    return { success: true };
};

export const setupOrderEventListeners = (contract, callbacks) => {

    if (callbacks.onOrderDelivered) {
        contract.on("OrderDelivered", (orderHash, event) => {
            callbacks.onOrderDelivered(orderHash);
        });
    }

    if (callbacks.onPaymentReleased) {
        contract.on("PaymentReleased", (orderHash, event) => {
            callbacks.onPaymentReleased(orderHash);
        });
    }

    if (callbacks.onOrderCancelled) {
        contract.on("OrderCancelled", (orderHash, buyer, seller, buyerRefund, sellerCompensation, event) => {
            callbacks.onOrderCancelled({
                orderHash,
                buyer,
                seller,
                buyerRefund: buyerRefund.toString(),
                sellerCompensation: sellerCompensation.toString()
            });
        });
    }

    return () => {
        contract.removeAllListeners();
    };
};