enum Op { Begin, Insert, Substitue, Match, Delete }

export class Alignment {
  constructor(name: string) {
      this.name = name;
  }
  name: string;
  greet(): void {
      console.log(`Hi, ${this.name}!`);
  }

  distance(word1: any, word2: any) {
    if (word1 === word2) return 0;
    else return 1;
  }

  getEditDistance(a: string, b: string) {

    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    var matrix = [];
    var prev = [];
    var i: number;
    for (i = 0; i <= b.length; i++) {
      matrix[i] = [i];
      prev[i] = [i];
    }

    // increment each column in the first row
    var j: number;
    for (j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
      prev[0][j] = Op.Begin; // beginnning
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
      for (j = 1; j <= a.length; j++) {
        var substitution = matrix[i - 1][j - 1] + this.distance(b[i - 1], a[j - 1]);
        var insertion = matrix[i][j - 1] + 1;
        var deletion = matrix[i - 1][j] + 1;
        if (substitution < insertion && substitution < deletion) {
            matrix[i][j] = substitution;
            prev[i][j] = Op.Substitue;
        }
        else if (insertion < deletion) {
            matrix[i][j] = insertion;
            prev[i][j] = Op.Insert;
        }
        else {
            matrix[i][j] = deletion;
            prev[i][j] = Op.Delete;
        }
      }
    }
    var result = matrix[b.length][a.length];

    var i = b.length;
    var j = a.length;
    var op = prev[i][j];
    for (var c = 0; true; c++) { // replace with while
        if (op === Op.Begin) {
            break;
        }
        else if (op === Op.Substitue) {
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
        else {
            return 1; // invalid content
        }
        op = prev[i][j];
        console.log(i + ' ' + j + ' ' + a.charAt(j) + ', ' + b.charAt(i) + ' ' + op);
    }
    return matrix[b.length][a.length];
  }
}