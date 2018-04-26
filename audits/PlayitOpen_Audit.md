# Kryll.io Token (KRL) Smart Contracts Audit by PlayitOpen

The Kryll.io team asked PlayitOpen to review and audit their ERC20 KRL Token and KRL Vesting contracts. We looked at the code and now publish our results.
Here is our assessment and recommendations, in order of importance.

## Critical severity

No critical severity issues were found.

## High severity

No high severity issues were found.

## Medium severity

No medium severity issues were found.

## Low severity

### Unexpected value for token distribution constants

The constants **SALE**, **TEAM**, **ADVISORS**, **SECURITY**, **PRESS_MARKETING**, **USER_ACQUISITION** and **BOUNTY** in KryllToken.sol represent the number of tokens to be distributed after the end of the crowdsale. The distribution is defined to be :

40,320,000(SALE 56%) + 8,640,000(TEAM 12%) + 2,880,000(ADVISORS 4%) + 4,320,000(SECURITY 6%) + 5,040,000(PRESS\_MARKETING 7%) + 10,080,000(USER\_ACQUISITION 14%) + 720,000(BOUNTY 1%) = 72,000,000(MAX SUPPLY 100%)

According to the whitepaper (chapter Token Sale Information, p. 11), unsold tokens will not be generated. As 17,721,827 token has been sold during the crowdsale, these constants are meant to be replaced before deployment by the updated values. 

Distribution adresses (`sale_address, team_address, advisors_address, security_address, press_address, user_acq_address, bounty_address`) are hard coded and meant to be reseted before distribution.

Hard-coded token amounts and addresses are error-prone, as one could forget to update them or set incorrect values. 

Please be very carefull during deployment.

Consider adding token amount variables as constructor parameters to enforce that they be set and to compute `totalSupply` at construction. 

Consider also removing hard coded destination addresses to enforce `reset` function call before distributing. 

Note : Comment for **USER_ACQUISITION** specifies 6% instead of 14%.

**Update** : README file updated and KryllToken.sol fixed in (f270ebb)[https://github.com/Cryptense/KryllToken/commit/f270ebb0cbd1fee0ca5a5e4ea8f363c0048741f8]

### Sale, team, advisors, security, press_marketing, user_acquisition and bounty addresses should not be 0x0 address.

Consider adding `require(_saleAddrss != 0x0 && _teamAddrss != 0x0 && _advisorsAddrss != 0x0 && _securityAddrss != 0x0 && _pressAddrss != 0x0 && _usrAcqAddrss != 0 && _bountyAddrss != 0x0);` at the beginning of the `reset` function in KryllToken.sol

Or 

Consider replacing  `require(sale_address != 0x0);` by `require(sale_address != 0x0 && team_address != 0x0 && advisors_address != 0x0 && security_address != 0x0 && press_address != 0x0 && user_acq_address != 0 && bounty_address != 0x0);` at the beginning of the `distribute` function in KryllToken.sol

**Update** : Fixed in (f270ebb)[https://github.com/Cryptense/KryllToken/commit/f270ebb0cbd1fee0ca5a5e4ea8f363c0048741f8]

### Whitelist address to bypass the transfer lock should not be 0x0 address.

Consider adding `require(_address != 0x0);` at the beginning of the `whitelist` function in TransferableToken.sol.

Consider also to implement a remove from whitelist function.

**Update** : Fixed in (f270ebb)[https://github.com/Cryptense/KryllToken/commit/f270ebb0cbd1fee0ca5a5e4ea8f363c0048741f8]

## Notes & Additional Information

* Consider upgrading to the latest version of Solidity (0.4.23), which comes with the last release of Truffle (4.1.7).
The solc compiler is under active development. Downstreaming security changes will help increase overall contract security and catch outdated practices
**Update** : Upgraded in (f270ebb)[https://github.com/Cryptense/KryllToken/commit/f270ebb0cbd1fee0ca5a5e4ea8f363c0048741f8]

* Consider upgrading to the latest version of OpenZeppelin (1.8.0).
For instance, the ERC20 standard requires the (totalSupply)[https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md] function to be explicitly defined in its public interface, which was updated since OpenZeppelin 1.6.0.
**Update** : Upgraded in (f270ebb)[https://github.com/Cryptense/KryllToken/commit/f270ebb0cbd1fee0ca5a5e4ea8f363c0048741f8]

* If you are going to distribute the sold tokens manually via transfer, keep in mind that token holders will be able to make transfers themselves during the distribution. If you wish to audit the distribution afterwards to ensure it was done correctly, look for the Transfer events instead of balances.

* Consider to add a `setName` in KryllToken.sol to allow owner to later update token name if needed.
``` 
  function setName(string _name) onlyOwner public {
    name = _name;
  }
```
**Update** : Added in (f270ebb)[https://github.com/Cryptense/KryllToken/commit/f270ebb0cbd1fee0ca5a5e4ea8f363c0048741f8]

* Consider to slightly reduce gas consumption during token transfer by changing modifier `canTransfert`  : 
```
    //Current implementation
    modifier canTransfert() {
        if(!(whitelisted[msg.sender])){
            require(transferable);
        }        
        _;
    }

    //transfer() transaction cost : 52330
```
```
   //Proposed implementation
   modifier canTransfert() {
        if(!transferable){
            require (whitelisted[msg.sender]);
        } 
        _;
   }
   
   //transfer() transaction cost : 51982
```
**Update** : Modified in (f270ebb)[https://github.com/Cryptense/KryllToken/commit/f270ebb0cbd1fee0ca5a5e4ea8f363c0048741f8]

* For token holder distribution, consider a batch function to reduce gas cost. For instance :
```
function batch(address[] _data,uint256[] _amount) public onlySaleWallet {
    for (uint i = 0; i < _data.length; i++) {
      transfer(_data[i],_amount[i]);
    }
}
```

* Consider adding tests for KryllVesting releasable amount in case of token transfer disabled. 
```
    //At the end of context "Vesting mechanism"
    it('Should revert token release when token transfers are disabled', async () => {
        await token.restrictTransfert({ from: owner});
        let releasable = await vesting.releasableAmount();
        assertRevert(async () => {await vesting.release({from: team_addrss})});
        assert.equal(toKRL(releasable), toKRL(await vesting.releasableAmount()));
    })
```
**Update** : Added in (f270ebb)[https://github.com/Cryptense/KryllToken/commit/f270ebb0cbd1fee0ca5a5e4ea8f363c0048741f8]

### Conclusion

Using OpenZeppelin led to very little custom code written, and no critical or high severity issues were found. Only three changes were suggested, and some small observations/optimizations were made.









