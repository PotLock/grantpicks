# GrantPicks Monorepo

Pairwise voting mechanism for Stellar built on Soroban (Stellar & NEAR). Mono repo for front end and smart contracts.

# Resources

- Technical Architecture https://potlock.org/grantpicks-stellar-architecture
- Repo https://github.com/PotLock/grantpicks <- where all the code will be pushed
- Backlog https://potlock.org/grantpicks-stellar-backlog <- task by task break down
- Figma https://potlock.org/grantpicks-figma <- where wireframes and prototypes will be developed

# About Pairwise

The "budget boxing" algorithm, utilizes pairwise preferences to allocate budget percentages among various items or projects. This method starts by collecting votes through pairwise preferences, where voters choose between two options at a time (e.g., "A vs B"). This approach simplifies the voting process, making it more engaging and manageable for voters, as they only need to consider two options at a time. The simplicity of this method also ensures that a large amount of preference data can be efficiently gathered with minimal cognitive load on the voters.

Once the pairwise preferences are collected, they are used to construct a preference graph, essentially a matrix of votes. This matrix is then processed to derive a probability distribution over the items. However, instead of interpreting these probabilities in a conventional sense, they are treated as percentages of the total budget. This means that the algorithm's output directly informs how the budget should be distributed among the items based on the collective preferences of the voters. This method makes the decision-making process transparent and scalable, as it can handle many voters and items efficiently by leveraging mathematical and computational tools.

- App https://pairdrop.daodrops.io/
- Github Repo https://github.com/dOrgTech/PairDrop
- Original Idea https://news.colony.io/ideas/en/budget-box
- https://github.com/JoinColony/budgetBox
- https://uploads-ssl.webflow.com/61840fafb9a4c433c1470856/639b50ee30b729cb016806c1_BudgetingBoxes.pdf
- Mechanism Institute: https://www.mechanism.institute/library/pairwise

![GrantPicks Choose Page](https://github.com/PotLock/grantpicks/assets/45281667/50c21f90-8d91-436c-b96f-cff0b5950f67)

Staging https://staging.grantpicks.com
Testnet https://testnet.grantpicks.com

## Contracts

Stellar Contracts

Testnet (Updated: 5th Nov 2024)
lists contract id: CBPNCCKPTLJZY5OSFAYIYEOAHDG2A4XBKNK5FNJBA6HWRQH6ZLNODQF5
registry contract id: CDOR6NBGSIE6ARJZHRAJAEDN2NG4QS67LSQRMJETVX6GHEJELLVPXWJQ
round & factory contract id: CBMCMOS3KX2R3AFOG3SZFPOFSX2ASMIC3TWF5FTIQTQSLZ6G3RUBQUM5

Near Contracts

Testnet
list contract id: lists.potlock.testnet
near social contract : v1.social08.testnet
round contract id : v2.grantpicks.potlock.testnet