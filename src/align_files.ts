import { Alignment } from './alignment';
import { StringAligner } from './stringaligner';
import { Transcription } from './transcription';
import * as fs from 'fs';

if (process.argv.length !== 4) {
  console.log('usage: node ' + process.argv[1] + ' source target');
  console.log('target is a trsx file, source is a trsx or txt file');
  process.exit();
}

const source_file = process.argv[2];
const target_file = process.argv[3];

function readFile(filename: string): string {
    console.log(filename);
    const data = fs.readFileSync(filename, 'utf8');
    return data;
}

const target = readFile(target_file);
const targetTranscription = new Transcription(target);
const targetSequence = targetTranscription.words; // .slice(0, 50);
// let sourceSequence = stringAligner.string2words(source).slice(0, 50);

let source = null;
if (source_file.endsWith('.txt')) {
    source = readFile(source_file);
} else if (source_file.endsWith('.trsx')) {
    const sourceTrsx = readFile(source_file);
    const sourceTranscription = new Transcription(sourceTrsx);
    source = sourceTranscription.getText();
} else {
    console.error('provide txt or trsx source');
    process.exit();
}

const stringAligner = new StringAligner(targetSequence, targetTranscription.timestamps, 1, 1, 1, 0.9);
let sourceSequence: string[];
sourceSequence = StringAligner.string2words(source);
const matchIndices = stringAligner.compareSequence(sourceSequence, 0, 1000000000);
const alignedTranscription = stringAligner.applyTimestamps(sourceSequence, matchIndices);
console.log(alignedTranscription.exportTrsx());