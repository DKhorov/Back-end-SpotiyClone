build:
	docker build -t spotifyclone-backend .
make:
	docker run --name scb -p 4000:4000 spotifyclone-backend