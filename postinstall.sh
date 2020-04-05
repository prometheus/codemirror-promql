#!/usr/bin/env bash

CODEMIRROR_VERSION=4.2.1
CODEMIRROR_FILE=./src/codemirror_grammar.js

if [ ! -f "${CODEMIRROR_FILE}" ]; then
  echo "codemirror_grammar js file not found, starting to download version ${CODEMIRROR_VERSION}"
  curl https://raw.githubusercontent.com/foo123/codemirror-grammar/${CODEMIRROR_VERSION}/build/codemirror_grammar.js --output ${CODEMIRROR_FILE}
fi
