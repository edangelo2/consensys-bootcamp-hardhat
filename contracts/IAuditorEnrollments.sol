// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity 0.8.3;

/// @title Auditor Enrollments Interface
/// @author Enrique R. D'Angelo
interface IAuditEnrollments {
  
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
  /// @notice Finds if the system has enrollments registered for the audit item
  /// @dev Used to check as required for certain functions assuming there is and enrollment struct already in place
  /// @param auditId functional key of the audit Item tokenId = auditId
  /// @return true if the audit has enrollments, otherwise returns false 
  function isAuditEnrolled(uint auditId) external view returns(bool) ;
  
  /// @notice Adds a set of auditors enrolled to a given audit item
  /// @param auditId functional key of the audit Item tokenId = auditId
  /// @param auditors array of auditors enrolled to the audit item
  function insertAuditEnrollment(uint auditId, address[] memory auditors ) external ;
  
  /// @notice Returns and auditor enrollment struct data for a give auditId
  /// @param auditId functional key of the audit Item tokenId = auditId
  function getAuditEnrollment(uint auditId) external view returns (AuditEnrollmentData memory);
  
  /// @notice Updates the whole list of auditors enrolled to an auditId
  /// @param auditId functional key of the audit Item tokenId = auditId
  /// @return success true the systme was able to update the audit enrollments, otherwise returns false
  function updateauditors(uint auditId, address[] memory auditors) external returns(bool success);

  /// @notice Adds an auditor to the enrolled auditors list
  /// @param auditId functional key of the audit Item tokenId = auditId
  /// @param auditor address of the auditor being added to the audit enrollments  
  /// @return success true the systme was able to add the auditor to the audit enrollments, otherwise returns false
  function addAuditor(uint auditId, address auditor) external returns(bool success) ;
   
}
