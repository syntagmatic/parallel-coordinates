all: d3.parcoords.js

TARGETS = start.js draw.js renderQueue.js end.js

d3.parcoords.js: $(addprefix src/, $(TARGETS))
	cat $^ >$@

%.min.js: %.js
	uglifyjs -o $@ $<
	echo >> $@

clean:
	rm -f d3.parcoords.js

.PHONY: clean
