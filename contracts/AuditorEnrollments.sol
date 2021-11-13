// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract AuditEnrollments {
  using Counters for Counters.Counter;
  
  /* Struct containing informaction of the entity to be stored 
  * Addresses of enrolled auditors
  * AuditId = TokenId of the AuditItem
  * index = autonumber for the enrollment
  */
  struct AuditEnrollmentData {
    address[] auditors;
    uint auditId;
    uint index;
  }
  
  /* Mapping of struts uint to AuditEnrollmentData where uint is the functional Key = tokenId */ 
  mapping(uint => AuditEnrollmentData) private auditEnrollments;

  // Array of AuditItems -> tokenIds stored with Enrollment Data (auditors assigned). 
  uint[] private auditEnrollmentIndex; //index by tokenId
  Counters.Counter private _indexCounter;

  event LogNewAuditEnrollment   (uint index, uint indexed auditId, address[] auditors);
  event LogUpdateAuditEnrollment(uint index, uint indexed auditId, address[] auditors);
  event LogAddEnrolledAuditor(uint index, uint indexed auditId, address auditor);
/*
* Returns true if the auditId has enrollments
*/
  function isAuditEnrolled(uint auditId)
    public 
    view
    returns(bool) 
  {
    if(auditEnrollmentIndex.length == 0) return false;
    return (auditEnrollmentIndex[auditEnrollments[auditId].index] == auditId);
  }
/*
* Adds the array of auditors enrolled to the audit Id
*/
  function insertAuditEnrollment(uint auditId, address[] memory auditors ) public 
  {
    require(!isAuditEnrolled(auditId), "Audit Id already exists, must update it");
    // Creates the struct on-the-fly associated to the auditId and assigns the array of auditors
    auditEnrollments[auditId].auditors = auditors;
    auditEnrollments[auditId].auditId = auditId;
    auditEnrollmentIndex.push(auditId); // Adds the auditId to the list
    auditEnrollments[auditId].index    = _indexCounter.current(); //set the index being added with the autonumber
    _indexCounter.increment(); // increment the counter since que are adding an item
    
    emit LogNewAuditEnrollment(
        auditEnrollments[auditId].index,        
        auditId, 
        auditors);
  }
  /*
  * Returns and auditor enrollment struct data (list of auditor addresses + index + auditId)
   */
  function getAuditEnrollment(uint auditId)
    public 
    view
    //returns(uint index, address[] memory auditors) 
    returns(AuditEnrollmentData memory)
  {
    require(isAuditEnrolled(auditId), "Audit Id does not exist");
    return auditEnrollments[auditId];
  } 
  /*
  * Updates the whole list of auditors assigned to an auditId
  */
  function updateauditors(uint auditId, address[] memory auditors) 
    public
    returns(bool success) 
  {
    require(isAuditEnrolled(auditId), "Audit Id does not exist");
    auditEnrollments[auditId].auditors = auditors;
    emit LogUpdateAuditEnrollment(
      auditId, 
      auditEnrollments[auditId].index,
      auditors);
    return true;
  }
  
  /*
  * Adds and auditor to the enrolled auditors list
  */
  function addAuditor(uint auditId, address auditor) 
    public
    returns(bool success) 
  {

    if(isAuditEnrolled(auditId))
       auditEnrollments[auditId].auditors.push(auditor);
    else {
        address[] memory auditors = new address[](1);
        auditors[0] = auditor;
        insertAuditEnrollment(auditId, auditors);
    }
    emit LogAddEnrolledAuditor(
      auditId, 
      auditEnrollments[auditId].index,
      auditor);
    return true;
  }
  function getAuditEnrollmentCount() 
    public
    view
    returns(uint count)
  {
    return auditEnrollmentIndex.length;
  }

  function getAuditEnrollmentAtIndex(uint index)
    public
    view
    returns(uint auditId)
  {
    return auditEnrollmentIndex[index];
  }

    function fetchAuditEnrollments() public view returns (AuditEnrollmentData[] memory) {
        uint256 itemCount = _indexCounter.current();
        uint256 currentIndex = 0;
        // Creates a fixedLegth arrat with  the size of pending items count
        AuditEnrollmentData[] memory items = new AuditEnrollmentData[](itemCount);
        // Iterates the array and only add itemas with AuditItemStatus.Pending
        for (uint256 i = 0; i < itemCount; i++) {
                uint256 currentId = i + 1;
                AuditEnrollmentData storage currentItem = auditEnrollments[
                    currentId
                ];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        return items;
    }



}
