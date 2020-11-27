import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';

import { escapeXMLString } from './xml-escape';

dayjs.extend(duration);

const DOMParser = require('xmldom').DOMParser;

const TRSX_HEADER = '\
<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n\
<transcription version="3.0" mediauri="">\n\
  <meta>\n\
  </meta>\n\
  <ch name="">\n\
    <se name="0">\n\
      <pa b="PT0S" e="PT20H0M0S" s="0">\n';
const TRSX_FOOTER = '\n\
      </pa>\n\
    </se>\n\
  </ch>\n\
  <sp>\n\
  </sp>\n\
</transcription>\n';
export class Transcription {
    words: string[];
    timestamps: number[][];
    length: number;
    text: string;

    constructor(trsx?: string, ignoreNoise?: boolean) {
        this.words = [];
        this.timestamps = [];
        this.length = 0;
        this.text = '';
        if (trsx) {
            this.fromTrsx(trsx, ignoreNoise);
        }
    }

    loadPhraseRaw(text: string, begin: number, end: number) {
        this.text += text;
        this.words.push(text);
        this.length += 1;
        this.timestamps.push([begin, end]);
    }

    loadPhraseXml(phrase: Element, ignoreNoise?: boolean) {
        let text = phrase.textContent;
        const begin = dayjs.duration(phrase.getAttribute('b')).asSeconds();
        const end = dayjs.duration(phrase.getAttribute('e')).asSeconds();

        if (text.substring(0, 4) === '[n::' || text.substring(0, 4) === '[h::') {
            if (ignoreNoise) {
                return;
            } else {
                text = '';
            }
        }
        this.loadPhraseRaw(text, begin, end);
    }

    fromTrsx(trsx: string, ignoreNoise?: boolean) {
        const xmlParser = new DOMParser();
        const xml = xmlParser.parseFromString(trsx, 'text/xml');
        const paragraphs = xml.getElementsByTagName('pa');
        for (let i = 0; i < paragraphs.length; i += 1) {
            const paragraph = paragraphs[i];
            const phrases = paragraph.getElementsByTagName('p');
            for (let j = 0; j < phrases.length; j += 1) {
                this.loadPhraseXml(phrases[j], ignoreNoise);
            }
            this.words[this.words.length - 1] += '\n';
            this.text += '\n';
        }
    }

    exportTrsx() {
        const phrases: string[] = [];
        for (let i = 0; i < this.words.length; i += 1) {
            let text = this.words[i];
            const [ begin, end ] = this.timestamps[i];
            // merge words with the same timestamps
            for (let j = i + 1; j < this.timestamps.length && this.timestamps[j][0] === begin; j += 1) {
                text += this.words[j];
                i = j;
            }
            const isoBegin = dayjs.duration(begin, 'seconds').toISOString();
            const isoEnd = dayjs.duration(end, 'seconds').toISOString();
            const phrase = `        <p b="${isoBegin}" e="${isoEnd}">${escapeXMLString(text)}</p>\n`;
            phrases.push(phrase);
        }
        return [TRSX_HEADER, ...phrases, TRSX_FOOTER].join('');
    }

    getText() {
        return this.text;
    }
}