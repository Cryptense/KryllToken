# Kryll.io Token (KRL) Smart Contracts

This repository contains the  source code of the smart contracts written for [Kryll.io](https://kryll.io) Project. KRL token is developed on Ethereum’s blockchain and conform to the ERC20 Token Standard.


Kryll.io smart contracts are  with [Truffle](https://github.com/ConsenSys/truffle), an Ethereum development environment. 


The KRL ERC20 token is based on [OpenZeppelin framework ](https://github.com/OpenZeppelin/zeppelin-solidity) StandardToken.

The Vesting contract is based on [OpenZeppelin framework ](https://github.com/OpenZeppelin/zeppelin-solidity) TokenVesting.


### Install

Install dependencies:
```
npm install -g truffle
npm install
```

### Running tests

```
$ truffle dev
truffle(develop)> test
```


## KRL ERC20 token contract

ERC20 is a technical standard used for smart contracts on the Ethereum blockchain for implementing tokens. ERC stands for Ethereum Request for Comment, and 20 is the number that was assigned to this request.

### Token details

  - Contract name **KryllToken**
  - Name **Kryll.io Token**
  - Symbol **KRL**
  - Decimals **18**

KRL ERC20 Smart Contract : https://etherscan.io/address/<todo>#code


### Token repartition

  Total supply **49417297 KRL** :
  
  - Sale **17737348 KRL** (token sale)
  - Team **8640000 KRL** (vested)
  - Advisors **2880000 KRL**
  - Security Reserve **4320000 KRL**
  - Press & Marketing **5040000 KRL**
  - User Acquisition **10080000 KRL**
  - Bounty (ICO & future) **720000 KRL**


## KRL Vesting contract

A vesting contract lock an amount of a specific token and given them progressively to someone. The period is defined by the `starting time` (the date you start to accumulate tokens), the `grant period` (number of seconds of the grant) and the `cliff period` (number of seconds before the withdraw is possible).

> ```
>  Tokens Released
>   |                       __________ 	
>   |                     _/ 				
>   |                   _/  
>   |                 _/
>   |                /
>   |              .|
>   |            .  |
>   |          .    |
>   |        .      |
>   |      .        |
>   |    .          |
>   +===+===========+--------+---------> time
>      Start       Cliff     End
> ```


### Vesting detail

  - Cliff **90 Days**
  - Vesting duration **1 year**
  - Start Date **KRL Token emission date**

Team Vesting Smart Contract : https://etherscan.io/address/<todo>#code


## Audits
The Kryll.io team asked [PlayitOpen](http://www.playitopen.org) and [SmartDec](https://smartcontracts.smartdec.net/) to review and audit the ERC20 KRL Token and KRL Vesting contracts. Here are the audits repports :

  - https://github.com/Cryptense/KryllToken/blob/master/audits/PlayitOpen_Audit.md from PlayitOpen
  - https://github.com/Cryptense/KryllToken/blob/master/audits/SmartDec_Audit.pdf from SmartDec


## Security
Kryll smart contracts are based on [OpenZeppelin](https://github.com/OpenZeppelin/zeppelin-solidity/).
OpenZeppelin is meant to provide secure, tested and community-audited code, but please use common sense when doing anything that deals with real money! We take no responsibility for your implementation decisions and any security problem you might experience.

If you find a security issue, please email [dev@cryptense.com](mailto:dev@cryptense.com).


## License
Code released under the [MIT License](https://github.com/Productivist/productivist-token/blob/master/LICENSE).


## Version

  - **V 0.0** : Initial version, pre-audit
  - **V 0.1** : Post PlayitOpen audit version (April 24th 2018)
  - **V 0.2** : Post SmartDec audit version (April 25th 2018)
