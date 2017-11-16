pragma solidity ^0.4.14;
contract Payroll {
    struct Employee {
        address payAddress;
        uint salary;
        uint lastPayDate;
    }
    uint payDuration = 10 seconds;
    mapping(address=>Employee) employees;
    address owner;
    uint totalSalary = 0;
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
    modifier employeeExist(address employeeId){
        var employee = employees[employeeId];
        require(employee.payAddress != 0x0);
        _;
    }
    function Payroll() public {
        owner = msg.sender;
    }
    function addFund() public payable returns(uint) {
        return this.balance;
    }
    function partialPay(Employee employee) private {
        require(employee.payAddress != 0x0);
        uint payment = employee.salary * (now - employee.lastPayDate)/payDuration;
        employee.payAddress.transfer(payment);
    }
    function addEmployee(address employeeId, uint salary) onlyOwner public {
        var employee = employees[employeeId];
        require(employee.payAddress == 0x0);
        uint salaryInWei = salary * 1 ether;
        totalSalary += salaryInWei;
        employees[employeeId] = (Employee(employeeId,salaryInWei,now));
    }
    function updateEmployee(address employeeId, uint salary) onlyOwner employeeExist(employeeId) public {
        var employee = employees[employeeId];
        totalSalary -= employee.salary;
        employee.salary = salary * 1 ether;
        totalSalary += employee.salary;
        employee.lastPayDate = now;
    }
    function removeEmployee(address employeeId) onlyOwner employeeExist(employeeId) public {
        var employee = employees[employeeId];
        partialPay(employee);
        totalSalary -= employee.salary;
        delete employees[employeeId];
    }
    function checkEmployee(address employeeId) employeeExist(employeeId) constant public returns(uint salary, uint lastPayDate) {
        var employee = employees[employeeId];
        salary = employee.salary;
        lastPayDate = employee.lastPayDate;
    }
    function changePaymentAddress(address newAddress) employeeExist(msg.sender) public {
        var employee = employees[newAddress];
        require(employee.payAddress == 0x0);
        employees[newAddress] = Employee(newAddress, employees[msg.sender].salary,employees[msg.sender].lastPayDate);
        delete employees[msg.sender];
        
    }
    function calculateRunway() public constant returns(uint) {
        return this.balance/totalSalary;
    }
    
    function hasEnoughFund() public constant returns(bool) {
        return calculateRunway() > 0;
    }
    
    function getPaid() employeeExist(msg.sender) public {
        var employee = employees[msg.sender];
        uint nextPayDate = employee.lastPayDate + payDuration;
        require(now > nextPayDate);
        employee.lastPayDate = now;
        employee.payAddress.transfer(employee.salary);
    }
}