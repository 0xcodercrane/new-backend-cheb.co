"use client"
import { useEffect, useState } from 'react';
import { 
    useReadContract,
    useWriteContract,
    useWaitForTransaction,
} from 'wagmi';
import tokenABI from './abi/abi.json' assert { type: 'json' };

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SKALE_USDC_TOKEN;

/**
 * 
 *  READ HOOKS
 * 
 */
export const useTokenName = () => {
    const { data: name, isLoading, isError } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: tokenABI,
        functionName: 'name'
    });

    return { name, isLoading, isError };
};

export const useTokenSymbol = () => {
    const { data: symbol, isLoading, isError } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: tokenABI,
        functionName: 'symbol'
    });

    return { symbol, isLoading, isError };
};

export const useTokenDecimals = () => {
    const { data: decimals, isLoading, isError } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: tokenABI,
        functionName: 'decimals'
    });

    return { decimals, isLoading, isError };
};

export const useTokenTotalSupply = () => {
    const { data: totalSupply, isLoading, isError } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: tokenABI,
        functionName: 'totalSupply'
    });

    return { totalSupply, isLoading, isError };
};

export const useTokenBalance = (address) => {
    const { data: balance, isLoading, isError } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: tokenABI,
        functionName: 'balanceOf',
        args: [address],
        enabled: Boolean(address),
        watch: true
    });

    return { balance, isLoading, isError };
};

export const useTokenAllowance = (owner, spender) => {
    const { data: allowance, isLoading, isError, refetch } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: tokenABI,
        functionName: 'allowance',
        args: [owner, spender],
        enabled: Boolean(owner && spender),
        watch: true
    });

    return { allowance, isLoading, isError, refetch };
};

export const useTokenOwner = () => {
    const { data: owner, isLoading, isError } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: tokenABI,
        functionName: 'owner'
    });

    return { owner, isLoading, isError };
};

/**
 * 
 *  WRITE HOOKS
 * 
 */
export const useTokenApprove = (spender, amount) => {
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

    const approve = async () => {
        if (!spender || !amount) return;
        
        try {
            await writeContract({
                address: TOKEN_ADDRESS,
                abi: tokenABI,
                functionName: 'approve',
                args: [spender, amount]
            });
        } catch (err) {
            console.error('Error approving tokens:', err);
        }
    };

    return {
        approve,
        isLoading: isPending || isConfirming,
        isSuccess,
        error,
        hash
    };
};

export const useTokenTransfer = (recipient, amount) => {
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

    const transfer = async () => {
        if (!recipient || !amount) return;
        
        try {
            await writeContract({
                address: TOKEN_ADDRESS,
                abi: tokenABI,
                functionName: 'transfer',
                args: [recipient, amount]
            });
        } catch (err) {
            console.error('Error transferring tokens:', err);
        }
    };

    return {
        transfer,
        isLoading: isPending || isConfirming,
        isSuccess,
        error,
        hash
    };
};

export const useTokenTransferFrom = (sender, recipient, amount) => {
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

    const transferFrom = async () => {
        if (!sender || !recipient || !amount) return;
        
        try {
            await writeContract({
                address: TOKEN_ADDRESS,
                abi: tokenABI,
                functionName: 'transferFrom',
                args: [sender, recipient, amount]
            });
        } catch (err) {
            console.error('Error transferring tokens:', err);
        }
    };

    return {
        transferFrom,
        isLoading: isPending || isConfirming,
        isSuccess,
        error,
        hash
    };
};

export const useTokenMint = (recipient, amount) => {
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

    const mint = async () => {
        if (!recipient || !amount) return;
        
        try {
            await writeContract({
                address: TOKEN_ADDRESS,
                abi: tokenABI,
                functionName: 'mint',
                args: [recipient, amount]
            });
        } catch (err) {
            console.error('Error minting tokens:', err);
        }
    };

    return {
        mint,
        isLoading: isPending || isConfirming,
        isSuccess,
        error,
        hash
    };
};

export const useTransferOwnership = (newOwner) => {
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

    const transferOwnership = async () => {
        if (!newOwner) return;
        
        try {
            await writeContract({
                address: TOKEN_ADDRESS,
                abi: tokenABI,
                functionName: 'transferOwnership',
                args: [newOwner]
            });
        } catch (err) {
            console.error('Error transferring ownership:', err);
        }
    };

    return {
        transferOwnership,
        isLoading: isPending || isConfirming,
        isSuccess,
        error,
        hash
    };
};

export const useRenounceOwnership = () => {
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

    const renounceOwnership = async () => {
        try {
            await writeContract({
                address: TOKEN_ADDRESS,
                abi: tokenABI,
                functionName: 'renounceOwnership'
            });
        } catch (err) {
            console.error('Error renouncing ownership:', err);
        }
    };

    return {
        renounceOwnership,
        isLoading: isPending || isConfirming,
        isSuccess,
        error,
        hash
    };
};