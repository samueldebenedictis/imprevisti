install:
	docker compose run --rm app npm i

app:
	docker compose up app

e2e-video:
	docker compose run --rm playwright sh -c "npx playwright test -c playwright-video.config.ts"