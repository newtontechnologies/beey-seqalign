import { Alignment } from './alignment';
import { Visualization } from './visualization';
import { Transcription } from './transcription';

const VERBOSITY = 0;

function error(message: string) {
    if (VERBOSITY < 1) return;
    console.log(message);
}
function warning(message: string) {
    if (VERBOSITY < 1) return;
    console.log(message);
}
function info(message: string) {
    if (VERBOSITY < 2) return;
    console.log(message);
}

export class StringAligner {
    targetSequence: string[];
    targetTimestamps: number[][];
    aligner: Alignment;
    deletionPenalty: number;
    insertionPenalty: number;
    substitutionPenalty: number;
    insertBetweenParagraphsPenalty: number;
    constructor(targetSequence: string[], targetTimestamps: number[][], insertionPenalty: number,
                deletionPenalty: number, substitutionPenalty: number, insertBetweenParagraphsPenalty: number,
                chunkSize: number) {
        const lowerCase = targetSequence.map(x => x.toLowerCase().trim());
        this.targetSequence = lowerCase;
        if (chunkSize === undefined) chunkSize = 1000;
        this.aligner = new Alignment(this.targetSequence,
                                     this.prefixDistance,
                                     this.wordInsertionPenalty,
                                     this.wordDeletionPenalty,
                                     chunkSize);
        this.targetTimestamps = targetTimestamps;
        this.deletionPenalty = deletionPenalty;
        this.substitutionPenalty = substitutionPenalty;
        this.insertionPenalty = insertionPenalty;
        this.insertBetweenParagraphsPenalty = insertBetweenParagraphsPenalty;
    }

    static string2array(str: string) {
        return str.split(/(?=[\s\S])/u); // converts string to an array of utf-8 characters.
    }

    static string2words(str: string) {
        const changedStr = str.replace(/\n/g, '\n ');
        const words = changedStr.split(/[ ]/u);
        return words;
    }

    static cleanWords(words: string[]) {
        return words.map(x => StringAligner.cleanWord(x));
    }

    distortWords(sequence: string[], errorRate: number) {
        let distorted: string[];
        distorted = [];
        for (var i = 0; i < sequence.length; i++) {
            if (Math.random() < errorRate / 3) {
                distorted.push(sequence[Math.floor(Math.random() * sequence.length)]);
            } else {
                distorted.push(sequence[i]);
            }
            if (Math.random() < errorRate / 3) {
                distorted.pop();
            }
            if (Math.random() < errorRate / 3) {
                distorted.push(sequence[Math.floor(Math.random() * sequence.length)]);
            }
        }
        return distorted;
    }

    wordInsertionPenalty = (insertedWord: string, matchingWord: string) => {
        const penalty = this.insertionPenalty;
        if (matchingWord === null) {
            // This is penalty for inserting words in the beginning
            return penalty;
        }
        if (matchingWord.length > 0) {
            const lastLetter = matchingWord[matchingWord.length - 1];
            if (lastLetter === '\n') {
                // it is cheaper to insert between paragraphs
                // console.log(`${insertedWord}-${matchingWord}`);
                return this.insertBetweenParagraphsPenalty * penalty;
            }
        }
        return penalty;
    }

    wordDeletionPenalty = (a: string) => {
        return this.deletionPenalty;
    }

    prefixDistance = (a: string, b: string) => {
        let prefixLength;
        const shorterLength = Math.min(a.length, b.length);
        const longerLength = Math.max(a.length, b.length);
        if (longerLength === 0) return 0;
        for (prefixLength = 0; prefixLength < shorterLength; prefixLength++) {
            if (a[prefixLength] !== b[prefixLength]) {
                break;
            }
        }
        // different words with similar length are closer than words with different lengths
        // prefers aligning words to words rather than nonspeech
        const difference = longerLength - prefixLength * 0.99 - shorterLength * 0.01;
        const normalizedDistance =  difference / longerLength;
        //console.log(`${a} ${b} ${normalizedDistance}`);
        return this.substitutionPenalty * normalizedDistance;
    }

    static exactMatchDistance = (a: string, b: string) => {
        return a === b ? 1 : 0;
    }

    timeToIndex(time: number) {
        const index =  this.targetTimestamps.findIndex((t) => {
            return t[0] >= time;
        });
        if (index === -1) {
            return this.targetTimestamps.length;
        } else {
            return index;
        }
    }

    compareSequence(sourceSequence: string[], timeFrom: number, timeTo: number) {
        const { distance, matchIndices } = this.aligner.match(sourceSequence, this.timeToIndex(timeFrom), this.timeToIndex(timeTo));
        info(sourceSequence.join('.'));
        info(matchIndices.join('.'));
        info(this.targetSequence.join('.'));
        info(`${distance}`);
        return matchIndices;
    }

    applyTimestamps(words: string[], matchIndices: any[]) {
        const transcription = new Transcription();
        for (let i = 0; i < words.length; i += 1) {
            const word = words[i] + ' ';
            const timestampIndex = matchIndices[i];
            const begin = this.targetTimestamps[timestampIndex][0];
            const end = this.targetTimestamps[timestampIndex][1];
            transcription.loadPhraseRaw(word, begin, end);
        }
        return transcription;
    }

    static cleanWord(word: string) {
        let cleaned = word.toLowerCase().trim();
        cleaned = cleaned.replace(/[.,?]/g, '');
        if (word.endsWith('\n')) cleaned += '\n'; // preserve newlines to handle correctly paragraph ends
        return cleaned;
    }

    addNewWord(word: string, begin: number, end: number) {
        this.aligner.push(StringAligner.cleanWord(word));
        this.targetTimestamps.push([begin, end]);
    }
}

module.exports = {
    StringAligner,
    Alignment,
};
