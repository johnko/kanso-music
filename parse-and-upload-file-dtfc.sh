#!/bin/sh

# Set the COUCHDBURL environment variable

#export COUCHDBURL=http://localhost:5984/cloudbox
[ "x" == "x${COUCHDBURL}" ] && exit 1

#export DTFCURL=http://localhost:8080/dtfc
[ "x" == "x${DTFCURL}" ] && exit 1

# Expect arg
[ "x" == "x$1" ] && exit 1

# Expect arg to be file
FILE="$1"
[ ! -f "${FILE}" ] && exit 1

echo "${FILE}"

SAFENAME=`echo ${FILE##*/} | tr ' ' '_' | tr -cd '[[:alnum:]]._-' `

ffmetadata() {
    ffmpeg -i "${FILE}" -f ffmetadata -vn -an -loglevel quiet -
    LOOKSLIKE="
title=Let's Stay Together
artist=Al Green
album_artist=Al Green
album=Greatest Hits
genre=R&B/Soul
track=6/10
disc=1/1
"
}

getmeta() {
      ARTIST="`ffmetadata|grep '^artist='       |sed 's/^artist=//'      |tr '"' "'"`"
       TITLE="`ffmetadata|grep '^title='        |sed 's/^title=//'       |tr '"' "'"`"
       ALBUM="`ffmetadata|grep '^album='        |sed 's/^album=//'       |tr '"' "'"`"
ALBUM_ARTIST="`ffmetadata|grep '^album_artist=' |sed 's/^album_artist=//'|tr '"' "'"`"
       GENRE="`ffmetadata|grep '^genre='        |sed 's/^genre=//'       |tr '"' "'"`"
       TRACK="`ffmetadata|grep '^track='        |sed 's/^track=//'       |tr '"' "'"`"
        DISC="`ffmetadata|grep '^disc='         |sed 's/^disc=//'        |tr '"' "'"`"
    [ "x" != "x${ARTIST}" ] &&             ARTIST="\"artist\":      \"${ARTIST}\","
    [ "x" != "x${TITLE}" ] &&               TITLE="\"title\":       \"${TITLE}\","
    [ "x" != "x${ALBUM}" ] &&               ALBUM="\"album\":       \"${ALBUM}\","
    [ "x" != "x${ALBUM_ARTIST}" ] && ALBUM_ARTIST="\"album_artist\":\"${ALBUM_ARTIST}\","
    [ "x" != "x${GENRE}" ] &&               GENRE="\"genre\":       \"${GENRE}\","
    [ "x" != "x${TRACK}" ] &&               TRACK="\"track\":       \"${TRACK}\","
    [ "x" != "x${DISC}" ] &&                 DISC="\"disc\":        \"${DISC}\","
    [ "x" == "x${TITLE}" ] &&               TITLE="\"title\":       \"${SAFENAME}\","
}

# Determine file type
MIME=`file --brief --mime-type "${FILE}"`

# Hash with sha512 to hex
#HEXHASH=`shasum -a 512 "${FILE}" | awk '{print $1}'`
#HEXHASH=`openssl dgst -sha512 -binary "${FILE}" | openssl enc -base64 | openssl enc -d -base64 | od -An -vtx1 | tr -d '\n' | tr -d ' '`
HEXHASH=`openssl dgst -sha512 -hex "${FILE}" | awk '{print $NF}'`

# Hash with sha512 to base64 (smaller for JSON)
BHASH=`openssl dgst -sha512 -binary "${FILE}" | openssl enc -base64 | tr -d '\n'`

# Set the upload type
if echo "${MIME}" | grep "audio/mpeg" >/dev/null ; then
    # mp3
    # We can parse ID3
    TYPE=song
    getmeta
elif echo "${MIME}" | grep "audio/mp4" >/dev/null ; then
    # m4a
    # We can parse, but may have to convert
    TYPE=m4a
    getmeta
elif echo "${MIME}" | grep "audio/x-wav" >/dev/null ; then
    # wav
    # We can parse, but may have to convert
    TYPE=wav
    getmeta
elif echo "${MIME}" | grep "audio/x-flac" >/dev/null ; then
    # flac
    # We can parse, but may have to convert
    TYPE=flac
    getmeta
else
    if echo ${SAFENAME} | tr '[A-Z]' '[a-z]' | grep 'mp3$' ; then
        # probably mp3
        TYPE=song
        getmeta
    else
        echo "Not sure what it is, improper metadata"
        exit 1
    fi
fi

# Check if hash already exists in DTFC
if curl -v -s -k -H 'Connection: close' -X HEAD "${DTFCURL}/${HEXHASH}" 2>&1 | grep '200 OK' ; then
    exit 0
fi

# put first to get doc.rev
REV=`curl -k -X PUT --data-binary @"${FILE}" "${DTFCURL}/${SAFENAME}"`

# Set the JSON doc data
JSON="{\"_id\":\"${BHASH}\",${ARTIST}${TITLE}${ALBUM}${ALBUM_ARTIST}${GENRE}${TRACK}${DISC}\"type\":\"${TYPE}\",\"content_type\":\"${MIME}\",\"dtfc\":{\"${SAFENAME}\":${REV}}}"

# not upload file data
if [ "x" == "x${REV}" ]; then
    echo "Something went wrong"
else
    curl -k -s -H 'Content-type: application/json' -X PUT -d "${JSON}" ${COUCHDBURL}/${HEXHASH} | tr -d '\n' | egrep -o '"rev":"(.*)"' | awk -F'"' '{print $4}'
fi
