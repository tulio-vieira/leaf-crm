# Exit on error
set -euo pipefail

TAR_FILE=$1
TMP_DIR="/home/ftp_client/logos-api-packages/tmp"
DEPLOY_DIR="/var/www/logos/frontend"

# create tmp folder
mkdir -p $TMP_DIR

# decompress files
echo "Decompressing file: $TAR_FILE to $TMP_DIR ..."
tar -xf $TAR_FILE -C $TMP_DIR

# delete old files
echo "Deleting everything from $DEPLOY_DIR ..."
rm -rf $DEPLOY_DIR/*

# copy them to www
echo "Copying build files from $TMP_DIR/dist to $DEPLOY_DIR"
mv $TMP_DIR/dist $DEPLOY_DIR

# reload nginx service
echo "Restarting Nginx..."
nginx -s reload

echo "Cleaning up ..."
rm -r $TMP_DIR
rm $TAR_FILE

echo "Done."
