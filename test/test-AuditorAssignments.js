const { expect } = require("chai");
const { ethers } = require("hardhat");

function AD2JSON (AuditData1) {
  return  {
    index: AuditData1.index.toString(),
    auditId: AuditData1.auditId.toString(),
    auditors: AuditData1.auditors
  }
}

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
  it("Updates the list of enrollments ", async function () {

    /* deploy the AuditorAssignments */
    const AuditorAssignments = await ethers.getContractFactory("AuditAssignments")
    const auditorAssignments = await AuditorAssignments.deploy()
    await auditorAssignments.deployed()
    const auditorAssignmentsAddr = auditorAssignments.address
    payFeeStr = '0'

    const [_, auditor1Addr,auditor2Addr, auditor3Addr, auditor4Addr] = await ethers.getSigners()
    const auditorsAssigned1 = new Array(auditor1Addr.address, auditor2Addr.address);
    const auditorsAssigned2 = new Array(auditor2Addr.address, auditor3Addr.address, auditor4Addr.address);

    /* Add Auditors Assignments  for tokenId 1*/
    await auditorAssignments.insertAuditAssignment(2,auditorsAssigned1,{value:payFeeStr})
    await auditorAssignments.insertAuditAssignment(4,auditorsAssigned2, {value:payFeeStr})
    
    /* Get Auditors assigned for tokenId 2 */
    let AuditData1 = await auditorAssignments.getAuditAssignment(2)
    console.log(AD2JSON(AuditData1))

    let AuditData2 = await auditorAssignments.getAuditAssignment(4)
    console.log(AD2JSON(AuditData2))

    // Updates the tokenId 4 enrollments to be the same of token 2
    await auditorAssignments.updateauditors(4,auditorsAssigned1,{value:payFeeStr})
    let AuditData3 = await auditorAssignments.getAuditAssignment(4)
    console.log(AD2JSON(AuditData3))

      // Updates the tokenId 2 enrollments to be the same of token 4
    await auditorAssignments.updateauditors(2,auditorsAssigned2,{value:payFeeStr})
    let AuditData4 = await auditorAssignments.getAuditAssignment(2)
    console.log(AD2JSON(AuditData4))
    })
    
  it("Add am individual auditor to the enrollments of an audit", async function () {

    /* deploy the AuditorAssignments */
    const AuditorAssignments = await ethers.getContractFactory("AuditAssignments")
    const auditorAssignments = await AuditorAssignments.deploy()
    await auditorAssignments.deployed()
    const auditorAssignmentsAddr = auditorAssignments.address
    payFeeStr = '0'

    const [_, auditor1Addr,auditor2Addr, auditor3Addr, auditor4Addr] = await ethers.getSigners()
    const auditorsAssigned1 = new Array(auditor1Addr.address, auditor2Addr.address);
    const auditorsAssigned2 = new Array(auditor2Addr.address, auditor3Addr.address, auditor4Addr.address);

    /* Add Auditors Assignments  for tokenId 1*/
    await auditorAssignments.insertAuditAssignment(2,auditorsAssigned1,{value:payFeeStr})
    await auditorAssignments.insertAuditAssignment(4,auditorsAssigned2, {value:payFeeStr})
    
    /* Get Auditors assigned for tokenId 2 */
    let AuditData1 = await auditorAssignments.getAuditAssignment(2)
    console.log(AD2JSON(AuditData1))

    let AuditData2 = await auditorAssignments.getAuditAssignment(4)
    console.log(AD2JSON(AuditData2))

    // Adds Auditor 1 to the tokenId 4 enrollments to be the same of token 2
    await auditorAssignments.addAuditor(4,auditor1Addr.address,{value:payFeeStr})
    let AuditData4 = await auditorAssignments.getAuditAssignment(4)
    console.log(AD2JSON(AuditData4))
  })
})