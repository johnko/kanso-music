#!/bin/sh

DBNAME=cloudbox
DBURL=http://localhost:5984/${DBNAME}

APPFOLDER=couchapp

kanso install ${APPFOLDER}

kanso push ${APPFOLDER} ${DBURL}
