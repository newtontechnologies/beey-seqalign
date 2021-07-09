export declare class Transcription {
    words: string[];
    timestamps: number[][];
    length: number;
    text: string;
    constructor(trsx?: string, ignoreNoise?: boolean);
    loadPhraseRaw(text: string, begin: number, end: number): void;
    loadPhraseXml(phrase: Element, ignoreNoise?: boolean): void;
    fromTrsx(trsx: string, ignoreNoise?: boolean): void;
    exportTrsx(): string;
    getText(): string;
}
