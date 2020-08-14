#!/bin/bash
cd /home/ubuntu/bot
pm2 stop ecosystem.config.js --silent
npm install
