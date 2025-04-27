#!/bin/bash

# Remove file(s)
FILE_NAME="list_kartu.txt"
SCRIPT_NAME="clear_cache.sh"
LOG_NAME="log-output.txt"
rm "$FILE_NAME" "$SCRIPT_NAME" "$LOG_NAME"

# Remove crontab
crontab -l | grep -v "$PWD" | crontab -