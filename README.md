# Climb_Api

## Configure the server
### Configure the credentials on the machine for the IAM user:
using the credential
create a file ~/.aws/credentials
```ini
[default]

aws_access_key_id = // put your IAM user key id here

aws_secret_access_key = // put your IAM user access key here
```
### Install dependencies
```
#install node
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
#install pm2
sudo npm install -g pm2
#install mongodb and launch
sudo apt-get install mongodb
```
### Launche server
git clone
#start mongod as a service if it's not already
sudo service mongod start
#launch the server
pm2 start server.js --name "api"

#to restart
#pm2 restart api

## Configure amazon S3 (if not done already)
### Prepare the S3 server
add this to your bucket policy permission to allow people the object uploaded to be public

```json
{
    "Version": "2008-10-17",
    "Statement": [
        {
            "Sid": "AllowPublicRead",
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::bucketclimb/*"
        }
    ]
}
```
### Prepare an amazon user
create IAM to aws with write/read access to object for the S3 server server
create access keys for your user
