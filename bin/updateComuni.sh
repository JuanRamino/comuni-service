#!/bin/sh

cd /app/ && npm run update:comuni && pm2 restart comuni-service
