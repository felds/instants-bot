#!/bin/bash
cd /home/ubuntu/bot
npx tsc
/home/ubuntu/.npm-global/bin/pm2 startOrReload ecosystem.config.js --update-env && pm2 save
