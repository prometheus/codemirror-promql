#!/usr/bin/env bash

# This script only exists because the lib codemirror-grammar is not available on npm. Once it will be the case, this script can be removed
# Don't forget to remove the copy of the file in the circleci config file
# Issue on codemirror-grammar side: https://github.com/foo123/codemirror-grammar/issues/14

CODEMIRROR_VERSION=4.2.1
CODEMIRROR_FILE=./src/codemirror_grammar.js
SRC_DIR=./src

if [ -d "${SRC_DIR}" ]; then
  if [ ! -f "${CODEMIRROR_FILE}" ]; then
    echo "codemirror_grammar js file not found, starting to download version ${CODEMIRROR_VERSION}"
    curl -k https://raw.githubusercontent.com/foo123/codemirror-grammar/${CODEMIRROR_VERSION}/build/codemirror_grammar.js --output ${CODEMIRROR_FILE}
  fi
fi
