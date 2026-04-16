install:
	docker compose run --rm app npm i

app:
	docker compose up app

e2e-video:
	docker compose run --rm playwright sh -c "npx playwright test -c playwright-video.config.ts game-at-work.spec.ts --update-snapshots"

e2e-screenshots:
	docker compose run --rm playwright sh -c "npx playwright test -c playwright-video.config.ts screenshots.spec.ts --update-snapshots"

copy-video:
	bash scripts/copy-videos.sh

copy-screenshots:
	bash scripts/copy-screenshots.sh