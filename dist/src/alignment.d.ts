export declare class Alignment {
    a: string[];
    chunkSize: number;
    insertionPenalty: (x: string, y: string) => number;
    deletionPenalty: (x: string) => number;
    distance: (x: string, y: string) => number;
    constructor(baseSequence: string[], distance: (x: string, y: string) => number, insertionPenalty: (x: string, y: string) => number, deletionPenalty: (x: string) => number, chunkSize: number);
    static pickBestMatchFromScores(scores: number[], tolerance: number): number;
    push(newEntry: string): void;
    findBestMatchForPattern(pattern: string[], targetFrom: number, targetTo: number, tolerance: number): number[];
    getCountInArray(element: any, array: any[]): number;
    getMatchingWords(source: string[], target: string[]): number[];
    getPivots(source: string[], targetFrom: number, targetTo: number): number[];
    getPivotsAt(source: string[], targetFrom: number, targetTo: number, patternStart: number, tolerance: number): number[];
    match(b: string[], from: number, to: number): {
        distance: number;
        matchIndices: number[];
    };
}
