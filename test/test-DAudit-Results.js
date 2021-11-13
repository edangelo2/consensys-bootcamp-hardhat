const { Wallet } = require("@ethersproject/wallet");
const {
  expect
} = require("chai");
const {
  ethers
} = require("hardhat");

function AD2JSON(AuditData1) {
  return {
    index: AuditData1.index.toString(),
    auditId: AuditData1.auditId.toString(),
    auditors: AuditData1.auditors
  }
}

describe("DAudit Results", function () {

  it("Create two Audit Items Results", async function () {

    /* deploy the Audit */
    AuditEnrollments = await hre.ethers.getContractFactory("AuditEnrollments");
    auditEnrollments = await AuditEnrollments.deploy();
    await auditEnrollments.deployed();
    console.log("AuditEnrollments deployed to:", auditEnrollments.address);

    AuditAssignments = await hre.ethers.getContractFactory("AuditAssignments");
    auditAssignments = await AuditAssignments.deploy();
    await auditAssignments.deployed();
    console.log("AuditAssignments deployed to:", auditAssignments.address);

    DAudit = await hre.ethers.getContractFactory("DAudit");
    dAudit = await DAudit.deploy(auditEnrollments.address, auditAssignments.address);
    await dAudit.deployed();
    console.log("DAudit deployed to:", dAudit.address);

    /* deploy the AuditItem contract */
    AuditItem = await hre.ethers.getContractFactory("AuditItem")
    auditItem = await AuditItem.deploy(dAudit.address)
    await auditItem.deployed()
    auditItemContractAddress = auditItem.address

    AuditResult = await hre.ethers.getContractFactory("AuditResult")
    auditResult = await AuditResult.deploy(dAudit.address)
    await auditResult.deployed()
    auditResultAddress = auditResult.address
    console.log("AuditResult deployed to:", auditResult.address)

    // PayFee is a combination of the listigFee + the  audit Fee
    // should we write this code client-side, i don't think so (review)
    let listingFee = await dAudit.getListingFee();
    let auditFee = ethers.utils.parseEther('0.10');
    let payFee = listingFee.add(auditFee);
    let payFeeStr = payFee.toString();
    let payFeeStrFin = payFee.toString();

    /* create two Audit Items */
    t1Id = await auditItem.createToken("https://www.mytokenlocation.com")
    t2Id = await auditItem.createToken("https://www.mytokenlocation2.com")

    // Wait for the transaction receipt
    const t1IdReceipt = await t1Id.wait(); // wait for mining
    const t2IdReceipt = await t2Id.wait(); // wait for mining

    // The create token function emits a Transfer Event returned in the rec
    idToken1 = t1IdReceipt.events[0].args.tokenId.toNumber();
    idToken2 = t2IdReceipt.events[0].args.tokenId.toNumber();

    /* Add two Audit Items */
    tx1 = await dAudit.createAuditItem(auditItemContractAddress, idToken1, auditFee, 2, {
      value: payFeeStr
    })
    tx1Receipt = await tx1.wait(); // wait for mining
    tx2 = await dAudit.createAuditItem(auditItemContractAddress, idToken2, auditFee, 3, {
      value: payFeeStr
    })
    tx2Receipt = await tx2.wait(); // wait for mining

    // Enroll Auditors
    payFeeStr = '0'

    const [SmartContractSigner, auditor1Addr, auditor2Addr, auditor3Addr, auditor4Addr, auditor5Addr] = await ethers.getSigners()
    const auditorsEnrolled1 = new Array(auditor1Addr.address, auditor2Addr.address);
    const auditorsEnrolled2 = new Array(auditor2Addr.address, auditor3Addr.address, auditor4Addr.address, auditor5Addr.address);

    /* Add Auditors Enrollments  for idToken1*/
    const tx3 = await auditEnrollments.insertAuditEnrollment(idToken1, auditorsEnrolled1, {
      value: payFeeStr
    })
    const tx3Receipt = await tx3.wait(); // wait for mining
    /* Add Auditors Enrollments  for idToken2*/
    const tx4 = await auditEnrollments.insertAuditEnrollment(idToken2, auditorsEnrolled2, {
      value: payFeeStr
    })
    const tx4Receipt = await tx4.wait(); // wait for mining

    /* Get Auditors enrolled for tokenId 1 */
    console.log('/* Get Auditors enrolled for tokenId 1 */')
    let AuditData1 = await auditEnrollments.getAuditEnrollment(idToken1)
    console.log(AD2JSON(AuditData1))

    /* Get Auditors enrolled for tokenId 2 */
    let AuditData2 = await auditEnrollments.getAuditEnrollment(idToken2)
    console.log(AD2JSON(AuditData2))

    const tx5 = await dAudit.assignAuditors(idToken1, {
      value: 0
    })
    const tx5Receipt = await tx5.wait(); // wait for mining

    const tx6 = await dAudit.assignAuditors(idToken2, {
      value: 0
    })
    const tx6Receipt = await tx6.wait(); // wait for mining

    /* Get Auditors assigned for tokenId 1 */

    console.log('/* Get Auditors assigned for tokenId 1 */')
    let AuditData1Assigned = await auditAssignments.getAuditAssignment(idToken1)
    console.log(AD2JSON(AuditData1Assigned))
    auditorAssigned1 = AuditData1Assigned.auditors[0]

    /* Get Auditors assigned for tokenId 2 */

    console.log('/* Get Auditors assigned for tokenId 2 */')
    let AuditData2Assigned = await auditAssignments.getAuditAssignment(idToken2)
    console.log(AD2JSON(AuditData2Assigned))
    auditorAssigned2 = AuditData2Assigned.auditors[0]

    const signer1 = await hre.ethers.getSigner(auditorAssigned1);
    const signer2 = await hre.ethers.getSigner(auditorAssigned2);

    /* create two Audit Results */
    tx8 = await auditResult.connect(signer1).createToken("https://www.mytokenlocation.com")
    tx9 = await auditResult.connect(signer2).createToken("https://www.mytokenlocation2.com")
    const tx8R = await tx8.wait();
    const tx9R = await tx9.wait();

    // The create token function emits a Transfer Event returned in the rec
    idTokenResult1 = tx8R.events[0].args.tokenId.toNumber();
    idTokenResult2 = tx9R.events[0].args.tokenId.toNumber();

    /* Submit audit results */
    
    const tx10 = await dAudit.connect(signer1).createAuditResult(auditResultAddress, idToken1, idTokenResult1, 0, {
      value: payFeeStr
    })
    const tx10R = await tx3.wait();
    const tx11 = await dAudit.connect(signer2).createAuditResult(auditResultAddress, idToken2, idTokenResult2, 0, {
      value: payFeeStr
    })
    const tx11R = await tx11.wait();
    

    txPay = await dAudit.connect(SmartContractSigner).payAuditors(idToken1 , {
      value: payFeeStrFin
    });
    const txPayR = await txPay.wait();

  })
})