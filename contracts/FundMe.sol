// SPDX-License-Identifier: MIT
//1. Pragma statements
pragma solidity ^0.8.9;

//2. Import statements
import "./PriceConverter.sol";

//4. Errors (ContractName__errorName)
error FundMe__NotOwner();

//interfaces
//7. Contracts
/** @title a contract for crowd funding
 *  @author haru feng
 *  @notice this contract is to demo a simple funding contract
 *  @dev this implements price feed as out library
 */
contract FundMe {
    //1. Type declarations
    using PriceConverter for uint256;

    //2. State variables
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    address private immutable i_owner;
    AggregatorV3Interface public s_priceFeed;

    //5. Modifiers
    modifier onlyOwner() {
        // require (msg.sender == i_owner,"you are not the owner of this contract");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    //1. constructor
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    //2. receive
    receive() external payable {
        fund();
    }

    //3. fallback
    fallback() external payable {
        fund();
    }

    /**
     * @notice this function fund sthis contract
     * @dev this implements price feed as out library
     */
    function fund() public payable {
        //1e18 = 1 * 10 ** 18
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Do not have enough eth"
        );
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        //transfer
        // payable(msg.sender).transfer(address(this).balance);
        //send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send Failed");
        //call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        //mapings cannot be in memory
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success, "call failed");
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
