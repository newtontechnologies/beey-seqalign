export class Visualization {
    table: Element;

    constructor(tableId: string) {
        this.table = document.getElementById(tableId);
    }

    visualize(source: string[], target: string[], timestamps: number[][], permutation: number[]) {
        let lastIndex = -1;
        for (let i = 0; i < permutation.length; i++) {
            const row = document.createElement('tr');
            const sourceTd = document.createElement('td');
            sourceTd.innerHTML = source[i];
            row.appendChild(sourceTd);

            const seqIndex = permutation[i];
            const el = document.createElement('td');
            if (lastIndex !== seqIndex) {
                let text = timestamps[i][0] + ' ';
                for (let j = seqIndex; j < permutation[i + 1]; j++) {
                    text += ' ' + target[j];
                }
                // let text = timestamps[i][0] + ' ' + sequence[seqIndex];
                el.innerHTML = text;
            } else {
                el.innerHTML = '...';
                // const lastChild = this.targetContainer.children[this.targetContainer.childElementCount - 1];
                // this.targetContainer.insertBefore(el, lastChild);
            }
            lastIndex = seqIndex;

            row.appendChild(el);
            this.table.appendChild(row);
        }
        /*
        for (let i = 0; i < sequence.length; i++) {
            const beginDiv = document.createElement('div');
            const endDiv = document.createElement('div');
            beginDiv.innerHTML = timestamps[i][0] + '';
            endDiv.innerHTML = timestamps[i][1] + '';
            this.beginContainer.appendChild(beginDiv);
            this.endContainer.appendChild(endDiv);
        }
        */
    }
}