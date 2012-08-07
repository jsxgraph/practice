
SRC=src/assessor.js src/utils.js src/verifier.js src/value.js
OUT=bin/practice.js
MIN=bin/practice-min.js

YUI=~/Tools/yuicompressor/build/yuicompressor-2.4.2.jar
CAT=cat
MKDIR=mkdir -p
RM=rm


all: minify

minify: $(OUT)
	java -jar $(YUI) --type js $(OUT) > $(MIN)

$(OUT): $(SRC)
	$(MKDIR) bin
	$(CAT) $(SRC) > $(OUT)

clean:
	$(RM) $(OUT)
	$(RM) $(MIN)

.PHONY: all minify clean
