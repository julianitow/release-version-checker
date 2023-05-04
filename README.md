# Html Parser Checker

simple script to check if an html element exists and/or is not disabled.

## How to use

Configuration has to be written in a `.env` (see `.env.example`)

- set the `DIV_ID` variable to the id of html element
- set the url to the product webpage
- set the stmp conf env to receive email notifications
- `npm run build`
- `npm run start`

See .env file for the complete configuration.

## Docker

Set the env varibale DOCKER to true to work with crontab.
There is a dockerfile in order to build the image with a crontab (see crontab.txt file) that run the checker every 30mn.
After building the image a docker-compose file is available to run it.
