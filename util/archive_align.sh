#!/bin/bash
ARCHIVE=$1

align () {
    DIRECTORY=`dirname $1`
    BASENAME=`basename $1`
    CODE=`basename $DIRECTORY`
    #echo $DIRECTORY
    #echo $CODE
    CORRECTED=`ls $DIRECTORY/| grep -e '^........_...._....\.trsx' `
    CORRECTED=$DIRECTORY/$CORRECTED
    echo `ls $CORRECTED`
    ORIGINAL=$DIRECTORY/out_$CODE.trsx
    echo `ls $ORIGINAL`
    echo $CORRECTED 1>&2
    echo $ORIGINAL 1>&2
    node ../devdist/align_files.bundle.js $CORRECTED $ORIGINAL 2>&1 || echo failed. directory: $DIRECTORY
}

PATHS=`find $ARCHIVE -iname 'out_*\.trsx' | head`

# magic from https://unix.stackexchange.com/questions/50692/executing-user-defined-function-in-a-find-exec-call
while read -d '' filename; do
      align "${filename}" </dev/null
done < <(find $ARCHIVE -iname 'out_*\.trsx' -print0)

