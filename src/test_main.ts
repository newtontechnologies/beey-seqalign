import { Alignment } from './alignment';
import { Visualization } from './visualization';
import { StringAligner } from './stringaligner';


async function fetchText(url: string) {
    const response = await fetch(url);
    return response.text();
}



let stringAligner = new StringAligner();
const visualization = new Visualization('reference', 'distorted');

async function main() {
    var url_string = window.location.href;
    var url = new URL(url_string);
    var name = url.searchParams.get('name');
    console.log(name);
    const reference = await fetchText('res/test/' + name + '.trans.txt');
    const target = await fetchText('res/test/' + name + '.csv');
    const referenceSequence = stringAligner.string2words(reference);
    const targetSequence = stringAligner.string2words(target);
    visualization.visualizeTarget(referenceSequence);
    const matchIndices = stringAligner.compareSequences(referenceSequence, targetSequence);
    visualization.visualizeReference(targetSequence, matchIndices);
    return Promise.resolve();
}

main();
