.PHONY: all build clean archive

all: build

build:
	mkdir -p build
	hetu compile src/plugin.ht build/plugin.out

archive:
	mkdir -p build/archive
	cp plugin.json build/plugin.out build/archive/
	cd build/archive && zip -r ../spotube-youtube-metadata.smplug .
	mv build/spotube-youtube-metadata.smplug ./spotube-youtube-metadata.smplug

clean:
	rm -f *.smplug
	rm -rf build
