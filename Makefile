.PHONY: slides preview slides-preview clean

JEKYLL_BASEURL ?=

slides:
	bundle check || (echo "Run 'bundle install' to install Jekyll dependencies." && exit 1)
	npm run slides
	bundle exec jekyll build --source public --destination _site --baseurl "$(JEKYLL_BASEURL)"

preview: slides
	bundle exec jekyll serve --source public --destination _site --baseurl "$(JEKYLL_BASEURL)"

slides-preview:
	npm run slides-preview

clean:
	npm run clean
