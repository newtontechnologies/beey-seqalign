import { Alignment } from './alignment';


function string2array(str: string) {
    return str.split(/(?=[\s\S])/u); // converts string to an array of utf-8 characters.
}

function string2words(str: string) {
    return str.split(' ');
}

function distortWords(sequence: string[], errorRate: number) {
    let distorted: string[];
    distorted = [];
    for (var i = 0; i < sequence.length; i++) {
        if (Math.random() < errorRate) {
            distorted[i] = sequence[Math.floor(Math.random() * sequence.length)];
        } else {
            distorted[i] = sequence[i];
        }
    }
    return distorted;
}

async function fetchText(url: string) {
    const response = await fetch(url);
    return response.text();
}

const distanceFunction = (a: string, b: string) => {
    let i;
    for (i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] !== b[i]) {
            break;
        }
    }
    return 1 - (i / Math.max(a.length, b.length));
};

let reference: string;
fetchText('res/krakatit.txt').then((text) => {
    reference = text;
}).then(() => {
    let referenceSequence = string2words(reference);
    referenceSequence = referenceSequence.splice(0, 10000);
    const aligner = new Alignment(referenceSequence, distanceFunction, 1, 1);
    for (var wer = 0; wer < 1; wer += 0.05) {
        let distortedSequence: string[];
        distortedSequence = distortWords(referenceSequence, wer);
        console.log('wer:' + wer);
        aligner.match(distortedSequence);
        const distance = aligner.evaluate();
        console.log('edit distance: ' + distance);
        console.log('estimated distance: ' + (distance / referenceSequence.length));
    }
});
