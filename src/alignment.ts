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
  insertionPenalty: (x: T) => number;
  deletionPenalty: (x: T) => number;
  distance: (x: T, y: T) => number;
  constructor(baseSequence: T[], distance: (x: T, y: T) => number,
              insertionPenalty: (x: T) => number, deletionPenalty: (x: T) => number) {
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

  match(b: T[], from: number, to: number) {
    // matrix[i][j] is the levenshtein distance of b[:i] and a[:j]
    const matrix: number[][] = [];
    const ops: number[][] = [];
    this.b = b;
    const aslice = this.a.slice(from, to);
    // if (this.a.length === 0) return this.b.length;
    // if (this.b.length === 0) return this.a.length;

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [];
      ops[i] = [];
    }

    matrix[0][0] = 0;
    ops[0][0] = Op.Begin;
    for (let j = 1; j <= aslice.length; j++) {
      matrix[0][j] = matrix[0][j - 1] + this.insertionPenalty(aslice[j - 1]);
      ops[0][j] = Op.Begin;
    }
    for (let i = 1; i <= this.b.length; i++) {
      matrix[i][0] = matrix[i - 1][0] + this.deletionPenalty(this.b[i - 1]);
      ops[i][0] = Op.Delete;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= aslice.length; j++) {
        const wordDistance = this.distance(b[i - 1], aslice[j - 1]);
        var substitution = matrix[i - 1][j - 1] + wordDistance;
        var insertion = matrix[i][j - 1] + this.insertionPenalty(aslice[j - 1]);
        var deletion = matrix[i - 1][j] + this.deletionPenalty(this.b[i - 1]);
        if (substitution < insertion && substitution < deletion) {
          matrix[i][j] = substitution;
          if (wordDistance === 0) {
            ops[i][j] = Op.Match;
          } else {
            ops[i][j] = Op.Substitute;
          }
        }
        else if (insertion < deletion) {
          matrix[i][j] = insertion;
          ops[i][j] = Op.Insert;
        }
        else {
          matrix[i][j] = deletion;
          ops[i][j] = Op.Delete;
        }
      }
    }
    let i = this.b.length;
    let j = aslice.length;
    let op = ops[i][j];
    const matchIndices = new Array(this.b.length).fill(0);
    let opSequence = [];
    for (var c = 0; true; c++) {
        if (op === Op.Begin) {
            break;
        }
        if (i <= 0 || j <= 0) {
          console.log('this was not supposed to happen...');
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
        op = ops[i][j];
        opSequence.push(op);
        // console.log(i + ' ' + j + ' ' + this.a[j] + ', ' + b[i] + ' ' + op);
        matchIndices[i] = from + j;
    }
    const opcounts = this.countOperations(opSequence);

    return {
      distance: matrix[this.b.length][aslice.length],
      matchIndices,
    };
  }
}