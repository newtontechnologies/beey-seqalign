import { Alignment } from './alignment';
import { StringAligner } from './stringaligner';
import { Transcription } from './transcription';
import * as fs from 'fs';

const target_file = '/mnt/c/Users/Martin.Spanel/ed_pra/seqalign/target.trsx';
const source_file = '/mnt/c/Users/Martin.Spanel/ed_pra/seqalign/source.txt';

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
    source = sourceTranscription.text;
} else {
    console.error('provide txt or trsx source');
}

const stringAligner = new StringAligner(targetSequence, targetTranscription.timestamps, 1, 1, 1, 0.9);
let sourceSequence: string[];
sourceSequence = StringAligner.string2words(source);
const matchIndices = stringAligner.compareSequence(sourceSequence, 0, 1000000000);
console.log(matchIndices);