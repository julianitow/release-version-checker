# Nike Panda Checker

simple script to check if nike panda shoes are available

## How to use

Configuration has to be written in a `.env` (see `.env.example`)

- set the `DIV_ID` variable to the html element of the size picker you're looking for
- set the url to the nike product webpage
- set the stmp conf env to receive email notifications
- `npm run build`
- `npm run start`

## Docker

There is a dockerfile in order to build the image with a crontab (see crontab.txt file) that run the checker every 30mn.
After building the image a docker-compose file is available to run it.
