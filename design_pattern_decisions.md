# Design Pattern Decisions

## Inheritance and Interfaces extends ERC721URIStorage

- ### AuditItem and AuditResults
Audit Items and Results extends ERC721URIStorage from oppenzeppeling for modelling the NFT associated to a real world document which is submitted and signed by producers and auditors respectively.

## Access Control Design Patterns

onlyOwner modifiers are implemented to allow only the owner of the DAudit smart contract to call the auditor assignements and auditor payments methods.
