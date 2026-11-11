install:
	docker compose run --rm app npm i

app:
	docker compose up app

down:
	docker compose down --remove-orphans --volumes

storybook:
	docker compose up storybook

e2e-video:
	docker compose run --rm playwright sh -c "npx playwright test -c playwright-video.config.ts game-at-work.spec.ts game-at-work-dual-screen.spec.ts"

e2e-screenshots:
	docker compose run --rm playwright sh -c "npx playwright test -c playwright-video.config.ts screenshots.spec.ts screenshots-multiplayer.spec.ts --update-snapshots"

# Confronta le schermate con quelle salvate, senza aggiornarle: fallisce se l'interfaccia è cambiata
e2e-screenshots-check:
	docker compose run --rm playwright sh -c "npx playwright test -c playwright-video.config.ts screenshots.spec.ts screenshots-multiplayer.spec.ts"

copy-video:
	bash scripts/copy-videos.sh
	docker compose run --rm playwright node scripts/extract-video-posters.mjs

copy-screenshots:
	bash scripts/copy-screenshots.sh $(TESI)
