// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract AuditAssignments {
  using Counters for Counters.Counter;
  
  /* Struct containing informaction of the entity to be stored 
  * Addresses of assigned auditors
  * AuditId = TokenId of the AuditItem
  * index = autonumber for the assignment
  */
  struct AuditAssignmentData {
    address[] auditors;
    uint256[] auditResultIds;   
    uint256[] auditorFees;
    bool[] auditorFeePaid;
    bool[] auditorResults;
    uint8[] auditorResultStatus;
    uint256 auditId;
    uint256 index;
  }
  
  /* Mapping of struts uint to AuditAssignmentData where uint is the functional Key = tokenId = auditId */ 
  mapping(uint => AuditAssignmentData) private auditAssignments;

  // Array of AuditItems -> tokenIds stored with Assignment Data (auditors assigned). 
  uint[] private auditAssignmentIndex; //index by tokenId
  Counters.Counter private _indexCounter;

  event LogNewAuditAssignment   (uint index, uint indexed auditId, address[] auditors);
  event LogUpdateAuditAssignment(uint index, uint indexed auditId, address[] auditors);
  event LogAddAssignedAuditor(uint index, uint indexed auditId, address auditor);
  event LogUpdateAuditResult(uint index, uint indexed auditId, uint auditResultId);
  event LogUpdatePayments(uint index, uint indexed auditId, uint[] auditFee);

/*
* Returns true if the auditId has assignments
*/
  function isAuditAssigned(uint auditId)
    public 
    view
    returns(bool) 
  {
    if(auditAssignmentIndex.length == 0) return false;
    return (auditAssignmentIndex[auditAssignments[auditId].index] == auditId);
  }
/*
* Adds the array of auditors assigned to the audit Id
*/
  function insertAuditAssignment(uint auditId, address[] memory _auditors ) public 
  {
    require(!isAuditAssigned(auditId), "Audit Id already exists, must update it");
    // Creates the struct on-the-fly associated to the auditId and assigns the array of auditors
    uint size = _auditors.length;
    
    bool[] memory auditorResults = new bool[](size);
    uint[] memory auditResultIds = new uint[](size);
    uint[] memory auditorFees = new uint[](size);
    bool[] memory auditorFeePaid = new bool[](size);
    uint8[] memory auditResultStatuses = new uint8[](size);
    

    auditAssignments[auditId].auditors = _auditors;
    auditAssignments[auditId].auditorResults = auditorResults;
    auditAssignments[auditId].auditResultIds = auditResultIds;
    auditAssignments[auditId].auditorFees = auditorFees;
    auditAssignments[auditId].auditorFeePaid = auditorFeePaid;
    auditAssignments[auditId].auditorResultStatus = auditResultStatuses;
    auditAssignments[auditId].auditId = auditId;
    auditAssignmentIndex.push(auditId); // Adds the auditId to the list
    auditAssignments[auditId].index    = _indexCounter.current(); //set the index being added with the autonumber
    
    _indexCounter.increment(); // increment the counter since que are adding an item
    
    emit LogNewAuditAssignment(
        auditAssignments[auditId].index,        
        auditId, 
        _auditors);
  }
  /*
  * Returns and auditor assignment struct data (list of auditor addresses + index + auditId)
   */
  function getAuditAssignment(uint auditId)
    public 
    view
    //returns(uint index, address[] memory auditors) 
    returns(AuditAssignmentData memory)
  {
    require(isAuditAssigned(auditId), "Audit Id does not exist");
    return auditAssignments[auditId];
  } 
  /*
  * Updates the whole list of auditors assigned to an auditId
  */
  function updateauditors(uint auditId, address[] memory auditors) 
    public
    returns(bool success) 
  {
    require(isAuditAssigned(auditId), "Audit Id does not exist");
    auditAssignments[auditId].auditors = auditors;
    emit LogUpdateAuditAssignment(
      auditId, 
      auditAssignments[auditId].index,
      auditors);
    return true;
  }
  
  /*
  * Adds and auditor to the assigned auditors list
  */
  function addAuditor(uint auditId, address auditor) 
    public
    returns(bool success) 
  {
    require(isAuditAssigned(auditId), "Audit Id does not exist");
    auditAssignments[auditId].auditors.push(auditor);
    emit LogAddAssignedAuditor(
      auditId, 
      auditAssignments[auditId].index,
      auditor);
    return true;
  }

  function getAuditAssignmentCount() 
    public
    view
    returns(uint count)
  {
    return auditAssignmentIndex.length;
  }

  function getAuditAssignmentAtIndex(uint index)
    public
    view
    returns(uint auditId)
  {
    require(isAuditAssigned(auditId), "Audit Id does not exist");

    return auditAssignmentIndex[index];
  }

  /* Returns true if the auditor (address) is assigned to a given audit Item*/
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
  /*
  * Updates the outcome of the audit results
  */
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
    return false;/// loop without success then false
  }

  /*
  * Updates the whole list of auditors assigned to an auditId
  */
  function updatePayments(uint auditId, uint256[] memory auditorFees, bool[] memory auditorFeePaid,uint8[] memory auditorResultStatus) 
    public
    returns(bool success) 
  {
    require(isAuditAssigned(auditId), "Audit Id does not exist");
    auditAssignments[auditId].auditorFees = auditorFees;
    auditAssignments[auditId].auditorFeePaid = auditorFeePaid;
    auditAssignments[auditId].auditorResultStatus = auditorResultStatus;

    emit LogUpdatePayments(
      auditId, 
      auditAssignments[auditId].index,
      auditorFees);
    return true;
  }
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

}
