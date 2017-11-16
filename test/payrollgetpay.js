var Payroll = artifacts.require("./Payroll.sol");

contract('Payroll', function (accounts) {
  let ownerAccount = accounts[0];
  let employee1Account = accounts[1];
  let payroll;
  let prevBalance;
  before("init contract", function () {
    return Payroll.deployed().then((instance) => {
      payroll = instance;
      return payroll.addEmployee(employee1Account, 1, {
        from: ownerAccount
      });
    }).then(function () {
      return payroll.addFund({
        value: web3.toWei(3, 'ether')
      });
    })
  });

  it("should not get paid before end of payment period", function () {
    return payroll.getPaid({
        from: employee1Account
      }).then(function () {
        assert.fail('method should fail')
      })
      .catch(function (error) {
        assert.include(
          error.message,
          'revert',
          'should not allow to get pay before end of payment period'
        )
      })
  });

  it("should get paid", function () {
    prevBalance = web3.eth.getBalance(payroll.address).toNumber();
    //manually increase block time by 11 seconds
    web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [11],
      id: 0
    });
    web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_mine",
      params: [],
      id: 0
    });
    return payroll.getPaid({
      from: employee1Account
    }).then(function () {
      let expected = prevBalance - web3.toWei(1, 'ether') * 1;
      assert.equal(web3.eth.getBalance(payroll.address).toNumber(), expected, 'get 1 ether salary');
    })

  });
});