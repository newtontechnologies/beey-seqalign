export class Counter {
    dictionary: {[key: string]: number};
    constructor() {
        this.dictionary = {};
    }

    increment(key: string, value: number) {
        if (!this.dictionary[key]) {
            this.dictionary[key] = 0;
        }
        this.dictionary[key] += value;
        if (this.dictionary[key] === 0) {
            delete this.dictionary[key];
        }
    }

    get(key: string) {
        if (!this.dictionary[key]) return 0;
        return this.dictionary[key];
    }

    getIntersectSize(other: Counter) {
        let intersectSize = 0;
        for (let key in this.dictionary) {
            intersectSize += Math.min(this.get(key), other.get(key));
        }
        return intersectSize;
    }
}