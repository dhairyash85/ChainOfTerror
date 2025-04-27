import ConnectWallet from "@/components/ConnectWallet";
import GameScene from "@/models/GameScene";

export default function Home() {
  return (
    <div>
      <ConnectWallet />
        <GameScene />
    </div>
  )
}