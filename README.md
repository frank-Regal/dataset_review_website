# task_decomposition_website
This repository creates a simple web interface to perform data annotation on videos.
User input is recorded and stored as a JSON file, categorized by username and video filename.

## Local Setup
### npm Installation
#### On MacOS
`brew install node`

`npm install`

### Running the server
`npm start` then navigate to `http://localhost:3000/` to view the website.

## Docker Setup
### build docker image
`make build`

### run the server
> Note this starts everything (website server, database, and restful api)

`make start`

`make shell`

`npm start`

## Usage
Navigate to the website and input a username and video filename. The video will be displayed and the user can input data annotations in the text box. Pressing the submit button will save the data to a JSON file.
