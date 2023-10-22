#!/bin/bash

set -e

BASE_DIR=$(cd "$(dirname $0)"/../.. && pwd)

cd "${BASE_DIR}/sonar" || exit

set -a
source .env
set +a

QUALITY_PROFILE_FILE=conf/niji-typescript-quality-profile.xml

echo "Import quality profile…"
curl -s -u "admin:${SONAR_PASSWORD}" -F "backup=@${QUALITY_PROFILE_FILE}" "${SONAR_HOST_URL}/api/qualityprofiles/restore" > /dev/null
echo "Ok."
