var Payroll = artifacts.require("./Payroll.sol");

contract('Payroll', function (accounts) {
  let ownerAccount = accounts[0];
  let employee1Account = accounts[1];
  let employee2Account = accounts[2];
  let payroll;
  it("others should not add employee", function() {
    return Payroll.deployed().then((instance) => {
        payroll = instance;
        return payroll.addEmployee(employee1Account, 1, {
          from: employee1Account
        });
      }).then(() => {
        assert.fail('should not allow to add employee')
      })
      .catch((error) => {
        assert.include(
          error.message,
          'revert',
          'should not allow to add employee'
        )
      })
  });

  it("owner should add employee", function() {
    return payroll.addEmployee(employee1Account, 1, {
      from: ownerAccount
    }).then(() => {
      return payroll.checkEmployee(employee1Account);
    }).then((employeeData) => {
      assert.equal(employeeData[0],web3.toWei(1,'ether') , "employee was added successful");
    })
  });

  it("owner should not add existing employee", function() {
    return payroll.addEmployee(employee1Account, 1, {
        from: ownerAccount
      }).then(() => {
        assert.fail('should not allow to add existing employee')
      })
      .catch((error) => {
        assert.include(
          error.message,
          'revert',
          'should not allow to add existing employee'
        )
      })
  });

  it("others should not remove employee", function() {
    return payroll.removeEmployee(employee1Account, {
        from: employee2Account
      }).then(() => {
        assert.fail('should not allow to delete employee')
      })
      .catch((error) => {
        assert.include(
          error.message,
          'revert',
          'should not allow to delete employee'
        )
      })
  });

  it("should not remove non existing employee", function() {
    return payroll.removeEmployee(employee2Account, {
        from: ownerAccount
      }).then(() => {
        assert.fail('should not allow to delete no existing employee')
      })
      .catch((error) => {
        assert.include(
          error.message,
          'revert',
          'should not allow to delete no existing employee'
        )
      })
  });

  it("owner should remove employee", function() {
    return payroll.removeEmployee(employee1Account, {
        from: ownerAccount
      }).then(() => {
        return payroll.checkEmployee(employee1Account)
      }).then(() => {
        assert.fail('employee should be deleted already')
      })
      .catch((error) => {
        assert.include(
          error.message,
          'revert',
          'employee should be deleted'
        )
      })
  });
});