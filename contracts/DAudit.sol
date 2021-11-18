// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "hardhat/console.sol";
import "./IAuditorAssignments.sol";
import "./IAuditorEnrollments.sol";

/// @title Decentralized Audit Main Smart Contract with business logic
/// @author Enrique R. D'Angelo
/// @notice DAudit is the smart contract containing the business logic for handling the audit processes.
/// @dev Extends ReentrancyGuard for preventing a contract from calling itself, directly or indirectly. 
/// Uses nonReentrant modifier on any functions that calls another smart contract.
/// Uses Safemath to prevent overflow checking
contract DAudit is ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    // Number of AuditItems submitted
    Counters.Counter private _itemIds;
    // Number of AuditItems pending
    Counters.Counter private _itemsPending;

    // Address of the Audit System owner to collect admin fees
    address payable owner;

    // Address of the auditor enrollments smart contract
    address payable auditEnrollmentsAddr;

    // Address of the auditor assignment  smart contract
    address payable auditAssignmentsAddr;

    // Fee payed by the producers, expressed in ETH because we use the chain token 
    uint256 listingFee = 0.0020 ether;

    /// @notice DAudit constructor called at deploy time, need to be called with the enrollments and assignments 
    /// smart contracts addresses
    /// @dev Make use of Enrollments and Assignments smart contracts which are initialized in the constructor (at deployment time) 
    /// which may be improved by implementing a registry of smart contracts in future versions. 
    /// @param _auditEnrollmentsAddr address of the AuditEnrollments smart contract
    /// @param _auditAssignmentsAddr address of the AuditAssignments smart contract
    constructor(address _auditEnrollmentsAddr, address _auditAssignmentsAddr) {
        // Establishes the owner as the one that deploys the DAudit contract
        owner = payable(msg.sender);
        auditEnrollmentsAddr = payable(_auditEnrollmentsAddr);
        auditAssignmentsAddr = payable(_auditAssignmentsAddr);
    }

    /// Audit Information
    struct AuditItemData {
        uint256 itemId;                     // Autonumber primary key of data structure       
        address nftContract;                // Nft Contract Address of the Audit Item
        uint256 tokenId;                    // Nft TokenId of the Audit Item
        address payable producer;           // Address of the person producing the audit and requiring to be auditted
        address payable owner;              // Owner of the Audit Item (can be the DAudit owner or the producer once audit is finished)
        uint256 auditFee;                   // Fee payed by the producer to the auditors
        uint256 listingFee;                 // Fee charged by the smart contract which covers expenses and commissions
        uint8 auditorReq;                   // Number of auditors required to complete the audit
        AuditItemStatus auditItemStatus;    // Status of the Audit Items in terms of progress of the audit activities (see below)
    }

    // <enum Status: AuditPending, InProgress, AuditOk, AuditFailed>
    // 0 = Pending    - Audit was just created and is pending to be assigned
    // 1 = InProgress - Auditors were assigned to the audit and are working on it.
    // 2 = Passed     - Auditors results were submitted and DAudit determined that the audit passed
    // 3 = Failed     - Auditors results were submitted and DAudit determined that the audit failed
    // 4 = Cancelled  - The audit was cancelled by the system - not enough auditors
    enum AuditItemStatus {
        Pending,
        InProgress,
        Passed,
        Failed,
        Cancelled
    }

    // Storage for the AuditItems and their Data, maps the tokenId of the AuditItem (NFT) to the AuditItemData 
    mapping(uint256 => AuditItemData) private idToAuditItemData;

    // Event to emit Audit Items being created, can listen them from tests and front end apps
    event AuditItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address producer,
        address owner,
        uint256 auditFee,
        uint256 listingFee,
        uint8 auditorReq,
        AuditItemStatus auditItemStatus
    );

    /// @notice Query the listing fee currently set up for the contract
    /// @return listing fee storage variable with the configuration of the listing fee 
    function getListingFee() public view returns (uint256) {
        return listingFee;
    }

    /// @notice Query the listing fee currently set up for the contract
    /// @param _listingFee fee charged for listing an audit item
    /// @dev updates the listing fee storage variable with the configuration of the listing fee 
    function setListingFee(uint256 _listingFee ) public onlyOwner {
        listingFee = _listingFee;
    }

    /// @notice Creates an auditItem and sets it available on the descentralized audit system
    /// @param nftContract Nft Contract Address of the Audit Item
    /// @param tokenId Nft TokenId of the Audit Item
    /// @param auditFee Fee payed by the producer to the auditors
    /// @param auditorsReq Number of auditors required to complete the audit
    function createAuditItem(
        address nftContract,
        uint256 tokenId,
        uint256 auditFee,
        uint8 auditorsReq
    ) public payable nonReentrant {
        require(auditFee > 0, "auditFee must be at least 1 wei");
        require(
            msg.value == auditFee + listingFee,
            "auditFee+ListingFee must be provided"
        );

        // We are creating a new Item, so we increment the itemIds counter and assign it to a new id in the list
        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        // Populate the AuditItem data

        idToAuditItemData[itemId] = AuditItemData(
            itemId, // autoincremented in this function
            nftContract, // parameter from the FrontEnd or function caller
            tokenId, // parameter from the FrontEnd or function caller
            payable(msg.sender), // the sender of the transaction is the "producer" of the auditItem
            payable(address(0)), // owner of the audit item is no-one
            auditFee, // parameters auditFee provided by the producer that will be distributed to the auditors
            listingFee, // current listing fee that will remain as a residual in the contract
            auditorsReq,
            AuditItemStatus.Pending
        ); // auditItemStatus set to Pending

        // Transfer the ownership of the AuditItem (NFT Token) to the DAudit smart contract
        // The DAudit smart contract will hold it until the audit is archived
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        // The createAuditItem function receives the auditFee + listingFee automatically
        // and credits in the DAudit smartContract balance

        emit AuditItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0), // owner of the audit item is no-one 
            auditFee,
            listingFee,
            auditorsReq,
            AuditItemStatus.Pending
        ); // auditItemStatus set to Pending
    }

    /// @notice Returns audits with status = Pending
    /// @return Array of AuditItemData
    function fetchPendingAudits() public view returns (AuditItemData[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 pendingItemsCount = _itemIds.current() -
            _itemsPending.current();
        uint256 currentIndex = 0;
        // Creates a fixedLegth arrat with  the size of pending items count
        AuditItemData[] memory items = new AuditItemData[](pendingItemsCount);
        // Iterates the array and only add itemas with AuditItemStatus.Pending
        for (uint256 i = 0; i < itemCount; i++) {
            if (
                idToAuditItemData[i + 1].auditItemStatus ==
                AuditItemStatus.Pending
            ) {
                uint256 currentId = i + 1;
                AuditItemData storage currentItem = idToAuditItemData[
                    currentId
                ];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
    /// @notice Returns all audits submitted to DAudit system
    /// @return Array of AuditItemData
    function fetchAudits() public view returns (AuditItemData[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 currentIndex = 0;
        // Creates a fixedLegth arrat with  the size of pending items count
        AuditItemData[] memory items = new AuditItemData[](itemCount);
        // Iterates the array and only add itemas with AuditItemStatus.Pending
        for (uint256 i = 0; i < itemCount; i++) {
                uint256 currentId = i + 1;
                AuditItemData storage currentItem = idToAuditItemData[
                    currentId
                ];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        return items;
    }

    /// @notice Returns all audits submitted to DAudit system for a given producer (msg.sender)
    /// @dev the producer parameter is obtained from the message sender
    /// @return Array of AuditItemData
    function fetchItemsProducer() public view returns (AuditItemData[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToAuditItemData[i + 1].producer == msg.sender) {
                itemCount += 1;
            }
        }

        AuditItemData[] memory items = new AuditItemData[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToAuditItemData[i + 1].producer == msg.sender) {
                uint256 currentId = i + 1;
                AuditItemData storage currentItem = idToAuditItemData[
                    currentId
                ];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /// @notice Returns Audit Item by TokenId
    /// @return AuditItemData structure with audit item information 
    function fetchAuditByTokenId(uint256 tokenId)
        public
        view
        returns (AuditItemData memory)
    {
        return idToAuditItemData[tokenId];
    }

    /// @notice Returns the numbers of auditors required for an AuditItem   
    /// @return auditorReq number of auditors required to complete the audit 
    function getAuditorsRequiredForAudit(uint256 tokenId)
        public
        view
        returns (uint8 auditorReq)
    {
        return idToAuditItemData[tokenId].auditorReq;
    }

    /// @notice Adds an auditor to the list of auditors enrolled for performing the audit
    /// @dev calls the AuditEnrollments smart contract associated to DAudit
    /// @param auditId TokenId of the Audit Item which auditor wants to be enrolled
    /// @param auditor address of the auditor who wants to be enrolled
    function enrollAuditor(uint256 auditId, address auditor) public payable nonReentrant {
        // Get Audit Item Data
        AuditItemData memory item = idToAuditItemData[auditId];
         // get the list of auditors enrolled for auditing the auditItem (tokenId)
        IAuditEnrollments AEnrollments = IAuditEnrollments(
            auditEnrollmentsAddr
        );
        require(auditor != item.producer, "Auditor cannot be the producer");
        AEnrollments.addAuditor(auditId, auditor);
    }

    /// @notice Assigns the auditors required for the audit processes from the enrolled ones
    /// @dev calls the AuditEnrollments and AuditAssignments smart contract associated to DAudit
    /// Random numbers won't be succeptible to any fraud if manipulated so we keep it simple and based on the block.timestamp
    /// @param auditId TokenId of the Audit Item which auditors wants to be assigned 
   function assignAuditors(uint256 auditId) public payable nonReentrant onlyOwner {
        // Get Audit Item Data
        AuditItemData memory item = idToAuditItemData[auditId];

        // get the list of auditors enrolled for auditing the auditItem (tokenId)
        IAuditEnrollments AEnrollments = IAuditEnrollments(
            auditEnrollmentsAddr
        );
        address[] memory auditorsEnrollArray = AEnrollments
            .getAuditEnrollment(auditId)
            .auditors;

        // auditors enrolled (itemCount) must be greater or equal to item.auditorReq
        require(
            item.auditorReq <= auditorsEnrollArray.length,
            "Not enough auditors enrolled"
        );

        // Creates a fixed length array to return the list of required auditors assigned
        address[] memory auditorsAssigned = new address[](item.auditorReq);

        // Iterates the auditors enrolled flipping the coin and selecting the ones to participate in the audit
        uint256 assignmentsCount = 0;

        // Loop until complete the auditors required
        uint256 randNonce = 0;
        do {
            for (uint256 i = 0; i < auditorsEnrollArray.length; i++) {
                // Flip the coin
                if ((randMod(2, randNonce)) == 0) {
                    if (
                        !isAddressInArray(
                            auditorsAssigned,
                            auditorsEnrollArray[i],
                            item.auditorReq
                        )
                    ) {
                        auditorsAssigned[
                            assignmentsCount
                        ] = auditorsEnrollArray[i];
                        assignmentsCount++;
                    }
                }
                if (assignmentsCount == item.auditorReq) break;
                randNonce++;
            }
        } while (assignmentsCount < item.auditorReq);

        // assign the auditor
        IAuditAssignments AAssignments = IAuditAssignments(
            auditAssignmentsAddr
        );
        AAssignments.insertAuditAssignment(auditId, auditorsAssigned);

        // emit the event

        // mark AuditItem to be inProgress
        idToAuditItemData[auditId].auditItemStatus = AuditItemStatus.InProgress;
    }

    /// @notice Internal function for generating a random number based on block.timestamp
    /// @param _modulus  random number probability ()
    /// @param randNonce seed
    function randMod(uint256 _modulus, uint256 randNonce)
        internal
        view
        returns (uint256)
    {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, msg.sender, randNonce)
                )
            ) % _modulus;
    }


    /// @notice Internal function for generating a random number based on block.timestamp
    /// @param arrayOfAddresses  array of addresses where to find if address exists
    /// @param findAddress address to be found
    /// @param l iterate array until element number l
    function isAddressInArray(
        address[] memory arrayOfAddresses,
        address findAddress,
        uint256 l
    ) private pure returns (bool) {
        for (uint256 i = 0; i < l; i++) {
            if (arrayOfAddresses[i] == findAddress) {
                return true;
            }
        }
        return false;
    }

    /// @notice Only allows assigned auditors to submit audit results
    /// @param  auditItemId audit item id to be checked
    modifier onlyAssignedAuditors(uint256 auditItemId) {
        IAuditAssignments AAssignments = IAuditAssignments(
            auditAssignmentsAddr
        );
        require(
            AAssignments.isAuditorAssigned(auditItemId, msg.sender),
            "The auditor in not assigned to the item"
        );
        _;
    }
    /// @notice Only Allows the owner of the smart contract to execute certain functions
    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    /// @notice Creates an Audit Result and sets it available on the distributed audit system
    ///  Anly assigned auditors can submit audit results
    /// @param nftContract Address of the AuditItem NFT contract
    /// @param auditItemId TokenId of the AuditItem
    /// @param tokenIdResult TokenId of the AuditResult
    /// @param auditResult AuditResult.Passed or AuditResult.Failed
    function createAuditResult(
        address nftContract,
        uint256 auditItemId,
        uint256 tokenIdResult,
        AuditResult auditResult
    ) public payable onlyAssignedAuditors(auditItemId) nonReentrant {

        IAuditAssignments AAssignments = IAuditAssignments(
            auditAssignmentsAddr
        );

        AAssignments.updateAuditResult(
            auditItemId,
            tokenIdResult,
            payable(msg.sender),
            auditResult == AuditResult.Passed
        );

        // Transfer the ownership of the AuditResult (NFT Token) to the DAudit smart contract
        // The DAudit smart contract will hold it until the audit is archived
        IERC721(nftContract).transferFrom(
            msg.sender,
            address(this),
            tokenIdResult
        );

        // Audit results submitted by the Auditor
        emit AuditResultCreated(
            auditItemId, // AuditItem Token Id 
            tokenIdResult, // Audit Result tokenId
            auditResult // Failed,Passed
        );
    }

    /// @notice Function triggered from the DAudit Smart Contract to pay the auditors 
    /// Transfers ownership of the item, as well as funds between auditors who participated in the audit 
    /// @param auditId token Id of the audit item 
    function payAuditors(uint256 auditId) public payable nonReentrant onlyOwner {
        // This function can only be called by the owner of the smart contract. 

        // Get the auditFee associated to the AuditItem
        uint256 auditFee = idToAuditItemData[auditId].auditFee;
        
        // The caller of this method will be this SmartContract which initially received the
        // auditFee + listing fee

        // Get the list of auditors assigned to the audit
        IAuditAssignments AAssignments = IAuditAssignments(
            auditAssignmentsAddr
        );
        IAuditAssignments.AuditAssignmentData memory aData = AAssignments
            .getAuditAssignment(auditId);

        bool[] memory results = aData.auditorResults;
        address[] memory auditors = aData.auditors;
        uint256[] memory auditorFees = aData.auditorFees;
        bool[] memory auditorFeePaid = aData.auditorFeePaid;

        // Validate final result, either all failed or pass the audit

        bool resultFinal = results[0];
        bool allMatch = true;
        for (uint256 i = 0; i < results.length; i++) {
            if (results[i] != resultFinal) {
                allMatch = false;
                break;
            }
        }
        require(
            allMatch,
            "All the Audit results must be the same for paying the auditors"
        );

        // Calculate Audit Fee for each auditor
        uint256 auditFeeAuditor = auditFee.div(auditors.length);
        console.log(auditFeeAuditor);
        for (uint256 i = 0; i < auditors.length; i++) {
            payable(auditors[i]).transfer(auditFeeAuditor); 
            auditorFees[i] = auditFeeAuditor;
            auditorFeePaid[i] = true;
        }
        AAssignments.updatePayments(
            auditId,
            auditorFees,
            auditorFeePaid
        );

        // Update the AuditItem Status
        if(resultFinal)
            idToAuditItemData[auditId].auditItemStatus = AuditItemStatus.Passed;
        else
            idToAuditItemData[auditId].auditItemStatus = AuditItemStatus.Failed;
    }
    
    /// @notice Returns only items that are associated to the producer 
    function fetchMyAudits() public view returns (AuditItemData[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        // Iterates the list of Audit Items and counts for the total assigned to the auditor
        for (uint i = 0; i < totalItemCount; i++) {
        if (idToAuditItemData[i + 1].producer == msg.sender) {
            itemCount += 1;
        }
        }
        // Creates a fixed length array to return the AudtiItemData with owner == msg.sender
        AuditItemData[] memory items = new AuditItemData[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
        if (idToAuditItemData[i + 1].producer == msg.sender) {
            uint currentId =  i + 1;
            AuditItemData storage currentItem = idToAuditItemData[currentId];
            items[currentIndex] = currentItem;
            currentIndex += 1;
        }
        }
        return items;
    }

    // 0 = Failed     - Auditor evaluation outcome determined that the audit failed
    // 1 = Passed     - Auditor evaluation outcome determined that the audit was successful
    enum AuditResult {
        Failed,
        Passed
    }

    // Audit results submitted by the Auditor
    event AuditResultCreated(
        uint256 indexed auditItemId, // AuditItem Token Id
        uint256 indexed tokenIdResult, // Audit Result tokenId
        AuditResult auditResult // Failed,Passed
    );

    // Audit services were paid to the Auditor
    event AuditResultPaid(
        uint256 indexed auditId,
        uint256 indexed auditItemId, // AuditItem Token Id 
        uint256 indexed tokenIdResult, // Audit Result tokenId
        uint256 auditorFee // Fee paid to the auditor
    );

}


