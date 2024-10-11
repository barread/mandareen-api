## Pré-requis

- NodeJS: (>=8.9.0) - https://nodejs.org/
- Wamp : http://www.wampserver.com/en/download-wampserver-64bits/
- Sequelize:  `npm install -g sequelize sequelize-cli mysql2`
- Nodemon: `npm install -g nodemon`

## Lancer l'API

1. Installer la base de données (cf sections suivantes)
2. `npm install`
3. `npm run start`

## Lancer l'API en production

1. Installer la base de données
2. `npm install`
3. `sudo nohup node app.js`

## Fermer l'API en production (ligne de commande)

- `sudo fuser -k 1234/tcp`

## Ajout d'une nouvelle table / model ou juste faire une migration

/!\ Il est nécessaire de créer les bases de données qui sont utilisées par Mandareen-api !
(database_development_mandareen, database_test_mandareen, database_production_mandareen)

-  `sequelize db:migrate`

ceci va exécuter le SQL de `db.sql` et va mettre en place les bases de données

## Comment charger les fichiers CSV si python ne fonctionne pas

Si wamp est installé :

- Ouvrir un terminal bash (gitbash, cmder, powershell...)
- Se rendre dans le repository de l'API
- Exécuter `sequelize db:migrate` pour initialiser la base (après l'avoir créée dans mysql)
- aller dans le dossier Script et regarder le README.md pour connaitre la suite de la migration des bases
- Done
