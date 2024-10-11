#!/usr/bin/env python 
import os
import sys
import argparse
## recipes need to be loaded before patient_likes (no data in it atm)
tables = ["admin", "cares", "subscription", "patient", "pro", "devices", "fav_recipes", "followup", "objectives", "report_pro", "diary", "subs_pro",  "sessions", "session_moods", "stats", 'global_stats', 'stats_requests', 'obj_meal', 'obj_sport', 'session_recurr', 'recipes', 'patient_likes', 'pro_bill']
## files that will be executed if --all option is asked
files = ["ForeignKey.sql", "Triggers.sql"]

#sequelize_launch_path = path.replace("\CSV_Files", "").replace('\\', '/')
#os.system("cd " + sequelize_launch_path + " && sequelize db:migrate && cd Script")

## Initialize argparse option
def initialize_parser():
	parser = argparse.ArgumentParser(description="This is a script for the project Mandareen. It has for goal to log to a specified database and do some manipulation on it.")
	parser.add_argument('-db', action="store", dest="db", default="mandareen", type=str, help="Set the database name")
	parser.add_argument('-u', action="store", dest="user", default="root", type=str, help="Set the username")
	parser.add_argument('-p', action="store", dest="passwd", default="", type=str, help="Set the password")
	parser.add_argument('-dev', action="store_true", dest="dev", default=False, help="Load dev data")
	parser.add_argument('-prod', action="store_true", dest="prod", default=False, help="Load prod data")
	parser.add_argument('--all', action="store_true", dest="all", default=False, help="Drop & Create DB, create tables, create FK & triggers, load dev & prod data")
	##parser.add_argument('--all-dev', action="store_true", dest="alldev", default=False, help="Drop & Create DB, create tables, create FK & triggers, load dev data")
	parser.add_argument('--all-prod', action="store_true", dest="allprod", default=False, help="Drop & Create DB, create tables, create FK & triggers, load prod data")
	parser.add_argument('-base', action="store_true", dest="base", default=False, help="Drop and Create the database")
	parser.add_argument('-tables', action="store_true", dest="tables", default=False, help="Drop and Create all tables")
	parser.add_argument('-sqdb', action="store_true", dest="sqdb", default=False, help="Launch the creation of tables via sequelise")
	return parser

## Check the return from the user to start the program with the specified arguments
def confirm():
	answer = ""
	while answer not in ['Y', 'N']:
		answer=input("Do you wish to start the script with those arguments [Y/N] ? ")
	return answer

def exec_file(filename, path, result):
	print("LOADING " + filename)
	filepath = path.replace("CSV_Files", "SQL_Files").replace('\\', '/') + "/" + filename
	## WITH PASSWORD
	if (result.passwd != ""):
		os.system("mysql -u " + result.user + " -p" + result.passwd + " < " + filepath) 
	## WITHOUT PASSWORD
	else :
		os.system("mysql -u " + result.user + " < " + filepath)
	print("	LOADING ENDED SUCCESSFULLY")


def exec_file_base(filename, path, result):
	print("	LOADING " + filename)
	filepath = path.replace("CSV_Files", "SQL_Files").replace('\\', '/') + "/" + filename
	## WITH PASSWORD
	if (result.passwd != ""):
		os.system("mysql -u " + result.user + " -p" + result.passwd + " " + result.db + " < " + filepath) 
	## WITHOUT PASSWORD
	else :
		os.system("mysql -u " + result.user + " " + result.db + " < " + filepath)
	print("	LOADING ENDED SUCCESSFULLY")

## Executing SQL FILES
def exec_files(files, path, base):
	for file_to_exec in files: 
		if (base):
			exec_file_base(file_to_exec, path, result)
		else:
			exec_file(file_to_exec, path, result)

## Prepare the requests to load the data for the tables
def fill_new_file(filename, tables, path_to_csv, path_to_sql):
	new_file = open(path_to_sql.replace('\\', '/') +  "/" + filename, "w+")
	to_write = ""
	print("FILL "+ filename + " DATA LOAD FILES")
	for table in tables:
		filepath = path_to_csv.replace('\\', '/') + '/' + table + '.csv'
		query = "LOAD DATA LOCAL INFILE \"" + filepath + "\" INTO TABLE " + table + " CHARACTER SET utf8 COLUMNS TERMINATED BY ';' OPTIONALLY ENCLOSED BY '\"' ESCAPED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES;" 
		to_write = to_write + "\r\n" + query
	## fill then close the file 
	new_file.write(to_write)
	new_file.close()
	## exec file
	exec_file_base(filename, path_to_sql, result)
	## Delete temp file
	#os.remove(path_to_sql.replace('\\', '/') + "/" + filename)

	print("END FILLING")

def base_option():
	filename = "Drop_and_create.sql"
	new_file = open(path_to_sql.replace('\\', '/') +  "/" + filename, "w+")
	to_write = "DROP DATABASE IF EXISTS " + result.db + ";\nCREATE DATABASE " + result.db + " CHARACTER SET utf8 COLLATE utf8_general_ci;"
	new_file.write(to_write)
	new_file.close()
	## exec file
	exec_file(filename, path_to_sql, result)
	## Delete temp file
	os.remove(path_to_sql.replace('\\', '/') + "/" + filename)

def tables_option():
	files = ["Drop_Tables.sql", "Create_Tables.sql", "ForeignKey.sql"]
	exec_files(files, path_to_sql, True)

def check_and_launch():
	if (result.sqdb):
		sequelize_launch_path = path.replace("\CSV_Files", "").replace('\\', '/')
		os.system("cd " + sequelize_launch_path + " && sequelize db:migrate")
		exit(0)

	## BASE OPTION
	if (result.base):
		base_option()

	## TABLES OPTION
	if (result.tables):
		tables_option()

	## PREPARE PROD LOAD DATA INFILE REQUEST	
	if (result.prod):
		prod_file = "Load_prod_data.sql"
		fill_new_file(prod_file, tables, path + '\\PROD', path_to_sql)

	## PREPARE DEV LOAD DATA INFILE REQUEST
	if (result.all):
		dev_file = "Load_dev_data.sql"
		fill_new_file(dev_file, tables, path + '\\DEV', path_to_sql)

	## Triggers creation if Table option is set
	## Can't create triggers before bringing in the datas
	if (result.tables):
		exec_file_base("Triggers.sql", path_to_sql, result)

	if (result.prod):
		exec_file_base("Recipes_Pic.sql", path_to_sql, result)


try:
	## get the absolute path
	path = os.getcwd().replace("Script", "CSV_Files")
	path_to_sql = path.replace("CSV_Files", "SQL_Files")
	## prepare the parser of the argument
	parser = initialize_parser()
	result = parser.parse_args()

	print(result)
	if (confirm() == 'N'):
		exit();

	## CHECK FOR OPTION ALL / ALL-DEV / ALL-PROD
	if (result.all):
		result.base = True
		result.tables = True
		result.prod = True

	if (result.allprod):
		result.base = True
		result.tables = True
		result.prod = True

	check_and_launch()

except argparse.ArgumentError:
	parser.print_help()
	exit(0)