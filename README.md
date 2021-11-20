# Final Project Functional Description
## Decentralized Audits

A distributed system for auditing things that require human interaction and manual processes in the process of auditing.

### Main Entities of the system:

#### - Audit Items
Product, Process, Tasks, Activities that require to be audited by the community.
####  - Producers
  The person responsible for producing the audit item
#### - Auditors
  Members of the community with the ability to audit the items submitted by the producers
#### - Community Member
  The general public interested on controlling the items audit processes 

### How does it work

#### 1. Audits are required for Producers
The producers are required to perform an audit to the things they produce in order to comply with the rules of the community. (e.g.: audit the tax statement from a politician, enviromental impact reports, etc.)
A portion of the producing cost is allocated to getting audits done on the processes and things they produce.
#### 2. Auditors are qualified and get paid for their work
The auditors are members of the community qualified to perform audit reports and submitting the results on a given auditable item. 
The auditors get paid for producing auditing reports and informing the results.
#### 3. The Audit Request
The producer submit an Request for Audit to the system indicating the following:
- Audit Item
	- Audit Name/Description  - Description of the audit request for a given Item
	- Audit Item - Elements of the auditable things that will be provided for the audit
	- Audit Fee - Amount that all the auditors will receive for performing the audit 
	- Number of Auditors Required
#### 4. The Auditors apply for auditing items
The auditors will review the current available items submitted for auditing by the producers and will enroll to the ones that they wish to participate performing the audit.
#### 5. The System randomly assigns the auditors  
When the period for assigning the auditors ends and there are enough auditors enrolled the System will randomly select and assign the auditors for performing the audit.
#### 6. The producers submit the auditable assets
The Producers will submit and sign the documents associated to the audit item.
#### 7. The producers deposit the audit fees
The producers will deposit the Audit Fee at the beginning of the audit. The system will lock the funds. 
#### 8. The Auditors submit the audit results 
Auditors will submit and sign the Audit Results to the system.
The Audit Results will contain the documents with evidence of the audit process and an overall outcome: Passed or Failed.
#### 9. The System pays the auditors
The system will distribute the fees evenly between the participants and release the funds to the auditors wallets.
#### 10. Community Members will review the Audit Progress
The community members will be able to review evolution of the process and evidence at anytime in the system.
#### Anonymity 
The auditors and producers information is kept hidden through all the process they don't know each other, any piece of information submitted and revealed to the system must maintain the anonymity of the producers and the auditors.

### Example 1 - Tax Statements

**Auditable Item:** Tax Statement

**Producers:** Politically Expossed Person

**Auditors:** Citizens that can review tax statements

**Audit Results:** Documents with the results of evaluating the tax statement is correct and the observations

**Community Members** People in general

### Example 2 - Puchase Process

**Auditable Item:** Purchase Order

**Producers:** Goverment Entity Purchase Department

**Auditors:** Citizens that can review purchase orders processes

**Audit Results:** Documents with the results of evaluating that the steps of processing the purchase orders was correct

**Community Members** People in general

# Project Technical Details and Sumbmission requirements

## Ethereum account to receive your certification as an NFT
0x745E9390F6Fdcc932AB5b41850aB94C87f224974

## Dapp Site URL
The Dapp is hosted in Netifly in the following URL: https://quirky-leavitt-985d0f.netlify.app

## Smart Contracts Deployments

The smart contracts are deployed in the Ropsten Network in the following addresses:

auditEnrollments = "0x7364B83Df2FB101b69c2137790411Cb5e011262d"
auditAssignments = "0xf5426Bf7cbE8F19E8390F68bb4D033d45e012855"
DAuditaddress = "0x5344ef29Ac1875A9BbbcD70B21dDeF7403EcacfD"
auditItemAddress = "0x6345423b2869ed0367D60078930c45E91cb9013D"
auditResultAddress = "0x98BcDAe1fE42ee106DF1A6aa4221363928a86aE2"

Note: This can be set up in the config.js file for running locally the Dapp against the deplyed contracts if required.


