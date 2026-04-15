#!/bin/bash
input=$(cat)
filepath=$(echo "$input" | jq -r '.path // empty')

if [[ -z "$filepath" ]]; then
  exit 0
fi

if [[ "$filepath" == *.ts && "$filepath" != *.test.ts ]]; then
  lint_output=$(npx eslint "$filepath" 2>&1)
  lint_exit=$?

  if [[ $lint_exit -ne 0 ]]; then
    echo "{\"additional_context\": \"ESLint found issues in $filepath:\\n$lint_output\"}"
    exit 0
  fi
fi

exit 0
