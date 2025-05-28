# Dataset Review Website

This repo creates a basic web interface for multiple users to review multiple videos from a dataset.


> This repo is based on [jsalfity/task_decomposition_website](https://github.com/jsalfity/task_decomposition_website) and heavily modified for the specific use cases here


## Setup
### Build Docker Image
```shell
make build
```
### Configure Parameters
1. Make a copy of `config.env.example`
   
   ```shell
   cp config.env.example config.env
   ```
   
3. Configure the following with your specific parameters
   - `NODE_ENV` - "development" or "production"
   - `DATABASE_URL` - `postgresql://<username>:<password>@<host_url>:<database_port>/<database_name>`
   - `PORT` - port to run the web interface on
   - `MAX_ANNOTATIONS_PER_VIDEO` - how many annotations you require per video

## Run
> Note this starts everything (website server, database, and restful api)

1. Start the containers

   ```shell
   make start
   ```

2. Open a develoment shell
      
   ```shell
   make shell
   ```

3. Start the front end website
   > Note: There is a known bug with the docker setup. If the web interface throws an error here, you may need to run `npm install` first and then run the following command.
   ```shell
   npm start
   ```

## Inferface
1. Open the following link in your browser

   ```shell
   http://localhost:3000
   ```
