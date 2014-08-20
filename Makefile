test:
	@./node_modules/.bin/mocha \
		--reporter spec \
		--require should \
		--recursive \
		test

.PHONY: test