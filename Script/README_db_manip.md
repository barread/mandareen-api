PYTHON SCRIPT :
- Install python 3.7 (on windows use the installer and put the var in the env)
- Install wamp (and add to your system the path to mysql : https://etienner.fr/mysql-en-ligne-de-commande-sous-wamp -> part 1 of the link)
- Readme for the migration of the base via sequelize (present in the repository)
- Execute the python script : it will load the data, if you specify a dev as argument one, it will also load the dev data (for your testing)

- For your information, for the absolute path there is a maximum in terms of characters so don't put your repository in a shaddy place :D

- HELP :
- to have the help on the script, use the -h or --help :
	db_manip.py -h
	or
	db_manip.py --help


-------------------------- A DISPLAY OF THE HELP --------------------------------
usage: db_manip.py [-h] [-db DB] [-u USER] [-p PASSWD] [-dev] [-prod]
                     [--all] [--all-dev] [--all-prod] [-base] [-tables]
                     [-sqdb]

This is a script for the project Mandareen. It has for goal to log to a
specified database and do some manipulation on it.

optional arguments:
  -h, --help  show this help message and exit
  -db DB      Set the database name
  -u USER     Set the username
  -p PASSWD   Set the password
  -dev        Load dev data
  -prod       Load prod data
  --all       Drop & Create DB, create tables, create FK & triggers, load dev
              & prod data
  --all-dev   Drop & Create DB, create tables, create FK & triggers, load dev
              data
  --all-prod  Drop & Create DB, create tables, create FK & triggers, load prod
              data
  -base       Drop and Create the database
  -tables     Drop and Create all tables
  -sqdb       Launch the creation of tables via sequelise