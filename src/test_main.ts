import { Alignment } from './alignment';
import { Visualization } from './visualization';
import { StringAligner } from './stringaligner';
import { Transcription } from './transcription';

const prefixes = [
'asr/DMMV1803',
'asr/HOST0703',
'asr/HOST1303',
'asr/OZ120103',
'asr/OZ121303',
'asr/OZ122503',
'asr/PNAZ1703',
'asr/PNAZ3103',
'asr/STPP0503',
'asr/STPP1303',
'asr/STPP2503',
'asr/STPP2603',
'asr/STPP2903',
'asr/SZ190103',
'asr/SZ191603',
'asr/SZ191703',
'asr/SZ192403',
'asr/SZ193103',
'asr/UDAL1703',
'asr/UDAL3103',
'tv/AUTO0406',
'tv/DINT0405',
'tv/EVDN0403',
'tv/HKHO0405',
'tv/HORN0407',
'tv/MATS0404',
'tv/PLPO0402',
'tv/SHOD0407',
'tv/SKTA0405',
'tv/VOLN0406',
'vad/C2PO0103',
'vad/C2PO0403',
'vad/C2PO0503',
'vad/HOST0103',
'vad/HOST0403',
'vad/HOST0703',
'vad/IM081403',
'vad/PRZP1503',
'vad/RADH0203',
'vad/RADH0303',
'vad/STPP0103',
'vad/STPP0803',
'vad/STPP1503',
'vad/STPP2603',
'vad/TADY0203',
'vad/TADY2303',
'vad/TELN0703',
'vad/TELN1103',
'vad/TYRM0903',
'vad/UDAL0103',
];

async function fetchText(url: string) {
    console.log('fetching ' + url);
    const response = await fetch(url);
    if (!response.ok) return null;
    return response.text();
}

function viewLinks() {
    const container = document.getElementById('menu');
    for (let i = 0; i < prefixes.length; i++) {
        const prefix = prefixes[i];
        const link = document.createElement('a');
        link.href = window.location.href.split('?')[0] + '?name=' + prefix;
        link.innerHTML = prefix;
        container.appendChild(link);
        container.appendChild(document.createElement('br'));
    }
}

async function main() {
    var url_string = window.location.href;
    var url = new URL(url_string);
    viewLinks();
    var name = url.searchParams.get('name');
    console.log(name);
    document.getElementById('filename').innerHTML = name;
    const target = await fetchText('res/test/' + name + '.trsx');
    const targetTranscription = new Transcription(target);
    const targetSequence = targetTranscription.words; //.slice(0, 50);
    // let sourceSequence = stringAligner.string2words(source).slice(0, 50);

    let source = await fetchText('res/test/' + name + '.edited.txt');
    let sourceSequence: string[];
    if (source !== null) {
        sourceSequence = stringAligner.string2words(source); //.slice(0, 50);
        // let sourceSequence = stringAligner.distortWords(targetSequence, 0.2);
    }
    else {
        source = await fetchText('res/test/' + name + '.edited.trsx');
        const sourceTranscription = new Transcription(source);
        sourceSequence = sourceTranscription.words;
    }

    visualization.visualizeTarget(targetSequence, targetTranscription.timestamps);
    const matchIndices = stringAligner.compareSequences(sourceSequence, targetSequence);
    visualization.visualizeReference(sourceSequence, matchIndices);
    return Promise.resolve();
}

let stringAligner = new StringAligner();
const visualization = new Visualization('target', 'source', 'begin', 'end');

main();
