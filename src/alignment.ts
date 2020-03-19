enum Op {
          Begin = 0,
          Insert,
          Substitute,
          Match,
          Delete
        }

export class Alignment<T> {
  a: T[];

  insertionPenalty: (x: T, y: T) => number;
  deletionPenalty: (x: T) => number;
  distance: (x: T, y: T) => number;
  constructor(baseSequence: T[],
              distance: (x: T, y: T) => number,
              insertionPenalty: (x: T, y: T) => number,
              deletionPenalty: (x: T) => number) {
    this.a = baseSequence;
    this.distance = distance;
    this.insertionPenalty = insertionPenalty;
    this.deletionPenalty = deletionPenalty;
  }

  push(newEntry: T) {
      this.a.push(newEntry);
  }

  // b is the source. Find the optimal operations to match it with target a.
  match(b: T[], from: number, to: number) {
    // matrix[i][j] is the weighted levenshtein distance of b[:i] and a[from:from+j]
    const matrix: number[][] = [];
    const ops: number[][] = [];
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
      matrix[0][j] = matrix[0][j - 1] + this.insertionPenalty(aslice[j - 1], null);
      ops[0][j] = Op.Begin;
      console.log(matrix[0][j]);
    }
    console.log('----');
    for (let i = 1; i <= b.length; i++) {
      matrix[i][0] = matrix[i - 1][0] + this.deletionPenalty(b[i - 1]);
      ops[i][0] = Op.Delete;
      console.log(matrix[i][0]);
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= aslice.length; j++) {
        const wordDistance = this.distance(b[i - 1], aslice[j - 1]);
        var substitution = matrix[i - 1][j - 1] + wordDistance;
        var insertion = matrix[i][j - 1] + this.insertionPenalty(aslice[j - 1], b[i - 1]);
        var deletion = matrix[i - 1][j] + this.deletionPenalty(b[i - 1]);
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
    let i = b.length;
    let j = aslice.length;
    let op = ops[i][j];
    const matchIndices = new Array(b.length).fill(0);
    for (var c = 0; true; c++) {
        if (op === Op.Begin) {
            break;
        }
        if (i < 0 || j < 0) {
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
        if (op !== Op.Insert) { // "if i changed"
            matchIndices[i] = from + j;
        }
        op = ops[i][j];
        // console.log(i + ' ' + j + ' ' + this.a[j] + ', ' + b[i] + ' ' + op);
    }
    /*
    console.log(aslice.join(' '));
    for (let i = 0; i < matrix.length; i += 1) {
        console.log(b.slice(0, i).join(' '));
        console.log(matrix[i].join(' '));
        console.log(ops[i].join(' '));
    }
    */
    return {
      distance: matrix[b.length][aslice.length],
      matchIndices,
    };
  }
}