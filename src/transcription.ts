//import moment from 'moment';

export class Transcription {
    words: string[];
    timestamps: string[];
    length: number;

    fromTrsx(trsx: string) {
        const xmlParser = new DOMParser();
        const xml = xmlParser.parseFromString(trsx, 'text/xml');
        const phrases = xml.getElementsByTagName('p');
        for (let i = 0; i < phrases.length; i += 1) {
            const phrase = phrases[i];
   //         moment.duration(phrase.getAttribute('e')).asSeconds()
        }
    }
}