pragma solidity ^0.4.17;

contract AgreementFactory {
    address[] public deployedAgreements;

    function createAgreement(string ownerId, address ownerAddress, string name, uint endDate) public returns (address) {
        address newAgreement = new Agreement(ownerId, ownerAddress, name, msg.sender, endDate);
        deployedAgreements.push(newAgreement);
        return newAgreement;
    }

    // view -> no data in the contract is modified
    function getDeployedAgreements() public view returns (address[]) {
        return deployedAgreements;
    }
    
}

contract Agreement {

    // Builder
    struct Owner {
        string ownerId;
        address ownerAccount;
    }

    // Information about the flat
    struct Flat {
        uint roomNo;
        uint blockNo;
        string area;
        string city;
        uint securityDeposit;
        uint rent;
    }

    // Information about the tenant
    struct Tenant {
        string name;
        address tenantAccount;
    }

    Owner public owner;
    Flat public flat;
    Tenant public tenant;
    bool public isSecurityDepositSubmitted;
    uint public startedDate;
    uint public endDate;
    bool public isFinished;
    uint uptoRentSubmitted;

    modifier restrictedForBuilder() {
        require(owner.ownerAccount == msg.sender);
        _;
    }

    modifier restrictedForTenant() {
        require(tenant.tenantAccount == msg.sender);
        _;
    }

    function Agreement (string _ownerId, address _ownerAccount, string _name,address _tenantAccount, uint _endDate) public {
        Owner memory ownerTemp = Owner({
            ownerId: _ownerId,
            ownerAccount: _ownerAccount
        });

        

        Tenant memory tenantTemp = Tenant({
            name: _name,
            tenantAccount: _tenantAccount
        });

        owner = ownerTemp;
        tenant = tenantTemp;
        isSecurityDepositSubmitted = false;
        startedDate = block.timestamp;
        endDate = _endDate;
        isFinished = false;
        uptoRentSubmitted = block.timestamp;
    }

    // Information about the flat
    function addFlatInfo(uint _roomNo, uint _blockNo, string _area, string _city, uint _rent, uint _securityDeposit) public {

        Flat memory flatTemp = Flat({
            roomNo: _roomNo,
            blockNo: _blockNo,
            area: _area,
            city: _city,
            securityDeposit: _securityDeposit,
            rent: _rent
        });

        flat = flatTemp;

    }

    function paySecurityDeposit() public payable restrictedForTenant {
        require(flat.securityDeposit == msg.value);
        isSecurityDepositSubmitted = true;
    }

    function payRent(uint nextMonth) public payable restrictedForTenant {
        require(endDate > nextMonth);
        require(flat.rent == msg.value);
        owner.ownerAccount.transfer(msg.value);
        uptoRentSubmitted = nextMonth;
    }

    // Forceful
    function endAgreement() public payable restrictedForBuilder {
        owner.ownerAccount.transfer(address(this).balance);
        isFinished = true;
    }

    // Peaceful
    function finishAgreement() public payable {
        require(endDate < (block.timestamp * 1000));
        tenant.tenantAccount.transfer(address(this).balance);
        isFinished = true;
    }

    function getStatus() public view returns (uint) {
        return uptoRentSubmitted;
    }

}

