.PHONY: all build clean archive

all: build

build:
	mkdir -p build/archive
	hetu compile src/plugin.ht build/plugin.out

archive:
	mkdir -p build/archive
	cp plugin.json build/plugin.out build/archive/
	cd build/archive && python3 -m zipfile -c ../spotube-youtube-metadata.smplug plugin.json plugin.out
	mv build/spotube-youtube-metadata.smplug ./spotube-youtube-metadata.smplug

clean:
	rm -f *.smplug
	rm -rf build
