const { expect } = require("chai");
const { ethers } = require("hardhat");

/* 
* Test Cases for assignment of auditors 
*/

describe("AuditAssignments", function () {
  it("Should deploy AuditAssignments", async function () {
    /* deploy the AuditorAssignments */
    const AuditorAssignments = await ethers.getContractFactory("AuditAssignments")
    const auditorAssignments = await AuditorAssignments.deploy()
    await auditorAssignments.deployed()
    const auditorAssignmentsAddr = auditorAssignments.address

  })
  
  it("Create an auditor Assignment ", async function () {

    /* deploy the AuditorAssignments */
    const AuditorAssignments = await ethers.getContractFactory("AuditAssignments")
    const auditorAssignments = await AuditorAssignments.deploy()
    await auditorAssignments.deployed()
    const auditorAssignmentsAddr = auditorAssignments.address
    payFeeStr = '0'

    const [_, auditor1Addr,auditor2Addr, auditor3Addr, auditor4Addr] = await ethers.getSigners()
    const auditorsAssigned1 = new Array(auditor1Addr.address, auditor2Addr.address);
    const auditorsAssigned2 = new Array(auditor2Addr.address, auditor3Addr.address, auditor4Addr.address);

    /* Add Auditors Assignments  for tokenId 2*/
    await auditorAssignments.insertAuditAssignment(2,auditorsAssigned1,{value:payFeeStr})
    /* Add Auditors Assignments  for tokenId 4*/
    await auditorAssignments.insertAuditAssignment(4,auditorsAssigned2, {value:payFeeStr})
  })
    it("Return an auditor Assignment ", async function () {

      /* deploy the AuditorAssignments */
      const AuditorAssignments = await ethers.getContractFactory("AuditAssignments")
      const auditorAssignments = await AuditorAssignments.deploy()
      await auditorAssignments.deployed()
      const auditorAssignmentsAddr = auditorAssignments.address
      payFeeStr = '0'
  
      const [_, auditor1Addr,auditor2Addr, auditor3Addr, auditor4Addr] = await ethers.getSigners()
      const auditorsAssigned1 = new Array(auditor1Addr.address, auditor2Addr.address);
      const auditorsAssigned2 = new Array(auditor2Addr.address, auditor3Addr.address, auditor4Addr.address);
  
      /* Add Auditors Assignments  for tokenId 2*/
      await auditorAssignments.insertAuditAssignment(2,auditorsAssigned1,{value:payFeeStr})
      /* Add Auditors Assignments  for tokenId 4*/
      await auditorAssignments.insertAuditAssignment(4,auditorsAssigned2, {value:payFeeStr})
      
    /* Get Auditors assigned for tokenId 2 */
    let AuditData1 = await auditorAssignments.getAuditAssignment(2)
    console.log(AD2JSON(AuditData1))

    /* Get Auditors assigned for tokenId 4 */
    let AuditData2 = await auditorAssignments.getAuditAssignment(4)
    console.log(AD2JSON(AuditData2))

  })
    

})

// Transform Audit Data to JSON object 
function AD2JSON (AuditData1) {
  return  {
    index: AuditData1.index.toString(),
    auditId: AuditData1.auditId.toString(),
    auditors: AuditData1.auditors
  }
}