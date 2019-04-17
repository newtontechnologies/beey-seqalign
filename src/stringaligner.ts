import { Alignment } from './alignment';
import { Visualization } from './visualization';

export class StringAligner {
    string2array(str: string) {
        return str.split(/(?=[\s\S])/u); // converts string to an array of utf-8 characters.
    }

    string2words(str: string) {
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

    static prefixDistance = (a: string, b: string) => {
        a = a.toLowerCase();
        b = b.toLowerCase();
        let i;
        for (i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] !== b[i]) {
                break;
            }
        }
        return 1 - (i / Math.max(a.length, b.length));
    }

    static exactMatchDistance = (a: string, b: string) => {
        return a === b ? 1 : 0;
    }

    compareSequences(sourceSequence: string[], targetSequence: string[]) {
        const aligner = new Alignment(targetSequence, StringAligner.prefixDistance, 1, 1);
        // const aligner = new Alignment(targetSequence, StringAligner.distanceFunction, 1, 1);
        console.log('aligning...');
        aligner.match(sourceSequence);
        const { distance, matchIndices } = aligner.evaluate();
        console.log(distance / sourceSequence.length);
        return matchIndices;
    }
}