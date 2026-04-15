#!/bin/bash
input=$(cat)
filepath=$(echo "$input" | jq -r '.path // empty')

if [[ -z "$filepath" ]]; then
  exit 0
fi

if [[ "$filepath" == *.ts ]]; then
  npx prettier --write "$filepath" 2>/dev/null
fi

exit 0
