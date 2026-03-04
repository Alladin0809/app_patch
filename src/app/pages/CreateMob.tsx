// pages/CreateBattle.tsx
import React, { useState, useRef } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Loading } from '../components/Loading'
import { IMAGE2IPFSURL, JSON2IPFSURL } from '../../service/lib.upload.js';
type CreateMobProps = {
    onCreateMob: (token: TokenFormData, socialLinks: SocialLinks) => Promise<string | null>;
    onToast?: (message: string) => void;
    walletAddress: string | null;
};

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

export function CreateMob({ onCreateMob, onToast, walletAddress }: CreateMobProps) {
    const [token, setToken] = useState<TokenFormData>({
        name: '',
        symbol: '',
        logoUrl: '',
        logoPreview: '',
        prebuy: 0
    });

    const [socialLinks, setSocialLinks] = useState<SocialLinks>({
        website: '',
        telegram: '',
        twitter: '',
        description: '',
    });

    const [loading, setLoading] = useState(false);
    const tickerTimerRef = useRef<number | null>(null)

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        const maxSize = 3 * 1024 * 1024;
        if (file?.size && file?.size > maxSize) {
            onToast && onToast("Image size must be ≤ 3MB")
            return;
        }

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setToken({ ...token, logoPreview: reader.result as string });
            };
            reader.readAsDataURL(file);

            //Upload to ifps
            setLoading(true);
            IMAGE2IPFSURL(file).then((url) => {
                setLoading(false);
                console.log("IMAGE2IPFSURL:" + url);
                setToken({ ...token, logoUrl: url as string, logoPreview: reader.result as string });
            }).catch((err) => {
                setLoading(false);
                console.warn("IMAGE2IPFSURL:" + err);
            });
        }
    }

    function checkZhInputValid(input: string) {

        if (!input) return true

        const reg = /[\u4e00-\u9fa5]/;
        console.log("checkZhInputValid " + input)
        if (reg.test(input)) {
            const reg2 = /^[\u4e00-\u9fa5]{1,3}$/
            if (!reg2.test(input)) {
                return false
            }
        }
        return true
    }


    const handleTickerInput = (event: React.ChangeEvent<HTMLInputElement>) => {

        event.target.value = event.target.value.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')

        setToken({ ...token, symbol: event.target.value })

        // 2S 去抖动检测
        if (tickerTimerRef.current) {
            window.clearTimeout(tickerTimerRef.current)
        }

        let oldValue = event.target.value
        tickerTimerRef.current = window.setTimeout(() => {
            console.log("handleTickerInput new: " + event.target.value)
            if (event.target.value == oldValue && !checkZhInputValid(event.target.value)) {
                if (onToast) onToast("中文支持3个字符")
                setToken({ ...token, symbol: event.target.value = "" })
                return;
            }
        }, 2000);

    }

    const checkAllValid = () => {

        //console.log("checkAllValid" + JSON.stringify(token))
        if (!!!token.logoUrl) {
            if (onToast) onToast("Token Logo not upload.")
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (checkAllValid()) {
            setLoading(true);
            try {

                let id = await onCreateMob(token, socialLinks);
                setLoading(false);
                if (id != null) {
                    onToast && onToast("created successfully!")
                } else {
                    onToast && onToast("Failed to create")
                }
            } catch (error) {
                console.error("handleSubmit error:" + error);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {loading && <Loading size={56}></Loading>}
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-slate-900">Create a new token</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="
        rounded-3xl
        bg-white/80
        backdrop-blur-xl
        border border-white/60
        shadow-[0_18px_45px_rgba(15,23,42,0.08)]
        p-6 md:p-8
        space-y-8
      ">
                {/* Token A */}
                <div className="space-y-4">
                    <div className="space-y-4">
                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm text-slate-500 mb-2">
                                Token Logo
                            </label>
                            <div className="flex items-center gap-4">
                                {token.logoPreview && (
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 shadow-lg">
                                        <img src={token.logoPreview} alt="Token A" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <label className="
                  flex-1
                  px-4 py-3
                  rounded-2xl
                  border-2 border-dashed border-slate-200
                  bg-slate-50
                  hover:bg-slate-100
                  hover:border-slate-300
                  cursor-pointer
                  transition-all duration-200
                  flex items-center justify-center gap-2
                  text-slate-600
                  ">
                                    <Upload className="w-5 h-5" />
                                    <span className="text-sm">Click to upload image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e)}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="tokenA-name" className="block text-sm text-slate-500 mb-2">
                                Token Name
                            </label>
                            <input
                                id="tokenA-name"
                                type="text"
                                maxLength={40}
                                required
                                value={token.name}
                                onChange={(e) => setToken({ ...token, name: e.target.value })}
                                placeholder="e.g., Doga Coin"
                                className="
                  w-full
                  px-4 py-3
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  text-slate-900
                  placeholder:text-slate-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-slate-900/20
                  focus:border-slate-900
                  transition-all duration-200
                "
                            />
                        </div>

                        <div>
                            <label htmlFor="tokenA-symbol" className="block text-sm text-slate-500 mb-2">
                                Token Symbol
                            </label>
                            <input
                                id="tokenA-symbol"
                                type="text"
                                maxLength={10}
                                required
                                value={token.symbol}
                                onChange={(e) => handleTickerInput(e)}
                                placeholder="e.g., DOGA"
                                className="
                  w-full
                  px-4 py-3
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  text-slate-900
                  placeholder:text-slate-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-slate-900/20
                  focus:border-slate-900
                  transition-all duration-200
                "
                            />
                        </div>


                        <div>
                            <label htmlFor="tokenA-prebuy" className="block text-sm text-slate-500 mb-2">
                                Token Prebuy
                            </label>
                            <input
                                id="tokenA-prebuy"
                                disabled={true}
                                type="number"
                                step="0.01" min="0.05"
                                required
                                value={token.prebuy}
                                onChange={(e) => setToken({ ...token, prebuy: Number(e.target.value) })}
                                placeholder="0"
                                className="
                  w-full
                  px-4 py-3
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  text-slate-900
                  placeholder:text-slate-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-slate-900/20
                  focus:border-slate-900
                  transition-all duration-200
                "
                            />
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200" />

                {/* Community Information */}
                <div className="space-y-4">
                    <h3 className="text-slate-900">Community Information</h3>
                    <div>
                        <label htmlFor="description" className="block text-sm text-slate-500 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            maxLength={400}
                            value={socialLinks.description}
                            onChange={(e) => setSocialLinks({ ...socialLinks, description: e.target.value })}
                            placeholder="Brief description of this battle..."
                            className="
                w-full
                px-4 py-3
                rounded-2xl
                border border-slate-200
                bg-white
                text-slate-900
                placeholder:text-slate-400
                focus:outline-none
                focus:ring-2
                focus:ring-slate-900/20
                focus:border-slate-900
                transition-all duration-200
                resize-none
              "
                        />
                    </div>

                    <div>
                        <label htmlFor="website" className="block text-sm text-slate-500 mb-2">
                            Website
                        </label>
                        <input
                            id="website"
                            type="url"
                            maxLength={200}
                            value={socialLinks.website}
                            onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                            placeholder="https://..."
                            className="
                w-full
                px-4 py-3
                rounded-2xl
                border border-slate-200
                bg-white
                text-slate-900
                placeholder:text-slate-400
                focus:outline-none
                focus:ring-2
                focus:ring-slate-900/20
                focus:border-slate-900
                transition-all duration-200
              "
                        />
                    </div>

                    <div>
                        <label htmlFor="telegram" className="block text-sm text-slate-500 mb-2">
                            Telegram
                        </label>
                        <input
                            id="telegram"
                            type="url"
                            maxLength={200}
                            value={socialLinks.telegram}
                            onChange={(e) => setSocialLinks({ ...socialLinks, telegram: e.target.value })}
                            placeholder="https://t.me/..."
                            className="
                w-full
                px-4 py-3
                rounded-2xl
                border border-slate-200
                bg-white
                text-slate-900
                placeholder:text-slate-400
                focus:outline-none
                focus:ring-2
                focus:ring-slate-900/20
                focus:border-slate-900
                transition-all duration-200
              "
                        />
                    </div>

                    <div>
                        <label htmlFor="twitter" className="block text-sm text-slate-500 mb-2">
                            X (Twitter)
                        </label>
                        <input
                            id="twitter"
                            type="url"
                            maxLength={200}
                            value={socialLinks.twitter}
                            onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                            placeholder="https://x.com/..."
                            className="
                w-full
                px-4 py-3
                rounded-2xl
                border border-slate-200
                bg-white
                text-slate-900
                placeholder:text-slate-400
                focus:outline-none
                focus:ring-2
                focus:ring-slate-900/20
                focus:border-slate-900
                transition-all duration-200
              "
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="
                        max-w-xs
                        w-full
                        px-6 py-3.5
                        rounded-full
                        bg-black
                        text-white
                        hover:bg-slate-800
                        transition-all duration-200
                      "
                    // onClick={(e) => {
                    //     if (!walletAddress) {
                    //         e.preventDefault();
                    //         onToast && onToast("Wallet disconnect")
                    //     }
                    // }}
                    >
                        Deploy Now
                    </button>
                </div>
            </form>
        </div>

    );
}