const { expect } = require("chai");
const { ethers } = require("hardhat");

function AD2JSON (AuditData1) {
  return  {
    index: AuditData1.index.toString(),
    auditId: AuditData1.auditId.toString(),
    auditors: AuditData1.auditors
  }
}

describe("DAudit", function () {
  
  it("Should deploy Audit", async function () {
    /* deploy the Audit */
    const AuditEnrollments = await hre.ethers.getContractFactory("AuditEnrollments");
    const auditEnrollments = await AuditEnrollments.deploy();
    await auditEnrollments.deployed();
    console.log("AuditEnrollments deployed to:", auditEnrollments.address);
  
    const AuditAssignments = await hre.ethers.getContractFactory("AuditAssignments");
    const auditAssignments = await AuditAssignments.deploy();
    await auditAssignments.deployed();
    console.log("AuditAssignments deployed to:", auditAssignments.address);
  
    const DAudit = await hre.ethers.getContractFactory("DAudit");
    const dAudit = await DAudit.deploy(auditEnrollments.address,auditAssignments.address);
    await dAudit.deployed();
    console.log("DAudit deployed to:", dAudit.address);
  
  })
  it("Should deploy AuditItems", async function () {
     /* deploy the Audit */
     const AuditEnrollments = await hre.ethers.getContractFactory("AuditEnrollments");
     const auditEnrollments = await AuditEnrollments.deploy();
     await auditEnrollments.deployed();
     console.log("AuditEnrollments deployed to:", auditEnrollments.address);
   
     const AuditAssignments = await hre.ethers.getContractFactory("AuditAssignments");
     const auditAssignments = await AuditAssignments.deploy();
     await auditAssignments.deployed();
     console.log("AuditAssignments deployed to:", auditAssignments.address);
   
     const DAudit = await hre.ethers.getContractFactory("DAudit");
     const dAudit = await DAudit.deploy(auditEnrollments.address,auditAssignments.address);
     await dAudit.deployed();
     console.log("DAudit deployed to:", dAudit.address);
   
    
    /* deploy the AuditItem contract */
    const AuditItem = await ethers.getContractFactory("AuditItem")
    const auditItem = await AuditItem.deploy(dAudit.address)
    await auditItem.deployed()
    const auditItemContractAddress = auditItem.address
  })
  it("Should get Listing Fee ", async function () {
    /* deploy the Audit */
    const AuditEnrollments = await hre.ethers.getContractFactory("AuditEnrollments");
    const auditEnrollments = await AuditEnrollments.deploy();
    await auditEnrollments.deployed();
    console.log("AuditEnrollments deployed to:", auditEnrollments.address);
  
    const AuditAssignments = await hre.ethers.getContractFactory("AuditAssignments");
    const auditAssignments = await AuditAssignments.deploy();
    await auditAssignments.deployed();
    console.log("AuditAssignments deployed to:", auditAssignments.address);
  
    const DAudit = await hre.ethers.getContractFactory("DAudit");
    const dAudit = await DAudit.deploy(auditEnrollments.address,auditAssignments.address);
    await dAudit.deployed();
    console.log("DAudit deployed to:", dAudit.address);
  

      /* deploy the AuditItem contract */
   const AuditItem = await ethers.getContractFactory("AuditItem")
   const auditItem = await AuditItem.deploy(dAudit.address)
   await auditItem.deployed()
   const auditItemContractAddress = auditItem.address

   let listingFee = await dAudit.getListingFee();
   console.log('Listing Fee= ');
   //console.log(listingFee.toNumber());
   console.log(ethers.utils.formatUnits(listingFee));
   let auditFee = ethers.utils.parseEther('0.01');
   console.log('auditFee= ');
   console.log(ethers.utils.formatUnits(auditFee));
   let payFee = listingFee.add(auditFee);
   console.log('payFee= ');
   console.log(ethers.utils.formatUnits(payFee)); 
   
  })
  
  it("Create two Audit Items ", async function () {
     /* deploy the Audit */
     const AuditEnrollments = await hre.ethers.getContractFactory("AuditEnrollments");
     const auditEnrollments = await AuditEnrollments.deploy();
     await auditEnrollments.deployed();
     console.log("AuditEnrollments deployed to:", auditEnrollments.address);
   
     const AuditAssignments = await hre.ethers.getContractFactory("AuditAssignments");
     const auditAssignments = await AuditAssignments.deploy();
     await auditAssignments.deployed();
     console.log("AuditAssignments deployed to:", auditAssignments.address);
   
     const DAudit = await hre.ethers.getContractFactory("DAudit");
     const dAudit = await DAudit.deploy(auditEnrollments.address,auditAssignments.address);
     await dAudit.deployed();
     console.log("DAudit deployed to:", dAudit.address);
   
       /* deploy the AuditItem contract */
    const AuditItem = await ethers.getContractFactory("AuditItem")
    const auditItem = await AuditItem.deploy(dAudit.address)
    await auditItem.deployed()
    const auditItemContractAddress = auditItem.address

    // PayFee is a combination of the listigFee + the  audit Fee
    // should we write this code client-side, i don't think so (review)
    let listingFee = await dAudit.getListingFee();
    let auditFee = ethers.utils.parseEther('0.01');
    let payFee = listingFee.add(auditFee);
    let payFeeStr = payFee.toString();

    /* create two tokens */
    const ttx1 = await auditItem.createToken("https://www.mytokenlocation.com")
    const ttx1R = ttx1.wait();
    const ttx2 = await auditItem.createToken("https://www.mytokenlocation2.com")
    const ttx2R = ttx2.wait();
    
    /* put both tokens for sale */
    const ttx221 = await dAudit.createAuditItem(auditItemContractAddress, 1, auditFee, 3, { value: payFeeStr })
    const ttx221R = ttx221.wait();
    const ttx22 =await dAudit.createAuditItem(auditItemContractAddress, 2, auditFee, 3, { value: payFeeStr })
    const ttx22R = ttx22.wait();
    const [_, buyerAddress] = await ethers.getSigners()
  
    /* query for and return the pending items */
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
    console.log('items: ', items)
       
  })
  it("Should Assign Auditors", async function () {
    /* deploy the Audit */
    const AuditEnrollments = await hre.ethers.getContractFactory("AuditEnrollments");
    const auditEnrollments = await AuditEnrollments.deploy();
    await auditEnrollments.deployed();
    console.log("AuditEnrollments deployed to:", auditEnrollments.address);
  
    const AuditAssignments = await hre.ethers.getContractFactory("AuditAssignments");
    const auditAssignments = await AuditAssignments.deploy();
    await auditAssignments.deployed();
    console.log("AuditAssignments deployed to:", auditAssignments.address);
  
    const DAudit = await hre.ethers.getContractFactory("DAudit");
    const dAudit = await DAudit.deploy(auditEnrollments.address,auditAssignments.address);
    await dAudit.deployed();
    console.log("DAudit deployed to:", dAudit.address);
  
      /* deploy the AuditItem contract */
   const AuditItem = await ethers.getContractFactory("AuditItem")
   const auditItem = await AuditItem.deploy(dAudit.address)
   await auditItem.deployed()
   const auditItemContractAddress = auditItem.address
   console.log("DAudit deployed to:", auditItemContractAddress);

   // PayFee is a combination of the listigFee + the  audit Fee
   // should we write this code client-side, i don't think so (review)
   let listingFee = await dAudit.getListingFee();
   let auditFee = ethers.utils.parseEther('0.10');
   let payFee = listingFee.add(auditFee);
   let payFeeStr = payFee.toString();

   /* create two tokens */
   t1Id = await auditItem.createToken("https://www.mytokenlocation.com")
   t2Id = await auditItem.createToken("https://www.mytokenlocation2.com")

   // Wait for the transaction receipt
   const t1IdReceipt = await t1Id.wait(); // wait for mining
   const t2IdReceipt = await t2Id.wait(); // wait for mining

//   console.log(t1Id);

  //  let eventEmitted = false;
  //     if (t1IdReceipt.events[0].event == "Transfer") {
  //    eventEmitted = true;
  //  }
  //  console.log('t1IdReceipt'+eventEmitted)

   // The create token function emits a Transfer Event returned in the rec
   idToken1 = t1IdReceipt.events[0].args.tokenId.toNumber();
   idToken2 = t2IdReceipt.events[0].args.tokenId.toNumber();

    /* Add two Audit Items */
    tx1 = await dAudit.createAuditItem(auditItemContractAddress, idToken1, auditFee, 2, { value: payFeeStr })
    tx1Receipt = await tx1.wait(); // wait for mining
    tx2 = await dAudit.createAuditItem(auditItemContractAddress, idToken2, auditFee, 3, { value: payFeeStr })
    tx2Receipt = await tx2.wait(); // wait for mining
   // Enroll Auditors
    payFeeStr = '0'

    const [_, auditor1Addr,auditor2Addr, auditor3Addr, auditor4Addr] = await ethers.getSigners()
    const auditorsEnrolled2 = new Array(auditor1Addr.address, auditor2Addr.address);
    const auditorsEnrolled1 = new Array(auditor2Addr.address, auditor3Addr.address, auditor4Addr.address);

    /* Add Auditors Enrollments  for idToken1*/
    const tx3 = await auditEnrollments.insertAuditEnrollment(idToken1,auditorsEnrolled1,{value:payFeeStr})
    const tx3Receipt = await tx3.wait(); // wait for mining
    /* Add Auditors Enrollments  for idToken2*/
    const tx4 = await auditEnrollments.insertAuditEnrollment(idToken2,auditorsEnrolled2, {value:payFeeStr})
    const tx4Receipt = await tx4.wait(); // wait for mining

    /* Get Auditors enrolled for tokenId 1 */
    console.log('/* Get Auditors enrolled for tokenId 1 */')
    let AuditData1 = await auditEnrollments.getAuditEnrollment(idToken1)
    console.log(AD2JSON(AuditData1))

    /* Get Auditors enrolled for tokenId 2 */
    // let AuditData2 = await auditEnrollments.getAuditEnrollment(idToken2)
    // console.log(AD2JSON(AuditData2))
    
    const tx5 = await dAudit.assignAuditors(idToken1, { value: 0 })
    const tx5Receipt = await tx5.wait(); // wait for mining

      /* Get Auditors assigned for tokenId 1 */

      console.log('/* Get Auditors assigned for tokenId 1 */')
      let AuditData1Assigned = await auditAssignments.getAuditAssignment(idToken1)
      console.log(AD2JSON(AuditData1Assigned))
        
  })
})