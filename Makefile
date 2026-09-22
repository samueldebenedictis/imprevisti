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

copy-video:
	bash scripts/copy-videos.sh
	docker compose run --rm playwright node scripts/extract-video-posters.mjs

copy-screenshots:
	bash scripts/copy-screenshots.sh

tesi:
	cd elaborato && latexmk -pdf -interaction=nonstopmode -halt-on-error tesi.tex
	cd elaborato && latexmk -c tesi.tex

face-morph-setup:
	python3 -m venv .venv-morph
	.venv-morph/bin/pip install --upgrade pip -q
	.venv-morph/bin/pip install opencv-contrib-python numpy imageio scipy mediapipe -q
	mkdir -p scripts/models
	curl -sL -o scripts/models/face_landmarker.task \
		"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"

face-morph:
	.venv-morph/bin/python3 scripts/face_morph.py