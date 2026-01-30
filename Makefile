install:
	docker compose run --rm app npm i

dev:
	docker compose up app

e2e:
	docker compose up