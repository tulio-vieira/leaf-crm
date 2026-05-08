$BASE_DIRECTORY="C:\Users\vieir\Documents\learning\logos\logos-project\devops"
$RELEASE_DIR="C:\Users\vieir\Documents\learning\logos\logos-project\logos-api\bin\Release\net9.0"
$DIR_TO_COMPRESS="publish"
$SOLUTION_PATH="C:\Users\vieir\Documents\learning\logos\logos-project\logos-api\LogosAPI.sln"
$SSH_KEY_PATH="C:\Users\vieir\Documents\learning\contabo\contabo-server-key"
$REMOTE_FILE_PATH="/home/ftp_client/logos-api-packages"
$BUILD_FILENAME="logos-api-$(Get-Date -Format "yy-MM-dd_HH-mm").tgz"
$DEPLOY_SCRIPT_FILENAME="deploy-logos-api.sh"
$SERVER_IP="147.93.7.253"
$SERVER_USERNAME="root"

function CopyFileToServer ($fileToCopy) {
    scp -i $SSH_KEY_PATH -r $fileToCopy "${serverDestination}:$REMOTE_FILE_PATH"
}

Set-Location $BASE_DIRECTORY

$serverDestination="$SERVER_USERNAME@$SERVER_IP"

# build .net
Write-Output "Building LogosAPI..."
dotnet publish $SOLUTION_PATH --configuration "Release"

# go to release dir
Set-Location $RELEASE_DIR

# delete old tgzs
Write-Output "Deleting old compressed files..."
Remove-Item *.tgz

# compress files
Write-Output "Compressing build files..."
tar -czf $BUILD_FILENAME $DIR_TO_COMPRESS

# go back to base dir
Set-Location $BASE_DIRECTORY

# copy compressed file to server
Write-Output "Copying tar file ($RELEASE_DIR\$BUILD_FILENAME) to server..."
CopyFileToServer "$RELEASE_DIR\$BUILD_FILENAME"

# copy deploy script to server
Write-Output "Copying deploy script ($DEPLOY_SCRIPT_FILENAME) to server..."
CopyFileToServer $DEPLOY_SCRIPT_FILENAME

# run deploy script on server
Write-Output "Running deploy script on server..."
ssh -i $SSH_KEY_PATH $serverDestination "bash $REMOTE_FILE_PATH/$DEPLOY_SCRIPT_FILENAME $REMOTE_FILE_PATH/$BUILD_FILENAME"
