# blockchain-developer-bootcamp-final-project
## Decentralized Audits

A distributed system for auditing things that require human interaction and manual processes in the process of auditing.

### Main Entities of the system:

####  - Auditable Things
  Product, Process, Tasks, Activities that require to be audited by the community.
####  - Producers
  The person responsible for producing the auditable thing
#### - Auditors
  Members of the community with the ability to audit things
#### - Community Member
  The general public interested on Auditable Things

### How does it work

#### 1. Audits are required for Producers
The producers are required to present perform an audit to the things they produce to comply with the rules of the community. 
A portion of the cost for producing things is getting audits on the processes and things they produce.
#### 2. Auditors are qualified and get paid for their work
The auditors are members of the community qualified to perform audit reports and results on a given auditable thing. 
The auditors get paid for producing auditing reports and informing the results.
#### 3. The Audit Request
The producer submit an Request for Audit to the system indicating the following:
- Auditable Thing
	- Audit tasks  - Description of the audit proccess
	- Audit assets - Elements of the auditable things that will be provided for the audit
	- Audit Fee - Amount that all the auditors will receive for performing the audit 
	- Number of Auditors Required
	- Time Frames
		- Period for assigning the auditors
		- Period for performing the audit
#### 4. The Auditors apply for Current Requests
The auditors will review the current available Request for Audit and apply to the ones that they wish to participate.
#### 5. The System Select & Confirm Auditors 
When the period for assigning the auditors begins the System will issue a confirm Request randomly to the auditors willing to participate.
Auditors will be able confirm their participation until the period ends and the minimum auditors required + 1 are confirmed. 
The minimum auditors will be selected for performing the audit and the last one will audit the overall audit results.
#### 6. The auditors submit the auditable assets
The Producers will submit and sign the documents associated to the audit assets when the period for performing the asset start.
#### 7. The producers deposit the audit fees
The producers will deposit the Audit Fee at the beginning of the audit. The system will lock the funds.
Once the deposit is done the system will notify that auditors can begin working on the audit.
#### 8. The Auditors submit the audit results 
Auditors will submit and sign the Audit Results to the system.
The Audit Results will contain the documents with evidence of the audit process and an overall outcome, a discrete grade (could also also be OK, NOT OK)
#### 9. The Audit process is audited
The Auditor with role Audit Process Auditor will participate once the audit is finished by all the auditors and verify that it was processed correctly.
The system will distribute the fees evenly between the participants and release the funds to the auditors wallets.
#### 10. Community Members will review the Audit Progress
The community members will be able to review evolution of the process and evidence at anytime in the system.
#### Anonymity 
The auditors and producers information is kept hidden through all the process they don't know each other, any piece of information submitted and revealed to the system must maintain the anonymity of the producers and the auditors.

### Example

**AuditableThing:** Purchases

**AuditableThing.assets:** Budget, Invoices, Deliver receipts, etc.

**Producers:** Goverment Purchase Department

**Auditors:** Citizens that can review documentation

**AuditableThing.auditEvidence:** Reconciliation details and observations on audited documents

**Community Members** People in general

  
