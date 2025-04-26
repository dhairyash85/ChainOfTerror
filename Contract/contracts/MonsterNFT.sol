// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonsterNFT is ERC721, Ownable {
    
    struct Monster {
        string name;
        string personality; 
        uint256 failures;  
        uint256 lastUpdated;
    }

    
    mapping(uint256 => Monster) public monsters;

    
    address public gameServer;

    
    event MonsterCreated(uint256 tokenId, string name, string personality);
    event MonsterUpdated(uint256 tokenId, string newPersonality, uint256 failures);

    constructor() ERC721("HorrorMonster", "MNSTR") Ownable(msg.sender) {
        gameServer=msg.sender;
    }

    
    function setGameServer(address _gameServer) external onlyOwner {
        gameServer = _gameServer;
    }

    
    function mintMonster(
        address player,
        uint256 tokenId,
        string memory name,
        string memory personality
    ) external {
        require(msg.sender == owner() || msg.sender == gameServer, "Not authorized");
        _safeMint(player, tokenId);
        monsters[tokenId] = Monster(name, personality, 0, block.timestamp);
        emit MonsterCreated(tokenId, name, personality);
    }

    
    function updateMonster(
        uint256 tokenId,
        string memory newPersonality,
        uint256 additionalFailures
    ) external {
        require(msg.sender == gameServer, "Only game server can update");

        Monster storage monster = monsters[tokenId];
        monster.personality = newPersonality;
        monster.failures += additionalFailures;
        monster.lastUpdated = block.timestamp;

        emit MonsterUpdated(tokenId, newPersonality, monster.failures);
    }

    
    function getMonster(uint256 tokenId) external view returns (
        string memory name,
        string memory personality,
        uint256 failures,
        uint256 lastUpdated
    ) {
        Monster memory monster = monsters[tokenId];
        return (monster.name, monster.personality, monster.failures, monster.lastUpdated);
    }
}