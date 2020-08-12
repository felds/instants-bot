#!/bin/bash
cd /home/ubuntu/bot
/home/ubuntu/.npm-global/bin/pm2 stop ecosystem.config.js --silent
npm install
