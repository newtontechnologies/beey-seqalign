import * as moment from 'moment';

export class Transcription {
    words: string[];
    timestamps: number[][];
    length: number;
    constructor(trsx: string) {
        this.fromTrsx(trsx);
    }

    loadPhrase(phrase: Element) {
        const text = phrase.textContent;
        let words = text.split(' ');
        const begin = moment.duration(phrase.getAttribute('b')).asSeconds();
            const end = moment.duration(phrase.getAttribute('e')).asSeconds();
        for (let i = 0; i < words.length; i++) {
            const text = words[i];
            if (text.length !== 0) {
                this.words.push(text);
            this.timestamps.push([begin, end]);
            }
        }
    }

    fromTrsx(trsx: string) {
        this.words = [];
        this.timestamps = [];
        const xmlParser = new DOMParser();
        const xml = xmlParser.parseFromString(trsx, 'text/xml');
        const phrases = xml.getElementsByTagName('p');

        for (let i = 0; i < phrases.length; i += 1) {
            this.loadPhrase(phrases[i]);
        }
        this.length = this.words.length;
    }
}