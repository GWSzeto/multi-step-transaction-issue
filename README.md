## Steps to reproduce the issue
```
bun i # install dependencies

# fetch an OP sepolia rpc url from somewhere (ie: thirdweb, alchemy, quicknode, etc)

# line 105 in App.tsx - increemnt the number for the salt

npm run dev # start the development server

# click on "Simulate Step Transactions"
```

## Expected behavior
1. First transaction proxy deploys the contract
2. Waits for the first transaction to be finished (this is achieved through `waitForTransactionReceipt`)
3. Second transaction writes to the deployed proxy contract
4. Done

## Actual behavior
1. First transaction proxy deploys the contract
2. Second transaction attmempts to write to the deployed proxy contract before the first transaction is finished (ie: it doesn't wait for the contract to be deployed properly)

