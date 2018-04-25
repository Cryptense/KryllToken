var KryllToken = artifacts.require("./KryllToken.sol");
var KryllVesting = artifacts.require("./KryllVesting.sol");

module.exports = function(deployer) {
  deployer.deploy(KryllToken).then( ()=>{
       deployer.deploy(KryllVesting).then( ()=>{
        KryllToken.deployed().then(function(kryll) { 
          kryll.reset("0xf17f52151ebef6c7334fad080c5704d77216b732",
                      "0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef",
                      "0x821aea9a577a9b44299b9c15c88cf3087f3b5544",
                      "0x0d1d4e623d10f9fba5db95830f7d3839406c6af2",
                      "0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e",
                      "0x2191ef87e392377ec08e7c08eb105ef5448eced5",
                      "0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5");
          kryll.distribute();
          kryll.whitelist("0xf17f52151ebef6c7334fad080c5704d77216b732");
          
         });
  
       });
    }
  )
};
