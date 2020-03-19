import { Alignment } from './alignment';
import { Visualization } from './visualization';
import { Transcription } from './transcription';

export class StringAligner {
    targetSequence: string[];
    targetTimestamps: number[][];
    aligner: Alignment<string>;
    deletionPenalty: number;
    insertionPenalty: number;
    substitutionPenalty: number;
    insertBetweenParagraphsPenalty: number;
    constructor(targetSequence: string[], targetTimestamps: number[][], insertionPenalty: number,
                deletionPenalty: number, substitutionPenalty: number, insertBetweenParagraphsPenalty: number) {
        this.targetSequence = targetSequence;
        this.aligner = new Alignment(this.targetSequence,
                                     this.prefixDistance,
                                     this.wordInsertionPenalty,
                                     this.wordDeletionPenalty);
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
        return str.split(/[ ]/u);
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
        let lfDiscountCoefficient = 1;
        if (!matchingWord || (matchingWord.length > 0 && matchingWord.slice(-1) === '\n')) {
            // it is cheaper to insert between paragraphs
            lfDiscountCoefficient = this.insertBetweenParagraphsPenalty;
        }
        return lfDiscountCoefficient * this.insertionPenalty * insertedWord.length;
    }

    wordDeletionPenalty = (a: string) => {
        return this.deletionPenalty * a.length;
    }

    prefixDistance = (a: string, b: string) => {
        a = a.toLowerCase();
        b = b.toLowerCase();
        let i;
        for (i = 0; i < Math.min(a.length, b.length); i++) {
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
        return this.targetTimestamps.findIndex((t) => {
            return t[0] >= time;
        });
    }

    compareSequence(sourceSequence: string[], timeFrom: number, timeTo: number) {
        const { distance, matchIndices } = this.aligner.match(['\n', ...sourceSequence, '\n'], this.timeToIndex(timeFrom), this.timeToIndex(timeTo));
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
        this.aligner.push(word);
        this.targetTimestamps.push([begin, end]);
    }
}

module.exports = {
    StringAligner,
    Alignment,
};
