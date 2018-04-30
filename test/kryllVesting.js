const KryllToken = artifacts.require('../KryllToken.sol');
const KryllVesting = artifacts.require('../KryllVesting.sol');
const { assertRevert,assertInvalidOpcode } = require('./helpers/assertThrow');
const { increaseTime, duration } = require('./helpers/increaseTime');


contract('Kryll Vesting', function (accounts) {

    let token;
    let vesting;
    const owner = accounts[0];

    const no_vested     = accounts[1];
    const team_addrss   = accounts[2];


    const toNum = async function(call){
        return call.then((result) => {
          return result.toNumber();
        })
    }   

    const KRL = Math.pow(10,18);
    const toKRL = function( val ){
        return val / KRL;
    }


    context("Checking vesting initialization", async () => {
        before(async () => {
            // create contracts
            token = await KryllToken.new({from: owner});
            vesting = await KryllVesting.new({from: owner});
            await vesting.setup(team_addrss,token.address,{from: owner});
        });

        it('Owner initializes correctly', async () => {
            let own = await token.owner();
            assert.equal(owner, own)
            own = await vesting.owner();
            assert.equal(owner, own)
        })

        it('Variables initializes correctly', async () => {
            let beneficiary = await vesting.beneficiary();
            assert.equal(beneficiary, team_addrss);
            let tk = await vesting.token();
            assert.equal(tk, token.address);
        });

        it('Initial started status initializes correctly', async () => {
            let sarted = await vesting.isStarted();
            assert.isFalse(sarted);
        });

        it('Released amount initializes correctly', async () => {
            let amount = await vesting.released();
            assert.equal(amount, 0);
        });

        it('Another account canont initializes the contract', async () => {
            return assertRevert(async () => {
                await vesting.setup(team_addrss,token.address,{from: team_addrss});
            })
        })

        it('Owner can change the contract settings if not started', async () => {
            await vesting.setup(owner,token.address,{from: owner});
            let benef = await vesting.beneficiary();
            assert.equal(benef, owner);
        })

        it('Owner cannot change the contract settings if vesting is started', async () => {
            await vesting.start();
            return assertRevert(async () => {
                await vesting.setup(owner,token.address,{from: owner});
            })
        })

        it('Only the Owner can change the beneficiary address when vesting is started', async () => {
            await vesting.changeBeneficiary(team_addrss,{from: owner});
            let benef = await vesting.beneficiary();
            assert.equal(benef, team_addrss);
            return assertRevert(async () => {
                await vesting.changeBeneficiary(team_addrss,{from: team_addrss});
            })
        })

    })


    context("Checking vesting allocation", async () => {
        before(async () => {
            // create contracts
            token = await KryllToken.new({from: owner});
            vesting = await KryllVesting.new({from: owner});
            await vesting.setup(team_addrss,token.address,{from: owner});
            await token.reset( no_vested, vesting.address, no_vested, no_vested, no_vested, no_vested, no_vested, { from: owner});
            await token.distribute({from: owner});            
        });


        it("Contract token recieved", async () => {
            assert.equal(await toNum(token.balanceOf(vesting.address)), await toNum(token.TEAM() ) );
        })

        it("No Token released", async () => {
            let amount = await vesting.released();
            assert.equal(amount, 0);
        })        
    })



    context("Vesting mechanism", async () => {

        before(async () => {
            // create contracts
            token = await KryllToken.new({from: owner});
            vesting = await KryllVesting.new({from: owner});
            await token.reset( no_vested, vesting.address, no_vested, no_vested, no_vested, no_vested, no_vested, { from: owner});
            await token.distribute({from: owner});
            await token.allowTransfert({ from: owner});            
        });

        it("Can't start if not setuped", async () => {
            return assertRevert(async () => {
                await vesting.start();
            })  
        })

        it("Can't release if not started", async () => {
            await vesting.setup(team_addrss,token.address,{from: owner});
            return assertRevert(async () => {
                await vesting.release({from: owner});
            })            
        })


        it("Start vesting", async () => {
            await vesting.start();
            let sarted = await vesting.isStarted();
            assert.isTrue(sarted);
        })

        it('Cannot be released before cliff', async () => {
            assert.equal(await vesting.releasableAmount(), 0);
            await increaseTime(duration.days(89)); //Wait 89 days
            assert.equal(await vesting.releasableAmount(), 0);
            return assertRevert(async () => {
                await vesting.release({from: owner});
            })
        });

        it('Can be released after cliff', async () => {
            await increaseTime(duration.days(2)); //Wait 2 days (91 in total)
            let releasable = await vesting.releasableAmount();
            assert.isFalse(releasable == 0);
            console.log("\tReleasable : " + toKRL(releasable) );
        });

        it('Should transfer releasable tokens correctly (can be done by anyone)', async () => {
            await vesting.release({from: team_addrss});
            let amount = await vesting.released({from: owner});
            assert.isFalse(amount == 0);
            console.log("\tReleased : " + toKRL(amount) );
            console.log("\tPending : " + toKRL(await vesting.releasableAmount()) );
        });


        it('Beneficiary should receive the tokens correctly', async () => {
            let amount = await vesting.released({from: owner});
            let balance = await toNum(token.balanceOf(await vesting.beneficiary()));
            assert.equal(toKRL(amount), toKRL(balance));
        });
        
        
        it('Few tokens are releasable after a small period', async () => {
            await increaseTime(duration.minutes(2)); //Wait 2 days (91 in total)
            let releasable = await vesting.releasableAmount();
            console.log("\tPending : " + toKRL(releasable) );
            assert.isTrue(releasable > 0);
        })
        
        it('Should revert token release when token transfers are disabled', async () => {
            await token.restrict(vesting.address, { from: owner}); 
            await token.restrictTransfert({ from: owner});
            assert.isFalse(await token.whitelisted(team_addrss));
            let releasable = await vesting.releasableAmount();
            assertRevert(async () => {await vesting.release({from: team_addrss})});
            assert.equal(toKRL(releasable), toKRL(await vesting.releasableAmount()));
        })
    }) 

    context("Vesting flow", async () => {

        before(async () => {
            // create contracts
            token = await KryllToken.new({from: owner});
            vesting = await KryllVesting.new({from: owner});
            await vesting.setup(team_addrss,token.address,{from: owner});
            await token.reset( no_vested, vesting.address, no_vested, no_vested, no_vested, no_vested, no_vested, { from: owner});
            await token.distribute({from: owner});
            await vesting.start();
            await token.allowTransfert({ from: owner});            
        });

        it('should linearly release tokens during vesting period',  async () => {
            const vestingPeriod = await vesting.VESTING_DURATION();
            const cliff = await vesting.CLIFF_DURATION();
            const startTime = await vesting.startTime();

            const vestedAmount = await token.balanceOf(vesting.address);
            console.log("\tVested : " + toKRL(vestedAmount));

            const checkpoints = 25;
            let i=0;            
            do{
                let releasable = await vesting.releasableAmount();
                if(releasable > 0){
                    await vesting.release();
                    let released = await toNum(vesting.released());
                    let balance = await toNum(token.balanceOf(await vesting.beneficiary()));
                    assert.equal(toKRL(released), toKRL(balance));
                }
                console.log("\t D+" + 15*i + " -> released : " + toKRL(await toNum(vesting.released())) );

                await increaseTime( duration.days(15));
                i++;
            }while(i <= checkpoints); 
        });

        it('should no longer own tokens',  async () => {
            let balance = await toNum(token.balanceOf(await vesting.address));
            assert.equal(0, balance);
        });

        it("All token have been recieved", async () => {
            assert.equal(await toNum(token.balanceOf(await vesting.beneficiary())), await toNum(token.TEAM() ) );
        })
    })


    context("Ownership mechanism", async () => {

        before(async () => {
            vesting = await KryllVesting.new({from: owner});
        })

        it('Transfert Ownership ', async () => {
            await vesting.transferOwnership(team_addrss, { from: owner})
            assert.equal(await vesting.owner(), team_addrss);
        })

        it('Should throw when transfering ownership and not owner anymore', async () => {
            return assertRevert(async () => {
                await vesting.transferOwnership(team_addrss, { from: owner})
            });
        })
        
    }) 

}); //contract