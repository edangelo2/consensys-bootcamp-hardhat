# Solidity Pitfalls and Attacks

## Use specific pragma compiler (SWC-103)
Compiler pragma is set to `0.8.3` following the recommendation to use an specific compiler version.

**Reason why**: Contracts should be deployed with the same compiler version and flags that they have been tested with. Locking the pragma helps ensure that contracts do not accidentally get deployed using the latest compiler which may have higher risks of undiscovered bugs. 

## Modifiers used only for validation
All modifiers in contract(s) only validate data with `require` statements.

**Reason why**:
The code inside a modifier is usually executed before the function body, so any state changes or external calls will violate the **Checks-Effects-Interactions** pattern which requires to:

- **Checks to be done first.**
Most functions will first perform some checks (who called the function, are the arguments in range, did they send enough Ether, does the person have tokens, etc.). These checks should be done first.

- **Second Step - Call functions once checks passed** 
As the second step, if all checks passed, effects to the state variables of the current contract should be made. Interaction with other contracts should be the very last step in any function.


# Smart Contract Pitfalls and Attacks

## Re-entrancy (SWC-107)
The contracts that implements the transfer funds funtcionality  extends ReentrancyGuard from Open Zeppeling and uses the nonReentrant() modifier to prevent reentracy in the methods transferring funds from the smart contract.

i.e.: The ***Daudit*** smart contract extends ***ReentrancyGuard*** and the function ***payAuditor*** adds the ***nonReentrant*** modifier to prevent reentrancy.

**Reason why**:
https://swcregistry.io/docs/SWC-107
