enum Op {
          Begin = 0,
          Insert,
          Substitute,
          Match,
          Delete
        }

export class Alignment<T> {
  a: T[];
  b: T[];
  matrix: number[][];
  prev: number[][];
  insertionPenalty: number;
  deletionPenalty: number;
  distance: (x: T, y: T) => number;
  constructor(baseSequence: T[], distance: (x: T, y: T) => number, insertionPenalty: number, deletionPenalty: number) {
    this.a = baseSequence;
    this.distance = distance;
    this.insertionPenalty = insertionPenalty;
    this.deletionPenalty = deletionPenalty;
  }

  countOperations(operations: Op[]) {
    const counts = [0, 0, 0, 0, 0];
    for (let i = 0; i < operations.length; i++) {
      counts[operations[i]]++;
    }
    return counts;
  }

  match(b: T[]) {
    this.b = b;
    // if (this.a.length === 0) return this.b.length;
    // if (this.b.length === 0) return this.a.length;

    this.matrix = [];
    this.prev = [];
    for (let i = 0; i <= b.length; i++) {
      this.matrix[i] = [i];
      this.prev[i] = [i];
    }

    // increment each column in the first row
    var j: number;
    for (j = 0; j <= this.a.length; j++) {
      this.matrix[0][j] = j;
      this.prev[0][j] = Op.Begin; // beginnning
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
      for (j = 1; j <= this.a.length; j++) {
        const wordDistance = this.distance(b[i - 1], this.a[j - 1]);
        var substitution = this.matrix[i - 1][j - 1] + wordDistance;
        var insertion = this.matrix[i][j - 1] + this.insertionPenalty;
        var deletion = this.matrix[i - 1][j] + this.deletionPenalty;
        if (substitution < insertion && substitution < deletion) {
          this.matrix[i][j] = substitution;
          if (wordDistance === 0) {
            this.prev[i][j] = Op.Match;
          } else {
            this.prev[i][j] = Op.Substitute;
          }
        }
        else if (insertion < deletion) {
          this.matrix[i][j] = insertion;
          this.prev[i][j] = Op.Insert;
        }
        else {
          this.matrix[i][j] = deletion;
          this.prev[i][j] = Op.Delete;
        }
      }
    }
  }

  evaluate() {
    let i = this.b.length;
    let j = this.a.length;
    let op = this.prev[i][j];
    const matchIndices = new Array(this.b.length).fill(0);
    let opSequence = [];
    for (var c = 0; true; c++) {
        if (op === Op.Begin) {
            break;
        }
        else if (op === Op.Substitute) {
            i = i - 1;
            j = j - 1;
        }
        else if (op === Op.Delete) {
            i = i - 1;
            j = j;
        }
        else if (op === Op.Insert) {
            i = i;
            j = j - 1;
        }
        else if (op === Op.Match) {
            i = i - 1;
            j = j - 1;
        }
        op = this.prev[i][j];
        opSequence.push(op);
        // console.log(i + ' ' + j + ' ' + this.a[j] + ', ' + b[i] + ' ' + op);
        matchIndices[i] = j;
    }
    const opcounts = this.countOperations(opSequence);
    console.log(opcounts);

    return {
      distance: this.matrix[this.b.length][this.a.length],
      matchIndices,
    };
  }
}