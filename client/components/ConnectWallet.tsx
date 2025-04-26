// components/ConnectButton.tsx
'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function WalletConnectButton() {
    return (
        <nav className='flex justify-between px-5 items-center mt-5'>
            <h1 className='font-bold text-3xl'>
                Chain Of Terror
            </h1>
            <ConnectButton
                accountStatus="full"
                chainStatus="full"
                showBalance={{
                    smallScreen: true,
                    largeScreen: true
                }}
            />
        </nav>
    )
}