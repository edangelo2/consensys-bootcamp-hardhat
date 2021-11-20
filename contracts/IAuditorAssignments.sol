// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity 0.8.3;

/// @title Auditor Assignments Interface
/// @author Enrique R. D'Angelo
interface IAuditAssignments {

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
  /// @notice Finds if the system has assignments registered for the audit
  /// @dev Used to check as required for certain functios assuming there is and audit struct already in place
  /// @param auditId functional key of the audit Item tokenId = auditId
  /// @return true if the audit has assignments, otherwise returns false
    function isAuditAssigned(uint256 auditId) external view returns (bool);

  /// @notice Adds a set of auditors to a given audit item
  /// @dev The (DAudit) uses this method to assign the result of the assignment processes
  /// @param auditId functional key of the audit Item tokenId = auditId
  /// @param _auditors array of auditors to be assigned to the audit item
  function insertAuditAssignment(uint auditId, address[] memory _auditors )
        external;

  /// @notice Returns and auditor assignments information from a given audit item. 
  /// @dev raises an exception if the audit is not assigned
  /// @param auditId functional key of the audit Item tokenId = auditId
  /// @return AuditAssignmentData - Struct with the Audit Assignment Information 
  function getAuditAssignment(uint256 auditId)
    external
    view
    returns (AuditAssignmentData memory);

  /// @notice Returns true if the auditor (address) is assigned to a given audit Item. 
  /// @param auditId functional key of the audit Item tokenId = auditId to be checked for assignemnt
  /// @param auditor address of the auditor to check the assignemnt 
  /// @return true if the auditor is assigned to the audit item, false if no assigned to the audit item. 
  function isAuditorAssigned(uint256 auditId, address auditor)
    external
    view
    returns (bool);

  /// @notice Saves the audit results submitted by the auditor and associate the information to the audit item assignment. 
  /// @param auditId functional key of the AuditItem tokenId = auditId to be checked for assignemnt
  /// @param auditResultId functional key of the AuditResult with the results evidence submitted by the auditor (AuditResult tokenId)  
  /// @param auditor address of the auditor submitting the results 
  /// @param auditorResult boolean value indicating if the auditor indicated the audit results to Passed (true) or Failed (false)
  /// @return success = true if the auditor is assigned to the audit item, false if no assigned to the audit item.
  function updateAuditResult(
    uint256 auditId,
    uint256 auditResultId,
    address auditor,
    bool auditorResult
    ) external returns (bool success);

  /// @notice Updates the payments done to an Audit Item.
  /// @dev arrays must be in the same order of the addresses submitted when the audit was assigned 
  /// @param auditId functional key of the AuditItem tokenId = auditId to update the payments information
  /// @param auditorFees  - array with the fee paid to each auditor 
  /// @param auditorFeePaid - array with boolean values indicating the fee was paid to the auditor or not. 
  function updatePayments(
        uint256 auditId,
        uint256[] memory auditorFees,
        bool[] memory auditorFeePaid
  ) external;

}
