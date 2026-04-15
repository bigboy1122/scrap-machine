#!/bin/bash
input=$(cat)
command=$(echo "$input" | jq -r '.command // empty')

if echo "$command" | grep -qiE '(cat|head|tail|less|more|echo|printf).*\.(env|secret|key|pem|credential)'; then
  echo '{
    "permission": "ask",
    "user_message": "This command may expose secrets or sensitive files. Please review before allowing.",
    "agent_message": "A hook flagged this command as potentially exposing secrets."
  }'
  exit 0
fi

if echo "$command" | grep -qiE 'echo.*\$(SECRET|TOKEN|API_KEY|PASSWORD|PRIVATE_KEY)'; then
  echo '{
    "permission": "ask",
    "user_message": "This command may print secret environment variables. Please review.",
    "agent_message": "A hook flagged this command as potentially leaking environment secrets."
  }'
  exit 0
fi

echo '{"permission": "allow"}'
exit 0
