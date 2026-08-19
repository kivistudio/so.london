.PHONY: help install dev build preview clean
.DEFAULT_GOAL := help

help: ## List targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-14s\033[0m %s\n",$$1,$$2}'

install: ## Install Node deps via pnpm
	pnpm install

dev: ## Astro dev server on http://localhost:4321/
	pnpm dev

build: ## Build static site into dist/
	pnpm build

preview: ## Serve built dist/ locally
	pnpm preview

clean: ## Remove build output + deps
	rm -rf dist node_modules .astro
