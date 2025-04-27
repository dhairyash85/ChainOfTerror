// hooks/useMonsterNFT.js
"use client";

import { useContract } from "@/lib/context/ContactContext";
import { useState } from "react";

export function useMonsterNFT() {
  const { contract } = useContract();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mintMonster = async (player, tokenId, name, personality) => {
    if (!contract) {
      setError("Contract not initialized");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const tx = await contract.mintMonster(player, tokenId, name, personality);
      await tx.wait();
      return tx.hash;
    } catch (err) {
      console.error("Error minting monster:", err);
      setError(err instanceof Error ? err.message : "Failed to mint monster");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMonster = async (tokenId, newPersonality, additionalFailures) => {
    if (!contract) {
      setError("Contract not initialized");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const tx = await contract.updateMonster(
        tokenId,
        newPersonality,
        additionalFailures
      );
      await tx.wait();
      return tx.hash;
    } catch (err) {
      console.error("Error updating monster:", err);
      setError(err instanceof Error ? err.message : "Failed to update monster");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getMonster = async (tokenId) => {
    if (!contract) {
      setError("Contract not initialized");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const monster = await contract.getMonster(tokenId);
      return {
        name: monster[0],
        personality: monster[1],
        failures: monster[2].toString(),
        lastUpdated: monster[3].toString(),
      };
    } catch (err) {
      console.error("Error getting monster:", err);
      setError(err instanceof Error ? err.message : "Failed to get monster");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mintMonster,
    updateMonster,
    getMonster,
    isLoading,
    error,
    contract,
  };
}
