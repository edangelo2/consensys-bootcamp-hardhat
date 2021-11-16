const { expect } = require("chai");
const { ethers } = require("hardhat");
/* 
* Main test cases of Descentralized Audits
* Deployment, Creatio of Audit Items, Errolling Auditors, Assigning Auditors
*/
describe("DAudit", function () {
  
  it("Should deploy Smart Contracts", async function () {
    /* Deploy the AuditEnrollmets */
    const AuditEnrollments = await hre.ethers.getContractFactory("AuditEnrollments");
    const auditEnrollments = await AuditEnrollments.deploy();
    await auditEnrollments.deployed();
    console.log("AuditEnrollments deployed to:", auditEnrollments.address);
    
    /* Deploy the AuditAssignments */
    const AuditAssignments = await hre.ethers.getContractFactory("AuditAssignments");
    const auditAssignments = await AuditAssignments.deploy();
    await auditAssignments.deployed();
    console.log("AuditAssignments deployed to:", auditAssignments.address);
  
    /* Deploy the DAudit */
    const DAudit = await hre.ethers.getContractFactory("DAudit");
    const dAudit = await DAudit.deploy(auditEnrollments.address,auditAssignments.address);
    await dAudit.deployed();
    console.log("DAudit deployed to:", dAudit.address);
   
    /* Deploy the AuditItem contract */
    const AuditItem = await ethers.getContractFactory("AuditItem")
    const auditItem = await AuditItem.deploy(dAudit.address)
    await auditItem.deployed()
    console.log("AuditItem deployed to:", dAudit.address);

  })
  it("Should get Listing Fee ", async function () {
    
    /* Deploy the Audit Smart contracts */
    const AuditEnrollments = await hre.ethers.getContractFactory("AuditEnrollments");
    const auditEnrollments = await AuditEnrollments.deploy();
    await auditEnrollments.deployed();
  
    const AuditAssignments = await hre.ethers.getContractFactory("AuditAssignments");
    const auditAssignments = await AuditAssignments.deploy();
    await auditAssignments.deployed();
  
    const DAudit = await hre.ethers.getContractFactory("DAudit");
    const dAudit = await DAudit.deploy(auditEnrollments.address,auditAssignments.address);
    await dAudit.deployed();

    const AuditItem = await ethers.getContractFactory("AuditItem")
    const auditItem = await AuditItem.deploy(dAudit.address)
    await auditItem.deployed()

    // Obtain the listing fee and calculate PayFee
    // PayFee is a combination of the listigFee + the  audit Fee

    let listingFee = await dAudit.getListingFee();
    console.log('Listing Fee= ');
    console.log(ethers.utils.formatUnits(listingFee));
    let auditFee = ethers.utils.parseEther('0.01');
    console.log('Audit Fee= ');
    console.log(ethers.utils.formatUnits(auditFee));

    let payFee = listingFee.add(auditFee);
    console.log('Pay Fee= ');
    console.log(ethers.utils.formatUnits(payFee)); 
   
  })
  
  it("Should create two Audit Items ", async function () {
    /* Deploy the Audit smart contracts */
    const AuditEnrollments = await hre.ethers.getContractFactory("AuditEnrollments");
    const auditEnrollments = await AuditEnrollments.deploy();
    await auditEnrollments.deployed();
 
    const AuditAssignments = await hre.ethers.getContractFactory("AuditAssignments");
    const auditAssignments = await AuditAssignments.deploy();
    await auditAssignments.deployed();
 
    const DAudit = await hre.ethers.getContractFactory("DAudit");
    const dAudit = await DAudit.deploy(auditEnrollments.address,auditAssignments.address);
    await dAudit.deployed();
 
    const AuditItem = await ethers.getContractFactory("AuditItem")
    const auditItem = await AuditItem.deploy(dAudit.address)
    await auditItem.deployed()
    const auditItemContractAddress = auditItem.address

    // Calculate PayFee
    // PayFee is a combination of the listigFee + the  audit Fee
    let listingFee = await dAudit.getListingFee();
    let auditFee = ethers.utils.parseEther('0.01');
    let payFee = listingFee.add(auditFee);
    let payFeeStr = payFee.toString();

    /* Create two tokens representing the Audit Items (documents to audit) */
    const trxT1 = await auditItem.createToken("https://www.mytokenlocation.com")
    const trxT1R = trxT1.wait();
    const trxT2 = await auditItem.createToken("https://www.mytokenlocation2.com")
    const trxT2R = trxT2.wait();

    console.log('Audit Items minted successfully');

    /* Submits two Audit Items for auditing */
    const trxAItem1 = await dAudit.createAuditItem(auditItemContractAddress, 1, auditFee, 3, { value: payFeeStr })
    const trxAItem1R = trxAItem1.wait();
    const trxAItem2 =await dAudit.createAuditItem(auditItemContractAddress, 2, auditFee, 3, { value: payFeeStr })
    const trxAItem2R = trxAItem2.wait();
    const [_, producerAddress] = await ethers.getSigners()

    console.log('Audit Items created successfully');
  
    /* Query and return the audit items in pending status */
    let items = await dAudit.fetchPendingAudits()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await auditItem.tokenURI(i.tokenId)
      let item = {
        price: i.auditFee.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.producer,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('List of pending Audit Items');
    console.log('items: ', items)
       
  })
  it("Should enroll and assign Auditors", async function () {

    /* Deploy the Audit Smart Contracts*/
    const AuditEnrollments = await hre.ethers.getContractFactory("AuditEnrollments");
    const auditEnrollments = await AuditEnrollments.deploy();
    await auditEnrollments.deployed();

    const AuditAssignments = await hre.ethers.getContractFactory("AuditAssignments");
    const auditAssignments = await AuditAssignments.deploy();
    await auditAssignments.deployed();

    const DAudit = await hre.ethers.getContractFactory("DAudit");
    const dAudit = await DAudit.deploy(auditEnrollments.address,auditAssignments.address);
    await dAudit.deployed();
    
    const AuditItem = await ethers.getContractFactory("AuditItem")
    const auditItem = await AuditItem.deploy(dAudit.address)
    await auditItem.deployed()
    const auditItemContractAddress = auditItem.address

    // PayFee is a combination of the listigFee + the  audit Fee
    let listingFee = await dAudit.getListingFee();
    let auditFee = ethers.utils.parseEther('0.10');
    let payFee = listingFee.add(auditFee);
    let payFeeStr = payFee.toString();

    /* Create two tokens representing the Audit Items (documents to audit) */
    t1Id = await auditItem.createToken("https://www.mytokenlocation.com")
    t2Id = await auditItem.createToken("https://www.mytokenlocation2.com")

    // Wait for the transaction receipt
    const t1IdReceipt = await t1Id.wait(); // wait for transaction
    const t2IdReceipt = await t2Id.wait(); // wait for transaction

    // The create token function emits a Transfer Event returning the tokenId
    // for the NFT representing the Audit Item
    let AItem1 = t1IdReceipt.events[0].args.tokenId.toNumber();
    let AItem2 = t2IdReceipt.events[0].args.tokenId.toNumber();

    /* Submits two Audit Items for auditing */
    tx1 = await dAudit.createAuditItem(auditItemContractAddress, AItem1, auditFee, 2, { value: payFeeStr })
    tx1Receipt = await tx1.wait(); // wait for transaction to finish
    tx2 = await dAudit.createAuditItem(auditItemContractAddress, AItem2, auditFee, 3, { value: payFeeStr })
    tx2Receipt = await tx2.wait(); // wait for transaction to finish

    // Enroll Auditors
    // Enrollment pay no fees, just gas
    payFeeStr = '0'

    // Gets the list of signers and creates enrollment arrays for the two items submitted for auditing
    const [_, auditor1Addr,auditor2Addr, auditor3Addr, auditor4Addr] = await ethers.getSigners()
    const auditorsEnrolled1 = new Array(auditor2Addr.address, auditor3Addr.address, auditor4Addr.address);
    const auditorsEnrolled2 = new Array(auditor1Addr.address, auditor2Addr.address);

    /* Add Auditors Enrollments  for Audit Item 1*/
    console.log('Enrolling Auditors for Audit Item 1')
    const tx3 = await auditEnrollments.insertAuditEnrollment(AItem1,auditorsEnrolled1,{value:payFeeStr})
    const tx3Receipt = await tx3.wait(); // wait for transaction
    
    /* Get Auditors enrolled for Audit Item 1 */
    console.log('List of auditors enrolled for Audit Item 1: ')
    let AuditData1 = await auditEnrollments.getAuditEnrollment(AItem1)
    console.log(AD2JSON(AuditData1))

    /* Add Auditors Enrollments  for Audit Item 2*/
    console.log('Enrolling Auditors for Audit Item 2')
    const tx4 = await auditEnrollments.insertAuditEnrollment(AItem2,auditorsEnrolled2, {value:payFeeStr})
    const tx4Receipt = await tx4.wait(); // wait for transaction
    
    /* Get Auditors enrolled for Audit Item 2 */
    console.log('List of Auditors enrolled for Audit Item 2: ')
    let AuditData2 = await auditEnrollments.getAuditEnrollment(AItem2)
    console.log(AD2JSON(AuditData2))
    
    console.log('Assign auditors for Audit Item 1: ')
    const tx5 = await dAudit.assignAuditors(AItem1, { value: 0 })
    const tx5Receipt = await tx5.wait(); // wait for transaction

    /* Get Auditors assigned for Audit Item 1 */
    console.log('Auditors assigned for Audit Item 1 ')
    let AuditData1Assigned = await auditAssignments.getAuditAssignment(AItem1)
    console.log(AD2JSON(AuditData1Assigned))
     
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