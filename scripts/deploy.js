// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  await hre.run('compile');

  // We get the contract to deploy
  const AuditEnrollments = await hre.ethers.getContractFactory("AuditEnrollments");
  const auditEnrollments = await AuditEnrollments.deploy();
  await auditEnrollments.deployed();
  console.log('export const auditEnrollments = "'+auditEnrollments.address+'"');

  const AuditAssignments = await hre.ethers.getContractFactory("AuditAssignments");
  const auditAssignments = await AuditAssignments.deploy();
  await auditAssignments.deployed();
  console.log('export const auditAssignments = "'+auditAssignments.address+'"')

  const DAudit = await hre.ethers.getContractFactory("DAudit");
  const dAudit = await DAudit.deploy(auditEnrollments.address,auditAssignments.address);
  await dAudit.deployed();
  console.log('export const DAuditaddress = "'+dAudit.address+'"')

  const AuditItem = await hre.ethers.getContractFactory("AuditItem");
  const auditItem = await AuditItem.deploy(dAudit.address);
  await auditItem.deployed();
  console.log('export const auditItemAddress = "'+auditItem.address+'"')

  const AuditResult = await hre.ethers.getContractFactory("AuditResult");
  const auditResult = await AuditResult.deploy(dAudit.address);
  await auditResult.deployed();
  console.log('export const auditResultAddress = "'+auditResult.address+'"')


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


  