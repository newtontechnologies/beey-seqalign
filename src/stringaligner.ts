import { Alignment } from './alignment';
import { Visualization } from './visualization';
import { Transcription } from './transcription';

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
        str = str.replace('\n', '\n ');
        const words = str.split(/[ ]/u);
        // return words.map(x => x + ' ');
        return words;
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
        const penalty = this.insertionPenalty * insertedWord.length;
        if (!matchingWord) {
            // This is penalty for inserting words in the beginning (with no matching word)
            return this.insertBetweenParagraphsPenalty * penalty;
        }
        if (matchingWord.length > 0) {
            const lastLetter = matchingWord[matchingWord.length - 1];
            if (lastLetter === '\n') {
                // it is cheaper to insert between paragraphs
                return this.insertBetweenParagraphsPenalty * penalty;
            }
        }
        return penalty;
    }

    wordDeletionPenalty = (a: string) => {
        return this.deletionPenalty * a.length;
    }

    prefixDistance = (a: string, b: string) => {
        let i;
        const limit = Math.min(a.length, b.length);
        for (i = 0; i < limit; i++) {
            if (a[i] !== b[i]) {
                break;
            }
        }
        return this.substitutionPenalty * (b.length - i);
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
        // do not trim whitespace, because newlines are needed to align correctly around paragraphs.
        const lowerCase = sourceSequence.map(x => x.toLowerCase());
        const { distance, matchIndices } = this.aligner.match(['\n', ...lowerCase, '\n'], this.timeToIndex(timeFrom), this.timeToIndex(timeTo));
        return matchIndices.slice(1, matchIndices.length - 1);
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

    addNewWord(word: string, begin: number, end: number) {
        this.aligner.push(word.toLowerCase().trim());
        this.targetTimestamps.push([begin, end]);
    }
}

module.exports = {
    StringAligner,
    Alignment,
};
