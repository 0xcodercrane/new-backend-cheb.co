"use client"
import { useEffect, useState } from 'react';
import { 
    useReadContract,
    useWriteContract,
    useWaitForTransaction,
    useWatchContractEvent
} from 'wagmi';
import abi from './abi/abi.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CHEB_PAYMENTS_ADDRESS;

/**
 * 
 *  READ HOOKS
 * 
 */
export const useGetOrderDetails = (orderHash) => {
    const { data, isLoading, isError } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'getOrderDetails',
        args: [orderHash],
        query: {
            enabled: Boolean(orderHash),
        }
    });

    return {
        orderDetails: data ? {
            exists: data[0],
            productPrice: data[1],
            platformFee: data[2],
            isDelivered: data[3],
            isPaid: data[4],
            isCancelled: data[5]
        } : null,
        isLoading,
        isError
    };
};

export const useGetTreasury = () => {
    const { data, isLoading, isError } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'getTreasury'
    });

    return {
        treasury: data,
        isLoading,
        isError
    };
};

export const useCalculatePlatformFee = (productPrice) => {
    const { data, isLoading, isError } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'calculatePlatformFee',
        args: [productPrice],
        query: {
            enabled: Boolean(productPrice),
        }
    });

    return {
        platformFee: data,
        isLoading,
        isError
    };
};

export const useGetTotalAmount = (productPrice) => {
    const { data, isLoading, isError } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'getTotalAmount',
        args: [productPrice],
        query: {
            enabled: Boolean(productPrice),
        }
    });

    return {
        totalAmount: data,
        isLoading,
        isError
    };
};

export const useCalculateCancellationAmounts = (productPrice) => {
    const { data, isLoading, isError } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'calculateCancellationAmounts',
        args: [productPrice],
        query: {
            enabled: Boolean(productPrice),
        }
    });

    return {
        cancellationAmounts: data ? {
            buyerRefund: data[0],
            sellerCompensation: data[1]
        } : null,
        isLoading,
        isError
    };
};

/**
 * 
 *  WRITE HOOKS
 * 
 */
export const useCreateOrder = (orderHash, seller, productPrice) => {
    const [hash, setHash] = useState('');
    
    const { writeContract, data, error, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

    useEffect(() => {
        if (data?.hash) {
            setHash(data.hash);
        }
    }, [data]);

    const createOrder = async () => {
        if (!orderHash || !seller || !productPrice) return;
        
        try {
            await writeContract({
                address: CONTRACT_ADDRESS,
                abi,
                functionName: 'createOrder',
                args: [orderHash, seller, productPrice]
            });
        } catch (err) {
            console.error('Error creating order:', err);
        }
    };

    return {
        createOrder,
        isLoading: isPending || isConfirming,
        isSuccess,
        error,
        hash
    };
};





/**
 * 
 *  EVENT HOOKS
 * 
 */
export const useOrderEvents = (callbacks) => {
    useWatchContractEvent({
        address: CONTRACT_ADDRESS,
        abi,
        eventName: 'OrderCreated',
        onLogs(logs) {
            for (const log of logs) {
                const { args } = log;
                if (args) {
                    callbacks?.onOrderCreated?.({
                        orderHash: args[0],
                        buyer: args[1],
                        productPrice: args[2],
                        platformFee: args[3]
                    });
                }
            }
        }
    });

    
};