// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

interface IAuditEnrollments {
  
  struct AuditEnrollmentData {
    address[] auditors;
    uint auditId;
    uint index;
  }
  
  function isAuditEnrolled(uint auditId) external view returns(bool) ;
  /*
  * Adds the array of auditors enrolled to the audit Id
  */
  function insertAuditEnrollment(uint auditId, address[] memory auditors ) external ;
  
  /*
  * Returns and auditor enrollment struct data (list of auditor addresses + index + auditId)
   */
  function getAuditEnrollment(uint auditId) external view returns (AuditEnrollmentData memory);
  /*
  * Updates the whole list of auditors assigned to an auditId
  */
  function updateauditors(uint auditId, address[] memory auditors) external returns(bool success);
   /*
  * Adds and auditor to the enrolled auditors list
  */
  function addAuditor(uint auditId, address auditor) external returns(bool success) ;
  
  function getAuditEnrollmentCount() external view returns(uint count);
  
  function getAuditEnrollmentAtIndex(uint index) external view returns(uint auditId);
  
}
