export declare class Counter {
    dictionary: {
        [key: string]: number;
    };
    constructor();
    increment(key: string, value: number): void;
    get(key: string): number;
    getIntersectSize(other: Counter): number;
}
