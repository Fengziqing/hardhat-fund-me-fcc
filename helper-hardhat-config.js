const networkConfig = {
    //11155111 is the sepolia chainid
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    //polycon
    137: {
        name: "polygon",
        ethUsdPriceFeed: "0x97d9F9A00dEE0004BE8ca0A8fa374d486567eE2D",
    },
}
const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000
module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
}
