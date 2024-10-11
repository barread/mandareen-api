`send_recurrent_sessions.py` is a Python3 script intended to be used in a crontab. Its purpose is to select all recurrent sessions corresponding to the recurrency criteria passed as parameter, and to send a session to the patient concerned.

To use it, run it in the root directory of `mandareen-api` instead of the script directory.

Use the following command to install the required packages : `pip3 install requirements.txt`. You may want to create a Python virtualenv before using this command.

Before launching the script, you may want to change the global variables defined at the beginning of the script :
- `API_BASE_URL` is used as the base URL when querying the API
- `START_SESSION_ROUTE` is the route used to start a Mandareen session, it is appended to `API_BASE_URL` when needed
- `CONFIG_FILE_PATH` is the path to the configuration file with the SQL informations.

Other variables outside of those 3 aren't mean to be modified by the user.

You have to provide at least two mandatory arguments :
- One of "--daily", "--weekly" or "--monthly". This is to define the recurrency of the session you want to send.
- One of "--dev", "--prod" or "--test". This is to define the environment on which you want to launch the script, and thus the SQL database to use.

The script will then query the table in the database `session_recurr`. With this data, it will then query the API route to send a Mandareen session.

Everything is logged in a logfile in `LogsAPI/send_recurr_session.log`.
