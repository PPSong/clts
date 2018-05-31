#!/bin/sh

PROJ_NAME=SPRT

ENV=test

GIT_BRANCH=test

NAME=service

GIT_ROOT=/home/git/${PROJ_NAME}/${NAME}

WWW_ROOT=/home/wwwroot/${PROJ_NAME}/${NAME}

cd ${GIT_ROOT}

git checkout ${GIT_BRANCH}
git fetch --all  
git reset --hard origin/${GIT_BRANCH} 
git pull

cd /home/wwwroot/
mkdir ${PROJ_NAME}

cd /home/wwwroot/${PROJ_NAME}
mkdir ${NAME}

cd ${WWW_ROOT}
mkdir logs

cp -R ${GIT_ROOT} ${WWW_ROOT}
rm -rf ${WWW_ROOT}/src
mv ${NAME} src
cd ${WWW_ROOT}/src

yarn

mv ${WWW_ROOT}/src/bin/www ${WWW_ROOT}/src/bin/www.js

npx babel ${WWW_ROOT}/src --out-dir ${WWW_ROOT}/dist --ignore ${WWW_ROOT}/src/node_modules --copy-files ${WWW_ROOT}/src/package.json

cd ${WWW_ROOT}/dist

yarn install --production=true

