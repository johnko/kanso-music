#!/bin/sh

# Set the COUCHDBURL environment variable

#export COUCHDBURL=http://localhost:5984/cloudbox
[ "x" == "x${COUCHDBURL}" ] && exit 1

# Expect arg
[ "x" == "x$1" ] && exit 1

# Expect arg to be folder
FOLDER="$1"
[ ! -d "${FOLDER}" ] && exit 1

echo "${FOLDER}"

# Now call parse-and-upload-file for every file
find "${FOLDER}" -maxdepth 3 -type f \
| while read line ; do
    sh parse-and-upload-file.sh "$line"
done
