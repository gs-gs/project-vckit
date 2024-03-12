#!/bin/bash
# Install dependencies
sudo su
cd /home/ec2-user/agent_server
pnpm install
pnpm build
