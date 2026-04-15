#!/bin/bash
input=$(cat)
filepath=$(echo "$input" | jq -r '.path // empty')

if [[ -z "$filepath" ]]; then
  exit 0
fi

if [[ "$filepath" == src/*.ts && "$filepath" != *.test.ts && "$filepath" != src/main.ts ]]; then
  test_file="${filepath%.ts}.test.ts"

  if [[ ! -f "$test_file" ]]; then
    echo "{\"additional_context\": \"No colocated test file found for $filepath. Consider creating $test_file to maintain 80% coverage.\"}"
    exit 0
  fi
fi

exit 0
