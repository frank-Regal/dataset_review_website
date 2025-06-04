# Dataset Review Website

A web interface for multiple users to review and annotate videos from a dataset.

**Features**

- **Multi-user annotation:** Each reviewer's progress is tracked individually
- **Video status tracking:** Videos can be marked as "todo", "verified", or "revisit"
- **Frame range marking:** Users can mark specific frame ranges for review
- **Keyboard shortcuts:** Navigate, play/pause, and mark frames with keyboard shortcuts
- **Database backed:** All annotations are stored in PostgreSQL


https://github.com/user-attachments/assets/5462934d-4f5c-4f94-b2de-8446998972e9


## 1. Install Dependencies
  <details>
  <summary><a href="https://docs.docker.com/engine/install/ubuntu/">Docker</a></summary>
  <br>

  Installation Guide: 🔗 https://docs.docker.com/engine/install/ubuntu/

  </details>
  <details>
  <summary><a href="">Node.js</a> (Optional: Only for non-docker development) </summary>
  <br>

  </details>  
  <details>
  <summary><a href="">PostgreSQL</a> (Optional: Only for non-docker development) </summary>
  <br>

  </details>  

## 2. Setup
### Build Docker Image
```shell
make build
```
### Configure Parameters
1. Make a copy of `config.env.example`
   
   ```shell
   cp config.env.example config.env
   ```
   
2. Edit `config.env`
   - Set `NODE_ENV` to `development` or `production`
   - Set `DATABASE_URL` to your PostgreSQL connection string (e.g., `postgresql://user:password@host:port/dbname`)
   - Set `PORT` for the web interface (default: `3000`)

### Prepare Your Videos

- Place your video files in the directory mapped in `compose.yaml`
   - Change the default directory (`/home/frank_regal/storage/datasets/EgoNRG-Full/data/review/videos`) in `compose.yaml` to your local directory.
- Ensure there is a `_videos.json` file in the directory with your videos that has the following format
  
  ```bash
  {
    "title": "Website Title",
    "videos": [
        "video1.mp4",
        ...
  }
  ```

## 3. Run
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

## 4. Using the Website

- **Access the interface:**  
  Open your browser to `http://localhost:3000`
- **Enter your name:**  
  On the homepage, enter your name and click "Save Name"
- **Review videos:**  
  Click on a video marked as "todo" to start annotating
- **Annotate:**  
  Use the interface to mark video segments for review, verify videos, or skip to the next one

## 5. Scripts

- **Connect to database:**  
- **Delete data:**  
  - All entries: `scripts/delete-all.sh <table>`
  - Single entry: `scripts/delete.sh <table> <id>`
- **Retrieve data:**  
  - All entries: `scripts/get-all.sh <table>`
  - Single entry: `scripts/get-entry.sh <table> <video>`
  - Frame ranges: `scripts/get-entry_frame-range.sh <table> <id>`

## 6. Troubleshooting

- **Web interface error:**  
  If the web interface fails to start in Docker, run `npm install` inside the container and then `npm start`.
- **Database connection:**  
  Ensure `DATABASE_URL` in `config.env` is correct and the database container is running.
- **Video files:**  
  Ensure videos are placed in the correct directory and listed in `_videos.json`.


## License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license. See [LICENSE](LICENSE) for details.

## Acknowledgements

Original code is based on [jsalfity/task_decomposition_website](https://github.com/jsalfity/task_decomposition_website).
