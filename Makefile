help:
	@echo ""
	@echo "About:"
	@echo "This Makefile is a utility script for managing this Dockerized application efficiently."
	@echo "Unrelated to GCC or code compilation, it acts similarly to a Bash script by automating"
	@echo "repetitive tasks using shell commands, but leverages the structure and simplicity of make."
	@echo "It provides clear commands for common Docker tasks like building the image, starting and "
	@echo "stopping a container, logging, and accessing a shell inside the container."
	@echo ""

	@echo "Usage:"
	@echo "make start            - start the container"
	@echo "make start-verbose    - start the container with verbose output"
	@echo "make stop             - stop the container"
	@echo "make shell            - open a shell in the container"
	@echo "make build            - build the container image"
	@echo "make log              - show the container logs"
	@echo ""


start:
	@xhost +local:docker; \
	docker compose up -d

start-verbose:
	@xhost +local:docker; \
	docker compose up
	
stop:
	@docker compose down

shell:
	@docker exec -ti -u $$(whoami) -w /root/dataset_review_website dataset-review-website bash -l

shell-db:
	@docker exec -it website-db psql -U frank-Regal -d website-db

build:
	@COMPOSE_BAKE=true docker compose build

log:
	@docker logs dataset-review-website