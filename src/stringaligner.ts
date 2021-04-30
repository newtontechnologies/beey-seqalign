import { Alignment } from './alignment';
import { Visualization } from './visualization';
import { Transcription } from './transcription';

const VERBOSITY = 0;

const VALID_PHRASE_ENDS = /[\u0020\u00a0\n]/;
function error(message: string) {
    if (VERBOSITY < 1) return;
    console.log(message);
}
function warning(message: string) {
    if (VERBOSITY < 1) return;
    console.log(message);
}
function info(message: string) {
    if (VERBOSITY < 2) return;
    console.log(message);
}

export class StringAligner {
    targetSequence: string[];
    targetTimestamps: number[][];
    aligner: Alignment;
    deletionPenalty: number;
    insertionPenalty: number;
    substitutionPenalty: number;
    insertBetweenParagraphsPenalty: number;
    currentWord: string;
    currentWordBegin: number;

    constructor(targetSequence: string[], targetTimestamps: number[][], insertionPenalty: number,
                deletionPenalty: number, substitutionPenalty: number, insertBetweenParagraphsPenalty: number,
                chunkSize: number) {
        const lowerCase = targetSequence.map(x => x.toLowerCase().trim());
        this.targetSequence = lowerCase;
        if (chunkSize === undefined) chunkSize = 1000;
        this.aligner = new Alignment(this.targetSequence,
                                     this.prefixDistance,
                                     this.wordInsertionPenalty,
                                     this.wordDeletionPenalty,
                                     chunkSize);
        this.targetTimestamps = targetTimestamps;
        this.deletionPenalty = deletionPenalty;
        this.substitutionPenalty = substitutionPenalty;
        this.insertionPenalty = insertionPenalty;
        this.insertBetweenParagraphsPenalty = insertBetweenParagraphsPenalty;
        this.currentWord = '';
        this.currentWordBegin = null;
    }

    static string2array(str: string) {
        return str.split(/(?=[\s\S])/u); // converts string to an array of utf-8 characters.
    }

    static string2words(str: string) {
        const changedStr = str.replace(/\n/g, '\n ');
        const words = changedStr.split(/[ ]/u);
        return words;
    }

    static cleanWords(words: string[]) {
        return words.map(x => StringAligner.cleanWord(x));
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

    /*
    insertedWord is the word from automatic transcription that is being inserted
    into the user text rigth after the matchingWord.
    */
    wordInsertionPenalty = (insertedWord: string, matchingWord: string) => {
        const penalty = this.insertionPenalty;
        if (matchingWord === null) {
            // This is penalty for inserting words in the beginning
            return penalty;
        }
        if (matchingWord.length > 0) {
            const lastLetter = matchingWord[matchingWord.length - 1];
            if (lastLetter === '\n') {
                // it is cheaper to insert between paragraphs
                // console.log(`${insertedWord}-${matchingWord}`);
                return this.insertBetweenParagraphsPenalty * penalty;
            }
        }
        return penalty;
    }

    wordDeletionPenalty = (a: string) => {
        return this.deletionPenalty;
    }

    prefixDistance = (a: string, b: string) => {
        // words starting with '#' are filler words. They should not be matched
        if (b.startsWith('#')) {
            return 1000;
        }
        let prefixLength;
        const shorterLength = Math.min(a.length, b.length);
        const longerLength = Math.max(a.length, b.length);
        if (longerLength === 0) return 0;
        for (prefixLength = 0; prefixLength < shorterLength; prefixLength++) {
            if (a[prefixLength] !== b[prefixLength]) {
                break;
            }
        }
        // different words with similar length are closer than words with different lengths
        // prefers aligning words to words rather than nonspeech
        const difference = longerLength - prefixLength * 0.99 - shorterLength * 0.01;
        const normalizedDistance =  difference / longerLength;
        return this.substitutionPenalty * normalizedDistance;
    }

    static exactMatchDistance = (a: string, b: string) => {
        return a === b ? 1 : 0;
    }

    indexAfterTime(time: number) {
        const index =  this.targetTimestamps.findIndex((t) => {
            return t[0] >= time;
        });
        if (index === -1) {
            return this.targetTimestamps.length;
        } else {
            return index;
        }
    }
    indexBeforeTime(time: number) {
        const index =  this.targetTimestamps.findIndex((t) => {
            return t[1] > time;
        });
        if (index === -1) {
            return this.targetTimestamps.length;
        } else {
            return index - 1;
        }
    }

    compareSequence(sourceSequence: string[], timeFrom: number, timeTo: number) {
        const indexFrom = this.indexAfterTime(timeFrom);
        const indexTo = this.indexBeforeTime(timeTo);
        const { distance, matchIndices } = this.aligner.match(sourceSequence, indexFrom, indexTo + 1);
        info(sourceSequence.join('.'));
        info(matchIndices.join('.'));
        info(this.targetSequence.join('.'));
        info(`${distance}`);
        return matchIndices;
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

    static cleanWord(word: string) {
        let cleaned = word.toLowerCase().trim();
        cleaned = cleaned.replace(/[.,?]/g, '');
        if (word.endsWith('\n')) cleaned += '\n'; // preserve newlines to handle correctly paragraph ends
        return cleaned;
    }

    extendCurrentWord(word: string, begin: number) {
        this.currentWord = this.currentWord + word;
        this.currentWordBegin = this.currentWordBegin !== null ? this.currentWordBegin : begin;
    }

    cleanCurrentWord() {
        this.currentWord = '';
        this.currentWordBegin = null;
    }

    isWordEnd(word: string) {
        if (word.length === 0) return true;
        if (word.startsWith('[n::')) return true;
        if (word.startsWith('[h::')) return true;
        const isLastLetterPhraseEnd = VALID_PHRASE_ENDS.test(word.slice(-1));
        return isLastLetterPhraseEnd;
    }

    splitWords(text: string) {
        const words = text.split(VALID_PHRASE_ENDS).filter(word => word.length > 0);
        return words;
    }

    addNewWord(word: string, begin: number, end: number) {
        this.extendCurrentWord(word, begin); // join phrases that form a single word (e. g. "43")
        if (this.isWordEnd(word)) {
            const words = this.splitWords(this.currentWord); // split a phrase consisting of multiple words
            for (let i = 0; i < words.length; i += 1) {
              // the individual words are added each separately, but they have the same timestamps
              // maybe it would be better to split it to individual timestamps?
              const word = words[i];
              this.aligner.push(StringAligner.cleanWord(word));
              this.targetTimestamps.push([this.currentWordBegin, end]);
            }
            this.cleanCurrentWord();
        }
    }
}

module.exports = {
    StringAligner,
    Alignment,
};
