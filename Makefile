
SRC=src/assessor.js src/utils.js src/verifier.js src/value.js src/practice.js
OUT=bin/practice.js
MIN=bin/practice-min.js

UGLIFY=./node_modules/.bin/uglifyjs
CAT=cat
MKDIR=mkdir -p
RM=rm


all: minify

minify: $(OUT)
	$(UGLIFY) $(OUT) -m --screw-ie8 -o $(MIN)

$(OUT): $(SRC)
	$(MKDIR) bin
	$(CAT) $(SRC) > $(OUT)

clean:
	$(RM) $(OUT)
	$(RM) $(MIN)

.PHONY: all minify clean
