
const KryllToken = artifacts.require('../KryllToken.sol');
const { assertRevert } = require('./helpers/assertThrow');


contract('Kryll Token', function (accounts) {
    
    let token;
    const owner = accounts[0];

    const sale     = accounts[1];
    const team     = accounts[2];
    const advisors = accounts[3];
    const security = accounts[4];
    const press    = accounts[5];
    const user_acq = accounts[6];
    const bounty   = accounts[7];


    const toNum = async function(call){
        return call.then((result) => {
          return result.toNumber();
        })
    }   

    const KRL = Math.pow(10,18);
    const toKRL = function(val){
        return val / KRL;
    }



    context("Checking token initialization", async () => {

        before(async () => {
            token = await KryllToken.new({from: owner});
        });

        it('Owner initializes correctly', async () => {
            let own = await token.owner();
            assert.equal(owner, own)
        })

        it('Decimals initializes correctly', async () => {
            let decimals = await token.decimals();
            assert.equal(decimals.toNumber(), 18);
        });

        it('Initial Distribution status initializes correctly', async () => {
            let transferable = await token.isInitialDistributionDone();
            assert.isFalse(transferable);
        });

        it('Transferable status initializes correctly', async () => {
            let transferable = await token.isTransferable();
            assert.isFalse(transferable);
        });

    })


    context("Checking token distribution", async () => {
        before(async () => {
            token = await KryllToken.new({from: owner});
        });

        
        it("Distribution config correctly", async () => {
            await token.reset( sale, team, advisors, security, press, user_acq, bounty, { from: owner});
            assert.isFalse(await token.isInitialDistributionDone());
            assert.equal(await token.sale_address(), sale);
            assert.equal(await token.team_address(), team);
            assert.equal(await token.advisors_address(), advisors);
            assert.equal(await token.security_address(), security);
            assert.equal(await token.press_address(), press);
            assert.equal(await token.user_acq_address(), user_acq);
            assert.equal(await token.bounty_address(), bounty);
        })
        
        it("Distributes correctly", async () => {
            assert.isFalse(await token.isInitialDistributionDone());
            await token.distribute({from: owner});
            assert.isTrue(await token.isInitialDistributionDone());
            assert.equal(await toNum(token.balanceOf(sale)), await toNum(token.SALE() ) );
            assert.equal(await toNum(token.balanceOf(team)), await toNum(token.TEAM()) );
            assert.equal(await toNum(token.balanceOf(advisors)), await toNum(token.ADVISORS()) );
            assert.equal(await toNum(token.balanceOf(security)), await toNum(token.SECURITY()) );
            assert.equal(await toNum(token.balanceOf(press)), await toNum(token.PRESS_MARKETING()) );
            assert.equal(await toNum(token.balanceOf(user_acq)), await toNum(token.USER_ACQUISITION()) );
            assert.equal(await toNum(token.balanceOf(bounty)), await toNum(token.BOUNTY()) );

          })

        it("Fails to change distribution config if it has occurred", async () => {
            assert.isTrue(await token.isInitialDistributionDone());            
            return assertRevert(async () => {
                await token.reset( sale, team, advisors, security, press, user_acq, bounty, { from: owner});
            })
        })

        it("Fails to redistribute if distribution it has occurred", async () => {
            assert.isTrue(await token.isInitialDistributionDone());            
            return assertRevert(async () => {
                await token.distribute({from: owner});
            })
        })
    })



    context("Transfer mechanism", async () => {

        const amount = 10 * KRL;
        const amount2 = -10 * KRL;


        before(async () => {
            token = await KryllToken.new({from: owner});
            await token.reset( sale, team, advisors, security, press, user_acq, bounty, { from: owner});
            await token.distribute({from: owner});
        })

        it('Should throw, transfer is disabled', async () => {
            return assertRevert(async () => {
                await token.transfer(bounty, amount, { from: security })
            })
        })

        it('Should transfer correctly when transfer is enabled', async () => {
            await token.allowTransfert({ from: owner})
            let balance0 = await toNum(token.balanceOf(bounty));
            await token.transfer(bounty, amount, {from: security});
            let balance1 = await toNum(token.balanceOf(bounty));
            assert.equal(toKRL(balance1), toKRL(balance0 + amount));
            assert.equal(toKRL(await toNum(token.BOUNTY())), toKRL(balance1 - amount));
        });

        it('Should throw when trying to transfer to 0x0', async () => {
            return assertRevert(async () => {
                await token.transfer("0x00", amount, { from: bounty})
            })
        });

        it('Should throw when trying to transfer to negative amount', async () => {
            return assertRevert(async () => {
                await token.transfer(security, amount2, { from: bounty})
            })
        });

        it("Should show the transfer event", function() {
            token.transfer(owner, 10*amount, { from: bounty}).then(function(result){
                console.log("\t\t"+result.logs[0].event)
            })
        });

        it('Should throw when transfering more than owned', async () => {
            let bountyBal = await toNum(token.balanceOf(bounty));
            await token.transfer(security, bountyBal - amount, { from: bounty})
            return assertRevert(async () => {
                await token.transfer(security,  10 * amount, { from: bounty})
            })            
        })

        it('Should throw when transfer is called and transfers are re-disabled', async () => {
            await token.restrictTransfert({ from: owner});
            return assertRevert(async () => {
                await token.transfer(bounty, amount, { from: security })
            })
        })

        it('Owner can transfers even if transfers are disabled', async () => {
            let bal0 = await toNum(token.balanceOf(bounty));
            await token.transfer(bounty, amount, { from: owner})
            let bal1 = await toNum(token.balanceOf(bounty));
            assert.equal(toKRL(bal1), toKRL(bal0 + amount));
        })

        it('Owner can whitelist addresses to bypass the transfer lock', async () => {
            assert.isFalse(await token.whitelisted(advisors));
            await token.whitelist(advisors, { from: owner});
            assert.isTrue(await token.whitelisted(advisors));
        })

        it('Other users cannot whitelist addresses', async () => {
            return assertRevert(async () => {
                await token.whitelist(security, { from: security})
            })
        })

        it('Whitelisted address can bypass the transfer lock', async () => {
            let bal0 = await toNum(token.balanceOf(bounty));
            await token.transfer(bounty, amount, { from: advisors})
            let bal1 = await toNum(token.balanceOf(bounty));
            assert.equal(toKRL(bal1), toKRL(bal0 + amount));
        })

        it('Should throw when approve is called and transfers are disabled', async () => {
            assert.isFalse(await token.whitelisted(security));
            return assertRevert(async () => {
                await token.approve(bounty, 2*amount, { from: security })
            })
        })
                
        it('Allowance should be 0 after a transferFrom call when transfers are disabled', async () => {
            const allowance0 = await token.allowance(security,bounty);
            assert.equal(allowance0, 0);
        })  

        it('Should approve correctly when transfers are enabled', async () => {
            await token.allowTransfert({ from: owner});
            await token.approve(bounty, 2*amount, { from: security })
        })    

        
        it('Should throw when transferFrom is called and transfers are disabled', async () => {
            await token.restrictTransfert({ from: owner})            
            return assertRevert(async () => {
                await token.transferFrom(security, team, amount, { from: bounty })
            })
        })

        it('Should transferFrom correctly when transfers are enabled', async () => {
            await token.allowTransfert({ from: owner});
            let bal0 = await toNum(token.balanceOf(team));
            await token.transferFrom(security, team, amount, { from: bounty })
            let bal1 = await toNum(token.balanceOf(team));
            //console.log("\tBal : "+ toKRL(bal0) + " + " + toKRL(amount) + " => " + toKRL(bal1) );
            assert.equal(toKRL(bal1), toKRL(bal0 + amount));
        })  
        
        it('Should throw when transferFrom call is transfering more than allowed/pending', async () => {
            return assertRevert(async () => {
                await token.transferFrom(security, team, amount + 1 * KRL , { from: bounty })
            })  
        })  


        it('Can Approve, TransferFrom correctly if whitelisted and transfers are disabled', async () => {
            
            await token.restrictTransfert({ from: owner})   
            var allowance = await toNum(token.allowance(user_acq,advisors));
            assert.equal(allowance, 0);
         
            // console.log("whitelist");
            await token.whitelist(user_acq, { from: owner});
            assert.isTrue(await token.whitelisted(user_acq));
            assert.isTrue(await token.whitelisted(advisors));

            // console.log("approve");
            await token.approve(advisors, amount, { from: user_acq })
            allowance = await toNum(token.allowance(user_acq,advisors));
            assert.equal(allowance, amount);

            // console.log("transferFrom");
            let bal0 = await toNum(token.balanceOf(team));
            await token.transferFrom(user_acq, team, amount, { from: advisors })
            let bal1 = await toNum(token.balanceOf(team));

            assert.equal(toKRL(bal1), toKRL(bal0 + amount));
        })  

    }) 


    context("Ownership mechanism", async () => {

        before(async () => {
            token = await KryllToken.new({from: owner});
        })

        it('Transfert Ownership ', async () => {
            await token.transferOwnership(team, { from: owner})
            assert.equal(await token.owner(), team);
        })

        it('Should throw when transfering ownership and not owner anymore', async () => {
            return assertRevert(async () => {
                await token.transferOwnership(team, { from: owner})
            });
        })
    }) 

}); //contract