Seqalign
--------

library for efficient dtw sequence alignment, including interface
for full and partial trsx word-level alignment.

### Align transcription in file

Install node interpreter from https://nodejs.org

This repositary contains prebuilt scripts, so no building is needed to use them.

To align a txt file human.txt corresponding to automatic transcription asr.trsx
and store the produced trsx containing the transcription from txt enriched with
timestamps deduced from the ASR to aligned.trsx:

```
node --max-old-space-size=4000 dist/align_files.bundle.js human.txt asr.trsx aligned.trsx
```

### run unit tests (not working):
npm run test

### Start developing and serve the server for testing:
npm start

### Build:
npm run build

### Release:
(replace the tag number as appropriate)
```
git checkout master
npm run build.prod
git add dist
git commit
git tag 0.0.0
git push --tags
```
