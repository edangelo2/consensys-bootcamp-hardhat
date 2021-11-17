// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

/// @title Auditor Assignments for Decentralized Audits Smart Contracts
/// @author Enrique R. D'Angelo
/// @notice Once Auditors are enrolled then DAudit assigns them for performing the audits.
/// The AuditAssignments Smart Contract encapsulates the logic for persisting the assignments and the assignments results.  
/// @dev The Smart Contract uses a mapping of Audit Items (tokenId) to AuditAssignmentData Struct with audit results stored y arrays.
/// Each element of the arrays are assignments storing the auditors (identified by their wallet addresses), audit results 
/// and payment statuses

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract AuditAssignments {
  using Counters for Counters.Counter;

  /* Struct containing information of the entity to be stored 
  * index = autonumber for the assignment (primary key)
  * auditId = TokenId of the AuditItem
  * auditors = Array containing the addresses of assigned auditors 
  * auditResultIds = Array containing the Audit Result token Ids of the results submitted by each auditor 
  * auditorFees = Array with amounts of fees paid to the auditors (in eth)
  * auditorFeePaid = Array of boolean values indicating whether the auditor was paid or not.
  * auditorResults = Array of boolean values indicating if the auditor indicated the audit results to Passed (true) or Failed (false)
  *                   true  = Failed      - Auditor evaluation outcome determined that the audit failed
  *                   false = Passed      - Auditor evaluation outcome determined that the audit was successful
  */
  struct AuditAssignmentData {
    uint256 index;
    uint256 auditId;
    address[] auditors;
    uint256[] auditResultIds;   
    uint256[] auditorFees;
    bool[] auditorFeePaid;
    bool[] auditorResults;
  }
  
  /* Mapping of uint to AuditAssignmentData where uint is the functional Key = tokenId = auditId */ 
  mapping(uint => AuditAssignmentData) private auditAssignments;

  // Array of AuditItems -> tokenIds stored with Assignment Data (auditors assigned). 
  uint[] private auditAssignmentIndex; //index by tokenId
  Counters.Counter private _indexCounter;

  event LogNewAuditAssignment   (uint index, uint indexed auditId, address[] auditors);
  event LogUpdateAuditAssignment(uint index, uint indexed auditId, address[] auditors);
  event LogAddAssignedAuditor(uint index, uint indexed auditId, address auditor);
  event LogUpdateAuditResult(uint index, uint indexed auditId, uint auditResultId);
  event LogUpdatePayments(uint index, uint indexed auditId, uint[] auditFee);

  /// @notice Finds if the system has assignments registered for the audit
  /// @dev Used to check as required for certain functios assuming there is and audit struct already in place
  /// @param auditId functional key of the audit Item tokenId = auditId
  /// @return true if the audit has assignments, otherwise returns false
  function isAuditAssigned(uint auditId)
    public 
    view
    returns(bool) 
  {
    if(auditAssignmentIndex.length == 0) return false;
    return (auditAssignmentIndex[auditAssignments[auditId].index] == auditId);
  }

  /// @notice Adds a set of auditors to a given audit item
  /// @dev The (DAudit) uses this method to assign the result of the assignment processes
  /// @param auditId functional key of the audit Item tokenId = auditId
  /// @param _auditors array of auditors to be assigned to the audit item
  function insertAuditAssignment(uint auditId, address[] memory _auditors ) public 
  {
    // Requires that the audit has not been assigned before, once assigned must use update methods to change the state.
    require(!isAuditAssigned(auditId), "Audit Id already exists, must update it");

    // Creates the struct on-the-fly associated to the auditId and assigns the array of auditors
    uint size = _auditors.length;
    bool[] memory auditorResults = new bool[](size);
    uint[] memory auditResultIds = new uint[](size);
    uint[] memory auditorFees = new uint[](size);
    bool[] memory auditorFeePaid = new bool[](size);

    auditAssignments[auditId].auditors = _auditors;
    auditAssignments[auditId].auditorResults = auditorResults;
    auditAssignments[auditId].auditResultIds = auditResultIds;
    auditAssignments[auditId].auditorFees = auditorFees;
    auditAssignments[auditId].auditorFeePaid = auditorFeePaid;
    auditAssignments[auditId].auditId = auditId;

    // Adds the auditId to the list
    auditAssignmentIndex.push(auditId); 

    //set the index being added with the autonumber
    auditAssignments[auditId].index    = _indexCounter.current(); 
    
    // increment the counter since que are adding an item
    _indexCounter.increment(); 
    
    // Emits the event indicating tha a new assignment of auditors was created nby the system
    emit LogNewAuditAssignment(
        auditAssignments[auditId].index,        
        auditId, 
        _auditors);
  }
  
  /// @notice Returns and auditor assignments information from a given audit item. 
  /// @dev raises an exception if the audit is not assigned
  /// @param auditId functional key of the audit Item tokenId = auditId
  /// @return AuditAssignmentData - Struct with the Audit Assignment Information 
  function getAuditAssignment(uint auditId)
    public 
    view
    //returns(uint index, address[] memory auditors) 
    returns(AuditAssignmentData memory)
  {
    console.log(auditId) ;
    //require(isAuditAssigned(auditId), "Audit Id does not exist");
    return auditAssignments[auditId];
  } 

  /// @notice Returns true if the auditor (address) is assigned to a given audit Item. 
  /// @param auditId functional key of the audit Item tokenId = auditId to be checked for assignemnt
  /// @param auditor address of the auditor to check the assignemnt 
  /// @return true if the auditor is assigned to the audit item, false if no assigned to the audit item. 
  function isAuditorAssigned(uint auditId, address auditor) 
    public
    view
    returns(bool) 
  {
    AuditAssignmentData memory aData = getAuditAssignment(auditId);
    address[] memory auditors = aData.auditors;
    for (uint256 i = 0; i < auditors.length; i++) {
     if (auditors[i] == auditor) return true; // found the auditor in the assignment array
    }
    return false;/// loop without success then false
  }

  /// @notice Saves the audit results submitted by the auditor and associate the information to the audit item assignment. 
  /// @param auditId functional key of the AuditItem tokenId = auditId to be checked for assignemnt
  /// @param auditResultId functional key of the AuditResult with the results evidence submitted by the auditor (AuditResult tokenId)  
  /// @param auditor address of the auditor submitting the results 
  /// @param auditorResult boolean value indicating if the auditor indicated the audit results to Passed (true) or Failed (false)
  /// @return success = true if the auditor is assigned to the audit item, false if no assigned to the audit item.
  function updateAuditResult(uint auditId, uint auditResultId, address  auditor, bool auditorResult) 
    public
    returns(bool success) 
  {
    require(isAuditAssigned(auditId), "Audit Id does not exist");
    AuditAssignmentData storage aData = auditAssignments[auditId];
    address[] memory auditors = aData.auditors;
    for (uint256 i = 0; i < auditors.length; i++) {
     if (auditors[i] == auditor) {
    // found the auditor in the assignment array, update the results data
      auditAssignments[auditId].auditResultIds[i] = auditResultId; // audit Result Token
      auditAssignments[auditId].auditorResults[i] = auditorResult; // Audit Outcome Success or Fail
      emit LogUpdateAuditResult(
      auditAssignments[auditId].index,
      auditId, 
      auditResultId);
      return true; 
     }
    }
    // loop without success then false
    return false; 
  }

  /// @notice Updates the payments done to an Audit Item.
  /// @dev arrays must be in the same order of the addresses submitted when the audit was assigned 
  /// @param auditId functional key of the AuditItem tokenId = auditId to update the payments information
  /// @param auditorFees  - array with the fee paid to each auditor 
  /// @param auditorFeePaid - array with boolean values indicating the fee was paid to the auditor or not. 

  function updatePayments(uint auditId, uint256[] memory auditorFees, bool[] memory auditorFeePaid) 
    public
  {
    require(isAuditAssigned(auditId), "Audit Id does not exist");
    auditAssignments[auditId].auditorFees = auditorFees;
    auditAssignments[auditId].auditorFeePaid = auditorFeePaid;

    emit LogUpdatePayments(
      auditId, 
      auditAssignments[auditId].index,
      auditorFees);
  }

  /// @notice Retrieves the Audit Assignments.
  /// @return Array of AuditAssignmentData - Struct with the Audit Assignment Information 
  function fetchAuditAssignments() public view returns (AuditAssignmentData[] memory) {
    uint256 itemCount = _indexCounter.current();
    uint256 currentIndex = 0;
    // Creates a fixedLegth arrat with  the size of pending items count
    AuditAssignmentData[] memory items = new AuditAssignmentData[](itemCount);
    // Iterates the array and only add itemas with AuditItemStatus.Pending
    for (uint256 i = 0; i < itemCount; i++) {
            uint256 currentId = i + 1;
            AuditAssignmentData storage currentItem = auditAssignments[
                currentId
            ];
            items[currentIndex] = currentItem;
            currentIndex += 1;
        }
    return items;
    }

  /// @notice Get the number of itemsm stored in the assignments array
  /// @return count array lenght 
  function getAuditAssignmentCount() 
    public
    view
    returns(uint count)
  {
    return auditAssignmentIndex.length;
  }

  /// @notice Returns the AuditId assigned at a given primary key index
  /// @return auditId of the Audit Item 
  function getAuditAssignmentAtIndex(uint index)
    public
    view
    returns(uint auditId)
  {
    require(isAuditAssigned(auditId), "Audit Id does not exist");

    return auditAssignmentIndex[index];
  }
}