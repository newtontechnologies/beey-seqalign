import { Alignment } from './alignment';
import { StringAligner } from './stringaligner';
import { Transcription } from './transcription';
import * as fs from 'fs';

testAddWord();

function testAddWord() {
    const targetFile = 'src/res/test/automatic-tests/numbers.trsx';
    const sourceFile = 'src/res/test/automatic-tests/numbers.txt';

    const target = fs.readFileSync(targetFile, 'utf8');
    const targetTranscription = new Transcription(target, true);
    const source = fs.readFileSync(sourceFile, 'utf8');
    const sourceSequence = StringAligner.string2words(source);
    const cleanedSequence = StringAligner.cleanWords(sourceSequence);
    const stringAligner = new StringAligner([], [], 1, 1, 1.5, 0.9, 4000);
    for (let i = 0; i < targetTranscription.words.length; i += 1) {
        const [ begin, end ] =  targetTranscription.timestamps[i];
        stringAligner.addNewWord(targetTranscription.words[i], begin, end);
    }
    const matchIndices = stringAligner.compareSequence(cleanedSequence, 0, 1000000000);
    const alignedTranscription = stringAligner.applyTimestamps(sourceSequence, matchIndices);
    const alignedTrsx = alignedTranscription.exportTrsx();

    console.log(alignedTrsx);
}



