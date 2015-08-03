test:
	@./node_modules/.bin/mocha \
		--reporter spec \
		--require should \
		--recursive \
		test

coverage:
	@node_modules/.bin/istanbul cover \
		node_modules/.bin/_mocha -- \
		$(MOCHA_OPTS)

test-travis:
	@node_modules/.bin/istanbul cover \
		node_modules/.bin/_mocha \
		--report lcovonly -- \
		$(MOCHA_OPTS)

.PHONY: coverage test test-travis