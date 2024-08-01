# Grantpick contracts for stellar

## Overview

The workspace contains 4 main contracts/

### Project registry

Projects that wish to apply for a Grant funding round may be required to be registered on a project Registry.

### Round

A contract that manage funding round.

### Round Factory

A Factory contract that deploys Round contract.

## Getting started

### Install and Test Contract

Go to ../stellar directory and install requirements.

```
npm install
npm run setup
```

To running contract test use the following commands.

```
npm run contract:test
```

### Build Contract

After meet all requirements use `npm run contract:build` , the wasm output should be on ./stellar/target/loam/
