import { Alignment } from './alignment';
import { StringAligner } from './stringaligner';
import { Transcription } from './transcription';
import * as fs from 'fs';

if (process.argv.length !== 5) {
  console.log('usage: node ' + process.argv[1] + ' source target output');
  console.log('target is a trsx file, source is a trsx or txt file. Output is a trsx file that will be created');
  process.exit();
}

const sourceFile = process.argv[2];
const targetFile = process.argv[3];
const outputFile = process.argv[4];

function readFile(filename: string): string {
    const data = fs.readFileSync(filename, 'utf8');
    return data;
}

const target = readFile(targetFile);
const targetTranscription = new Transcription(target, true);
const targetSequence = targetTranscription.words.map(x => StringAligner.cleanWord(x)); // .slice(0, 50);


// let sourceSequence = stringAligner.string2words(source).slice(0, 50);

let source = null;
if (sourceFile.endsWith('.txt')) {
    source = readFile(sourceFile);
} else if (sourceFile.endsWith('.trsx')) {
    const sourceTrsx = readFile(sourceFile);
    const sourceTranscription = new Transcription(sourceTrsx);
    source = sourceTranscription.getText();
} else {
    console.error('provide txt or trsx source');
    process.exit();
}

const stringAligner = new StringAligner(targetSequence, targetTranscription.timestamps, 1, 1, 1.5, 0.9, 4000);
let sourceSequence: string[];
sourceSequence = StringAligner.string2words(source);
const cleanedSequence = StringAligner.cleanWords(sourceSequence);



const rawMatchIndices = stringAligner.compareSequence(['\n', ...cleanedSequence, '\n'], 0, 1000000000);
const matchIndices = rawMatchIndices.slice(1, rawMatchIndices.length - 1);
const alignedTranscription = stringAligner.applyTimestamps(sourceSequence, matchIndices);
const alignedTrsx = alignedTranscription.exportTrsx();

fs.writeFile(outputFile, alignedTrsx, function (err) {
    if (err) {
        console.log(err);
    }
});
