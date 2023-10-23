# Hardhat Project

Pour lancer la blockchain Hardhat local :
```shell
npx hardhat node
```

Puis dans un autre terminal, pour compiler et lancer le le smart contract sur cette même blockchain :

```shell
npx hardhat --network localhost run scripts/deploy.js
```

Conserver l'adresse du contrat, elle va servir pour le lier a l'application web.


Pour les test : 

```shell
npx hardhat test
```

Pour plus d'information :

```shell
npx hardhat help
REPORT_GAS=true npx hardhat test
```

https://hardhat.org/docs