// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

interface IAuditAssignments {
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

    function isAuditAssigned(uint256 auditId) external view returns (bool);

    function insertAuditAssignment(uint256 auditId, address[] memory auditors)
        external;

    /*
     * Returns and auditor assignment struct data (list of auditor addresses + index + auditId)
     */
    function getAuditAssignment(uint256 auditId)
        external
        view
        returns (AuditAssignmentData memory);

    function updateauditors(uint256 auditId, address[] memory auditors)
        external
        returns (bool success);

    function addAuditor(uint256 auditId, address auditor)
        external
        returns (bool success);

    function getAuditAssignmentCount() external view returns (uint256 count);

    function getAuditAssignmentAtIndex(uint256 index)
        external
        view
        returns (uint256 auditId);

    function isAuditorAssigned(uint256 auditId, address auditor)
        external
        view
        returns (bool);

    function updateAuditResult(
        uint256 auditId,
        uint256 auditResultId,
        address auditor,
        bool auditorResult
    ) external returns (bool success);

    function updatePayments(
        uint256 auditId,
        uint256[] memory auditorFees,
        bool[] memory auditorFeePaid,
        uint8[] memory auditorResultStatus
    ) external returns (bool success);
}
