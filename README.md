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
   - `DATABASE_URL` - `postgresql://<username>:<password>@<host_url>:5432/<database_name>`
   - `PORT` - port to run the web interface on
   - `MAX_ANNOTATIONS_PER_VIDEO` - how many annotations you require per video

## Run
> Note this starts everything (website server, database, and restful api)

```shell
make start
```

```shell
make shell
```

```shell
npm start
```
