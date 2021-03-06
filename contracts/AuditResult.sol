
// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity 0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

/// @title Audit Results NFT tokens representing the Results information and evidence sumbitted by the auditors 
/// in the Decentralized Audits system
/// @author Enrique R. D'Angelo
/// @dev Extends the oppenzeppelin ERC721URIStorage implementation

contract AuditResult is ERC721URIStorage {
    using Counters for Counters.Counter;
    // Unique identifier for Audit Items (Tokens)
    Counters.Counter private _tokenIds;
    // Address of the Audit Item Proxy with Audit Logic
    address dAuditAddress;

    /// @notice Constructor of the smart contract
    /// @param dAudAddress Address of the DAudit Item Proxy with Audit Logic    
    constructor(address dAudAddress) ERC721("Daudit Result Tokens", "DAUDR") {
        dAuditAddress = dAudAddress;
    }
    /// Event emitted when creating the Audit Items tokens
    event createAuditResultLog (
        uint256 indexed itemId,
        string indexed tokenURI
    );
    function createToken(string memory tokenURI) public returns (uint) {
        // Increment de tokenId for the next token to minted
        _tokenIds.increment();
        // Assign the new counter value and mint
        uint256 newItemId = _tokenIds.current();

        // Mint the new token and assign it to the message sender as the owner
        _mint(msg.sender, newItemId);

        // Assign the tokenURI passed as a parameter
        // Both functions inherited from ERC721URIStorage.sol
        _setTokenURI(newItemId, tokenURI);

        // Grant access to the DAudit contract to transfer the token to different users
        setApprovalForAll(dAuditAddress, true);

        emit createAuditResultLog(newItemId,tokenURI);

        // Return the tokenId
        return newItemId;
    }
}