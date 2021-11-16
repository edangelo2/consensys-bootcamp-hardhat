const { expect } = require("chai");
const { ethers } = require("hardhat");

/* 
* Test Cases for enrolling auditors functions
*/

describe("AuditEnrollments", function () {
  it("Should deploy AuditEnrollments", async function () {
    /* deploy the AuditorEnrollments */
    const AuditorEnrollments = await ethers.getContractFactory("AuditEnrollments")
    const auditorEnrollments = await AuditorEnrollments.deploy()
    await auditorEnrollments.deployed()
    const auditorEnrollmentsAddr = auditorEnrollments.address

  })
  
  it("Create an auditor Enrollment ", async function () {

    /* deploy the AuditorEnrollments */
    const AuditorEnrollments = await ethers.getContractFactory("AuditEnrollments")
    const auditorEnrollments = await AuditorEnrollments.deploy()
    await auditorEnrollments.deployed()
    const auditorEnrollmentsAddr = auditorEnrollments.address
    payFeeStr = '0'

    const [_, auditor1Addr,auditor2Addr, auditor3Addr, auditor4Addr] = await ethers.getSigners()
    const auditorsEnrolled1 = new Array(auditor1Addr.address, auditor2Addr.address);
    const auditorsEnrolled2 = new Array(auditor2Addr.address, auditor3Addr.address, auditor4Addr.address);

    /* Add Auditors Enrollments  for tokenId 2*/
    await auditorEnrollments.insertAuditEnrollment(2,auditorsEnrolled1,{value:payFeeStr})
    /* Add Auditors Enrollments  for tokenId 4*/
    await auditorEnrollments.insertAuditEnrollment(4,auditorsEnrolled2, {value:payFeeStr})
  })
    it("Return an auditor Enrollment ", async function () {

      /* deploy the AuditorEnrollments */
      const AuditorEnrollments = await ethers.getContractFactory("AuditEnrollments")
      const auditorEnrollments = await AuditorEnrollments.deploy()
      await auditorEnrollments.deployed()
      const auditorEnrollmentsAddr = auditorEnrollments.address
      payFeeStr = '0'
  
      const [_, auditor1Addr,auditor2Addr, auditor3Addr, auditor4Addr] = await ethers.getSigners()
      const auditorsEnrolled1 = new Array(auditor1Addr.address, auditor2Addr.address);
      const auditorsEnrolled2 = new Array(auditor2Addr.address, auditor3Addr.address, auditor4Addr.address);
  
      /* Add Auditors Enrollments  for tokenId 2*/
      await auditorEnrollments.insertAuditEnrollment(2,auditorsEnrolled1,{value:payFeeStr})
      /* Add Auditors Enrollments  for tokenId 4*/
      await auditorEnrollments.insertAuditEnrollment(4,auditorsEnrolled2, {value:payFeeStr})
      
    /* Get Auditors enrolled for tokenId 2 */
    let AuditData1 = await auditorEnrollments.getAuditEnrollment(2)
    console.log(AD2JSON(AuditData1))

    /* Get Auditors enrolled for tokenId 4 */
    let AuditData2 = await auditorEnrollments.getAuditEnrollment(4)
    console.log(AD2JSON(AuditData2))

  })
  it("Updates the list of enrollments ", async function () {

    /* deploy the AuditorEnrollments */
    const AuditorEnrollments = await ethers.getContractFactory("AuditEnrollments")
    const auditorEnrollments = await AuditorEnrollments.deploy()
    await auditorEnrollments.deployed()
    const auditorEnrollmentsAddr = auditorEnrollments.address
    payFeeStr = '0'

    const [_, auditor1Addr,auditor2Addr, auditor3Addr, auditor4Addr] = await ethers.getSigners()
    const auditorsEnrolled1 = new Array(auditor1Addr.address, auditor2Addr.address);
    const auditorsEnrolled2 = new Array(auditor2Addr.address, auditor3Addr.address, auditor4Addr.address);

    /* Add Auditors Enrollments  for tokenId 1*/
    await auditorEnrollments.insertAuditEnrollment(2,auditorsEnrolled1,{value:payFeeStr})
    await auditorEnrollments.insertAuditEnrollment(4,auditorsEnrolled2, {value:payFeeStr})
    
    /* Get Auditors enrolled for tokenId 2 */
    let AuditData1 = await auditorEnrollments.getAuditEnrollment(2)
    console.log(AD2JSON(AuditData1))

    let AuditData2 = await auditorEnrollments.getAuditEnrollment(4)
    console.log(AD2JSON(AuditData2))

    // Updates the tokenId 4 enrollments to be the same of token 2
    await auditorEnrollments.updateauditors(4,auditorsEnrolled1,{value:payFeeStr})
    let AuditData3 = await auditorEnrollments.getAuditEnrollment(4)
    console.log(AD2JSON(AuditData3))

      // Updates the tokenId 2 enrollments to be the same of token 4
    await auditorEnrollments.updateauditors(2,auditorsEnrolled2,{value:payFeeStr})
    let AuditData4 = await auditorEnrollments.getAuditEnrollment(2)
    console.log(AD2JSON(AuditData4))
    })
    
  it("Add an individual auditor to the enrollments of an audit", async function () {

    /* deploy the AuditorEnrollments */
    const AuditorEnrollments = await ethers.getContractFactory("AuditEnrollments")
    const auditorEnrollments = await AuditorEnrollments.deploy()
    await auditorEnrollments.deployed()
    const auditorEnrollmentsAddr = auditorEnrollments.address
    payFeeStr = '0'

    const [_, auditor1Addr,auditor2Addr, auditor3Addr, auditor4Addr] = await ethers.getSigners()
    const auditorsEnrolled1 = new Array(auditor1Addr.address, auditor2Addr.address);
    const auditorsEnrolled2 = new Array(auditor2Addr.address, auditor3Addr.address, auditor4Addr.address);

    /* Add Auditors Enrollments  for tokenId 1*/
    await auditorEnrollments.insertAuditEnrollment(2,auditorsEnrolled1,{value:payFeeStr})
    await auditorEnrollments.insertAuditEnrollment(4,auditorsEnrolled2, {value:payFeeStr})
    
    /* Get Auditors enrolled for tokenId 2 */
    let AuditData1 = await auditorEnrollments.getAuditEnrollment(2)
    console.log(AD2JSON(AuditData1))

    let AuditData2 = await auditorEnrollments.getAuditEnrollment(4)
    console.log(AD2JSON(AuditData2))

    // Adds Auditor 1 to the tokenId 4 enrollments to be the same of token 2
    await auditorEnrollments.addAuditor(4,auditor1Addr.address,{value:payFeeStr})
    let AuditData4 = await auditorEnrollments.getAuditEnrollment(4)
    console.log(AD2JSON(AuditData4))
  })
  it("Add an individual auditor to the enrollments of an audit from scratch", async function () {

    /* deploy the AuditorEnrollments */
    const AuditorEnrollments = await ethers.getContractFactory("AuditEnrollments")
    const auditorEnrollments = await AuditorEnrollments.deploy()
    await auditorEnrollments.deployed()
    const auditorEnrollmentsAddr = auditorEnrollments.address
    payFeeStr = '0'

    const [_, auditor1Addr,auditor2Addr, auditor3Addr, auditor4Addr] = await ethers.getSigners()

    // Adds Auditor 1 to the tokenId 4 enrollments 
    await auditorEnrollments.addAuditor(2,auditor1Addr.address,{value:payFeeStr})
    let AuditData4 = await auditorEnrollments.getAuditEnrollment(2)
    console.log(AD2JSON(AuditData4))
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
