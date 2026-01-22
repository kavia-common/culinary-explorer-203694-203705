#!/bin/bash
cd /home/kavia/workspace/code-generation/culinary-explorer-203694-203705/food_recipe_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

