#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Default services to manage; can pass services as arguments
SERVICES=(hausheld-bot hausheld-api)
if [ "$#" -gt 0 ]; then
	SERVICES=("$@")
fi

if ! command -v systemctl >/dev/null 2>&1; then
	echo "error: systemctl not found" >&2
	exit 2
fi

for svc in "${SERVICES[@]}"; do
	echo "Restarting $svc..."
	sudo systemctl restart "$svc"
	echo "OK: $svc restarted"
done