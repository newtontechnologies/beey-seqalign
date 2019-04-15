import { Alignment } from './alignment';
import { Visualization } from './visualization';

export class StringAligner {
    string2array(str: string) {
        return str.split(/(?=[\s\S])/u); // converts string to an array of utf-8 characters.
    }

    string2words(str: string) {
        return str.split(' ');
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

    static distanceFunction = (a: string, b: string) => {
        let i;
        for (i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] !== b[i]) {
                break;
            }
        }
        return 1 - (i / Math.max(a.length, b.length));
    }

    compareSequences(referenceSequence: string[], distortedSequence: string[]) {

        const aligner = new Alignment(referenceSequence, StringAligner.distanceFunction, 1, 1);
        console.log('aligning...');
        aligner.match(distortedSequence);
        const { distance, matchIndices } = aligner.evaluate();
        console.log(distance / referenceSequence.length);
        return matchIndices;
    }
}