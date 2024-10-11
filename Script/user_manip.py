#!/usr/bin/env python 
import os
import sys
import argparse

## Initialize argparse option
def initialize_parser():
	parser = argparse.ArgumentParser(description="[WORKING WITH MYSQL 5.7]\r\nThis is a script for the project Mandareen. It has for goal to create a localhost user with specific rights on a specific database.")
	parser.add_argument('-u', action="store", dest="user", default="root", type=str, help="Admin on MYSQL")
	parser.add_argument('-upwd', action="store", dest="user_passwd", default="", type=str, help="Admin's password")
	parser.add_argument('-db', action="store", dest="db", default="*", type=str, help="Set the database name")
	parser.add_argument('-l', action="store", dest="login", default="test", type=str, help="Set the user login")
	parser.add_argument('-p', action="store", dest="passwd", default="", type=str, help="Set the user password")
	parser.add_argument('-r', action="store", dest="user_rights", default="*", type=str, nargs="+", help="Like : -r SELECT UPDATE INSERT CREATE DELETE")
	return parser;

## Check the return from the user to start the program with the specified arguments
def confirm():
	answer = ""
	while answer not in ['Y', 'N']:
		answer=input("Do you wish to create the user with those arguments [Y/N] ? ")
	return answer

def create_user_account():
	new_file = open("temp.sql", "w+")
	user_cmd = "DROP USER IF EXISTS '" + result.login + "'@'localhost'; CREATE USER '" + result.login + "'@'localhost' IDENTIFIED BY '" + result.passwd + "';" + "GRANT "
	if result.user_rights != "*":
		for right in result.user_rights:
			user_cmd = user_cmd + right + " "
	else :
		user_cmd = user_cmd + "ALL PRIVILEGES "
	user_cmd = user_cmd + "ON " + result.db + ".* TO '" + result.login + "'@'localhost';"
	##print(user_cmd)
	new_file.write(user_cmd)
	new_file.close()
	## WITH PASSWORD
	if (result.passwd != ""):
		os.system("mysql -u " + result.user + " -p" + result.user_passwd + " < temp.sql") 
	## WITHOUT PASSWORD
	else :
		os.system("mysql -u " + result.user + " " + user_cmd + " < temp.sql")
	os.remove("temp.sql")

try:

	## prepare the parser of the argument
	parser = initialize_parser()
	result = parser.parse_args()

	print(result)
	if (confirm() == 'N'):
		exit();

	create_user_account()

except argparse.ArgumentError:
	parser.print_help()
	exit(0)