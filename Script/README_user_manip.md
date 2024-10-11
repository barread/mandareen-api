PYTHON SCRIPT :
- Install python 3.7 (on windows use the installer and put the var in the env)
- Install wamp (and add to your system the path to mysql : https://etienner.fr/mysql-en-ligne-de-commande-sous-wamp -> part 1 of the link)
- Readme for the creation of user on specific database 

- For your information, for the absolute path there is a maximum in terms of characters so don't put your repository in a shaddy place :D

- HELP :
- to have the help on the script, use the -h or --help :
	user_manip.py -h
	or
	user_manip.py --help


-------------------------- A DISPLAY OF THE HELP --------------------------------
usage: user_manip.py [-h] [-u USER] [-upwd USER_PASSWD] [-db DB] [-l LOGIN]
                     [-p PASSWD] [-r USER_RIGHTS [USER_RIGHTS ...]]

[WORKING WITH MYSQL 5.7] This is a script for the project Mandareen. It has
for goal to create a localhost user with specific rights on a specific
database.

optional arguments:
  -h, --help            show this help message and exit
  -u USER               Admin on MYSQL
  -upwd USER_PASSWD     Admin's password
  -db DB                Set the database name
  -l LOGIN              Set the user login
  -p PASSWD             Set the user password
  -r USER_RIGHTS [USER_RIGHTS ...]
                        Like : -r SELECT UPDATE INSERT CREATE DELETE

Here is the exact list of rights you can grant to a user :
  - SELECT
  - UPDATE
  - INSERT
  - CREATE
  - DELETE
  - DROP
If you want to grant them all, just don't use the option, by default it will grant all right to the user on the asked db