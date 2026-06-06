.PHONY: slides preview clean

JEKYLL_BASEURL ?=

slides:
	bundle check || (echo "Run 'bundle install' to install Jekyll dependencies." && exit 1)
	npm run slides
	bundle exec jekyll build --source public --destination _site --baseurl "$(JEKYLL_BASEURL)"

preview:
	npm run preview

clean:
	npm run clean
