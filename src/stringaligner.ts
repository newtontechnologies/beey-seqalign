import { Alignment } from './alignment';
import { Visualization } from './visualization';

export class StringAligner {
    targetSequence: string[];
    targetTimestamps: number[][];
    aligner: Alignment<string>;
    deletionPenalty: number;
    insertionPenalty: number;
    substitutionPenalty: number;
    constructor(targetSequence: string[], targetTimestamps: number[][], insertionPenalty: number,
                deletionPenalty: number, substitutionPenalty: number) {
        this.targetSequence = targetSequence;
        this.aligner = new Alignment(this.targetSequence, this.prefixDistance, this.wordInsertionPenalty, this.wordDeletionPenalty);
        this.targetTimestamps = targetTimestamps;
        this.deletionPenalty = deletionPenalty;
        this.substitutionPenalty = substitutionPenalty;
        this.insertionPenalty = insertionPenalty;
    }

    static string2array(str: string) {
        return str.split(/(?=[\s\S])/u); // converts string to an array of utf-8 characters.
    }

    static string2words(str: string) {
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

    wordInsertionPenalty = (a: string) => {
        // return 1;
        return this.insertionPenalty * a.length;
    }

    wordDeletionPenalty = (a: string) => {
        // return 1;
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
        return this.substitutionPenalty * (Math.max(a.length, b.length) - i);
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
        console.log('aligning...');
        const { distance, matchIndices } = this.aligner.match(sourceSequence, this.timeToIndex(timeFrom), this.timeToIndex(timeTo));
        console.log(distance / sourceSequence.length);
        return matchIndices;
    }
}