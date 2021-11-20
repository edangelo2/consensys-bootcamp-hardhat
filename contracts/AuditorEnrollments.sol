// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity 0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

/// @title Auditor Enrollments for Decentralized Audits Smart Contracts
/// @author Enrique R. D'Angelo
/// @notice Auditors are enrolled for participating in audits submitted by producers. DAudit assigns them randomly for performing the audits.
/// The AuditEnrollments Smart Contract encapsulates the logic for persisting the enrollments of auditors to the audit items.  
/// @dev The Smart Contract uses a mapping of Audit Items (tokenId) to AuditEnrollemntData Struct with the auditId and 
/// an array of auditors enrolled to the audit item. The array stores the auditors enrolled identified by their wallet addresses

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

  /// @notice Finds if the system has enrollments registered for the audit item
  /// @dev Used to check as required for certain functions assuming there is and enrollment struct already in place
  /// @param auditId functional key of the audit Item tokenId = auditId
  /// @return true if the audit has enrollments, otherwise returns false
  function isAuditEnrolled(uint auditId)
    public 
    view
    returns(bool) 
  {
    if(auditEnrollmentIndex.length == 0) return false;
    return (auditEnrollmentIndex[auditEnrollments[auditId].index] == auditId);
  }

  /// @notice Adds a set of auditors enrolled to a given audit item
  /// @param auditId functional key of the audit Item tokenId = auditId
  /// @param auditors array of auditors enrolled to the audit item
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


 /// @notice Returns and auditor enrollment struct data for a give auditId
 /// @param auditId functional key of the audit Item tokenId = auditId
  function getAuditEnrollment(uint auditId)
    public 
    view
    //returns(uint index, address[] memory auditors) 
    returns(AuditEnrollmentData memory)
  {
    require(isAuditEnrolled(auditId), "Audit Id does not exist");
    return auditEnrollments[auditId];
  } 
  
  /// @notice Updates the whole list of auditors enrolled to an auditId
  /// @param auditId functional key of the audit Item tokenId = auditId
  /// @return success true the systme was able to update the audit enrollments, otherwise returns false
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
  
  /// @notice Adds an auditor to the enrolled auditors list
  /// @param auditId functional key of the audit Item tokenId = auditId
  /// @param auditor address of the auditor being added to the audit enrollments  
  /// @return success true the systme was able to add the auditor to the audit enrollments, otherwise returns false
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

  /// @notice Retrieves the Audit Enrollments.
  /// @return Array of AuditEnrollmentData - Struct with the Audit Enrollment Information 
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

  /// @notice Get the number of items stored in the enrollments array
  /// @return count array lenght 
  function getAuditEnrollmentCount() 
    public
    view
    returns(uint count)
  {
    return auditEnrollmentIndex.length;
  }

  /// @notice Returns the AuditId enrolled at a given primary key index
  /// @return auditId of the Audit Item 
  function getAuditEnrollmentAtIndex(uint index)
    public
    view
    returns(uint auditId)
  {
    return auditEnrollmentIndex[index];
  }

}
