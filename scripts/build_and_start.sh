#!/bin/bash
cd /home/ubuntu/bot
npx tsc
pm2 startOrReload ecosystem.config.js --update-env && pm2 save
