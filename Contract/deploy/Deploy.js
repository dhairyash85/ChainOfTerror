const {ethers}=require("hardhat")

const main=async()=>{
  const monster=await ethers.getContractFactory("MonsterNFT");
  const Monster=await monster.deploy()
  console.log(Monster.target)
}

main().then(()=>console.log("Complete!")).catch((er)=>console.log(er))