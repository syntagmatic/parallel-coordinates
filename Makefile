all: d3.parcoords.js

TARGETS= \
	renderQueue.js \
	start.js \
	pc.js \
	events.js \
	autoscale.js \
	dimensions.js \
	render.js \
	styles.js \
	clear.js \
	axis.js \
	interactive.js \
	end.js

d3.parcoords.js: $(addprefix src/, $(TARGETS))
	cat $^ >$@

%.min.js: %.js
	uglifyjs -o $@ $<
	echo >> $@

clean:
	rm -f d3.parcoords.js

.PHONY: clean
