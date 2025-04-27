#!/bin/bash

# Create list_kartu.txt file
FILE_NAME="list_kartu.txt"
touch "$FILE_NAME"

# Install node modules
sudo npm install

# Create script
SCRIPT_NAME="clear_cache.sh"
FOLDER_TO_DELETE="/tmp/puppeteer*"
FILE_TO_CLEAR_LOG="log-output.txt"
DIR=$(pwd)

cat > "$SCRIPT_NAME" <<EOF
#!/bin/bash

FOLDER="$FOLDER_TO_DELETE"
FILE="$FILE_TO_CLEAR_LOG"

echo "" > "\$FILE"
rm -rf "\$FOLDER"
EOF

chmod +x "$SCRIPT_NAME"

# Create crontab to run main.js
NODE_SCRIPT_PATH="$DIR/main.js"
LOG_FILE_PATH="$DIR/log-output.txt"
CRON_SCHEDULE="* * * * *"
CRON_JOB1="$CRON_SCHEDULE /usr/bin/node $NODE_SCRIPT_PATH >> $LOG_FILE_PATH 2>&1"

# Create crontab to run clear_cache.sh
SCRIPT_PATH="$DIR/clear_cache.sh"
CRON_JOB2="0 1 * * * cd $DIR && ./clear_cache.sh"

# Add the cron job to the crontab
(crontab -l 2>/dev/null | grep -v -F "$NODE_SCRIPT_PATH"; echo "$CRON_JOB1") | crontab -
(crontab -l 2>/dev/null | grep -v -F "$SCRIPT_PATH"; echo "$CRON_JOB2") | crontab -