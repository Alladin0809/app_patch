import React from 'react';
import { CreateMob } from './CreateMob';
import { useWalletStore } from '@/store/wallet.store'
import { toast } from 'sonner'
import { useDeployService } from '@/hooks/useDeployService';

type TokenFormData = {
    name: string;
    symbol: string;
    logoUrl: string;
    logoPreview: string;
    prebuy: number;
};

type SocialLinks = {
    website: string;
    telegram: string;
    twitter: string;
    description: string;
};

export function CreateMobPage() {
    const walletAddress = useWalletStore((state) => state.address);
    const token = useWalletStore((state) => state.token);
    const { handleCreateProduct } = useDeployService();

    const handleCreateMob = async (tokenData: TokenFormData, socialLinks: SocialLinks): Promise<string | null> => {
        // if (!token) {
        //     toast.error('Please login first');
        //     return null;
        // }

        // if (!walletAddress) {
        //     toast.error('Please connect wallet first');
        //     return null;
        // }

        try {

            let result = await handleCreateProduct({
                formatMeta: () => {
                    console.log('formatMeta')
                    const params = {
                        name: tokenData.name,
                        symbol: tokenData.symbol,
                        image: tokenData.logoUrl,
                        description: socialLinks.description,
                        website: socialLinks.website,
                        twitter: socialLinks.twitter,
                        telegram: socialLinks.telegram
                    }
                    return params
                },

                formatParams: () => {
                    console.log('formatParams')
                    const params = {
                        name: tokenData.name,
                        symbol: tokenData.symbol,
                        logo: tokenData.logoUrl,
                    }
                    return params
                },
                onToast: (text, res) => {
                    if (res == 'error') {
                        toast.error(text)
                    }
                },
            })

            if (result && result.code === 200 && result.bundle_ids && result.bundle_ids.length > 0) {
                toast.success('Mob created successfully!');
                return result.bundle_ids[0];
            }
            return null;
        } catch (error) {
            console.error('Create  error:', error);
            toast.error('Failed to create mob: ' + (error instanceof Error ? error.message : 'Unknown error'));
            return null;
        }
    };

    const handleToast = (message: string) => {
        toast.success(message);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
            <CreateMob
                onCreateMob={handleCreateMob}
                onToast={handleToast}
                walletAddress={walletAddress || null}
            />
        </div>
    );
}
