import enum
import sys
import os
import argparse
import json
import logging
import requests
from pathlib import Path

from sqlalchemy import create_engine, Column, String, Enum, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine.url import URL

# This needs to be defined manually by the user
API_BASE_URL = "https://localhost:1234"
START_SESSION_ROUTE = "/pro/patient/startMandareenSession"
CONFIG_FILE_PATH = str(Path(__file__).parents[1] / "config" / "config.json")

Base = declarative_base()
# These globals are initialized in connect_to_sql()
engine = None
Session = None
session = None

# Setup global logger
logger = logging.getLogger("mandareen")
logger.setLevel(logging.DEBUG)

debug_channel = logging.StreamHandler()
debug_channel.setLevel(logging.DEBUG)

warning_channel = logging.FileHandler(
    str(Path(__file__).parents[1] / "LogsAPI" / "send_recurr_session.log"))
warning_channel.setLevel(logging.WARNING)

formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
debug_channel.setFormatter(formatter)
warning_channel.setFormatter(formatter)
logger.addHandler(debug_channel)
logger.addHandler(warning_channel)


class recurrenceEnum(enum.Enum):
    Quotidien = "Quotidien"
    Hebdomadaire = "Hebdomadaire"
    Mensuel = "Mensuel"


# Recurrent session model
class RecurrentSession(Base):
    __tablename__ = "session_recurr"
    id = Column(String(100), primary_key=True)
    pro_id = Column(String(100))
    patient_id = Column(String(100))
    recurrence = Column(Enum(recurrenceEnum))


# Followup model
class Followup(Base):
    __tablename__ = "followup"
    id = Column(String(100), primary_key=True)
    pro_id = Column(String(100))
    patient_id = Column(String(100))
    is_active = Column(Boolean())


def connect_to_sql(sql_env, cfg_file_path=CONFIG_FILE_PATH):
    # Read data from JSON config file and create appropriate URL
    if not os.path.isfile(cfg_file_path):
        logger.critical("Error: config file {} not found.".format(
            cfg_file_path))
        sys.exit(1)

    with open(cfg_file_path, "r") as f:
        sql_data = json.load(f)

    port = 3306
    sql_data = sql_data[sql_env]
    connect_url = URL(
        "mysql+mysqldb",
        username=sql_data["username"],
        password=sql_data["password"],
        host=sql_data["host"],
        port=port,
        database=sql_data["database"])

    # Initialize global variables used to connect to db
    global engine
    global Session
    global session
    engine = create_engine(connect_url, pool_recycle=3600)
    Session = sessionmaker(bind=engine)
    session = Session()
    Base.metadata.create_all(engine)


def get_sessions_to_send(recurrence):
    return (session.query(RecurrentSession, Followup)
                   .filter_by(recurrence=recurrence)
                   .filter(RecurrentSession.pro_id == Followup.pro_id)
                   .filter(RecurrentSession.patient_id == Followup.patient_id)
                   .filter(Followup.is_active == 1)
                   .all())


def parse_args():
    parser = argparse.ArgumentParser(
        description='Send recurrent Mandareen sessions.')
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--daily', action='store_true',
                       help='Send dailies recurrent sessions.')
    group.add_argument('--weekly', action='store_true',
                       help='Send weeklies recurrent sessions.')
    group.add_argument('--monthly', action='store_true',
                       help='Send monthlies recurrent sessions.')

    sql_env = parser.add_mutually_exclusive_group(required=True)
    sql_env.add_argument('--dev', action='store_true',
                         help='Use dev SQL logs')
    sql_env.add_argument('--prod', action='store_true',
                         help='Use prod SQL logs')
    sql_env.add_argument('--test', action='store_true',
                         help='Use test SQL logs')

    args = parser.parse_args()
    return args


def main():
    args = parse_args()
    recurrence = ("Quotidien" if args.daily
                  else "Hebdomadaire" if args.weekly
                  else "Mensuel" if args.monthly
                  else None)

    sql_env = ("development" if args.dev
               else "production" if args.prod
               else "test" if args.test
               else None)

    connect_to_sql(sql_env)
    sessions = [x[0] for x in get_sessions_to_send(recurrence)]
    if not sessions:
        logger.warning("No sessions to send.")
        sys.exit(0)

    for sess in sessions:
        data = {
            "patient": {
                "id": sess.patient_id
            },
        }
        # Note: there is no SSL verification here
        res = requests.post(API_BASE_URL + START_SESSION_ROUTE,
                            json=data,
                            verify=False)
        if res.status_code not in (200, 403):
            logger.error("{}: {} ".format(res.status_code,
                                          res.reason) +
                         "(patient_id: {})".format(sess.patient_id))


if __name__ == '__main__':
    main()
