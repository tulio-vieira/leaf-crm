$DIR_TO_COMPRESS="dist"
$RELEASE_DIR="C:\Users\vieir\Documents\learning\logos\logos-project\logos-frontend"
$BUILD_FILENAME="react-$(Get-Date -Format "yy-MM-dd_HH-mm").tgz"
$DEPLOY_SCRIPT="C:\Users\vieir\Documents\learning\logos\logos-project\devops\deploy-react.sh"
$SSH_KEY_PATH="C:\Users\vieir\Documents\learning\contabo\contabo-server-key"
$REMOTE="root@147.93.7.253"
$REMOTE_FILE_PATH="/home/ftp_client/logos-api-packages"

Set-Location $RELEASE_DIR

# build react app
Write-Output "Building React app..."
npm run build

# delete old tgzs
Write-Output "Deleting old compressed files..."
Remove-Item *.tgz

# compress files
Write-Output "Compressing build files..."
tar -czf $BUILD_FILENAME $DIR_TO_COMPRESS

# copy compressed file to server
$FILE_TO_COPY="$RELEASE_DIR\$BUILD_FILENAME"
Write-Output "Copying tar file ($FILE_TO_COPY) to server..."
scp -r -i $SSH_KEY_PATH "$RELEASE_DIR\$BUILD_FILENAME" "${REMOTE}:$REMOTE_FILE_PATH"

# copy deploy script to server
Write-Output "Copying deploy script to server..."
scp -i $SSH_KEY_PATH $DEPLOY_SCRIPT "${REMOTE}:$REMOTE_FILE_PATH"

# run deploy script on server
Write-Output "Running deploy script on server..."
ssh -i $SSH_KEY_PATH $REMOTE "bash $REMOTE_FILE_PATH/deploy-react.sh $REMOTE_FILE_PATH/$BUILD_FILENAME"
