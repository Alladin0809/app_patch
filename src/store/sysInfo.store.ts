import { create } from 'zustand'

export type UserInfo = {
    privy_device_id: string
    wallet?: string
    claim_amount?: number
    unclaim_amount?: number
    ticket: number
}

type SystemState = {
    solPrice: number
    now?: number
    date?: string
    update: boolean
    tokenAddress?: string
    userInfo: UserInfo | null
    config_pubkey?: string
    init: (sysInfo: any) => void
    setUpdate: () => void
    setUserInfo: (u: UserInfo | null) => void
}

export const useSystemStore = create<SystemState>((set) => ({
    solPrice: 0,
    now: 0,
    date: '',
    update: true,
    tokenAddress: 'ErgqnYQdA8hqXfdVgNZhybq6W6K4MhsHs7gRyKjhwave',
    userInfo: null,

    init(sysInfo) {
        console.log('init:' + JSON.stringify(sysInfo.sol_price))
        if (sysInfo) {
            set({
                solPrice: Number(sysInfo.sol_price),
                now: sysInfo.now,
                date: sysInfo.date,
                config_pubkey: sysInfo.config_pubkey,
                tokenAddress: 'ErgqnYQdA8hqXfdVgNZhybq6W6K4MhsHs7gRyKjhwave',
                update: false,
            })
        }
    },

    setUpdate() {
        set({
            update: true,
        })
    },

    setUserInfo(u: UserInfo | null) {
        set({
            userInfo: u,
        })
    },
}))
