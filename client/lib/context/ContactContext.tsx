// context/ContractContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import MonsterNFT from '@/lib/MonsterNFT.json'
import { useAccount, useWalletClient } from 'wagmi'

type ContractContextType = {
  contract: ethers.Contract | null
  isLoading: boolean
  error: string | null
}

const ContractContext = createContext<ContractContextType>({
  contract: null,
  isLoading: true,
  error: null
})

export function ContractProvider({ children }: { children: React.ReactNode }) {
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Use Wagmi hooks to get the connected account
  const { isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()

  useEffect(() => {
    async function initContract() {
      try {
        const contractAddress = process.env.NEXT_PUBLIC_MONSTER_NFT
        
        if (!contractAddress) {
          throw new Error('Contract address not configured')
        }

        if (!isConnected || !walletClient) {
          // No wallet connected, set contract to null
          setContract(null)
          return
        }

        // Convert viem WalletClient to ethers.js signer
        const { account, chain, transport } = walletClient
        const network = {
          chainId: chain.id,
          name: chain.name,
          ensAddress: chain.contracts?.ensRegistry?.address,
        }
        const provider = new ethers.BrowserProvider(transport, network)
        const signer = await provider.getSigner(account.address)

        const contract = new ethers.Contract(
          contractAddress,
          MonsterNFT, // Make sure you're using the ABI property
          signer
        )

        setContract(contract)
        setError(null)
      } catch (err) {
        console.error('Error initializing contract:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize contract')
        setContract(null)
      } finally {
        setIsLoading(false)
      }
    }

    initContract()
  }, [isConnected, walletClient]) // Re-initialize when connection changes

  return (
    <ContractContext.Provider value={{ contract, isLoading, error }}>
      {children}
    </ContractContext.Provider>
  )
}

export const useContract = () => useContext(ContractContext)