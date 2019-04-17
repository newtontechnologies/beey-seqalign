export class Visualization {
    refContainer: Element;
    targetContainer: Element;
    beginContainer: Element;
    endContainer: Element;

    constructor(referenceId: string, targetId: string, beginId: string, endId: string) {
        this.refContainer = document.getElementById(referenceId);
        this.targetContainer = document.getElementById(targetId);
        this.beginContainer = document.getElementById(beginId);
        this.endContainer = document.getElementById(endId);
    }

    visualizeReference(sequence: string[], permutation: number[]) {
        let lastIndex = -1;
        for (let i = 0; i < permutation.length; i++) {
            const seqIndex = permutation[i];
            const el = document.createElement('div');
            if (lastIndex !== seqIndex) {
                el.innerHTML = sequence[seqIndex];
                this.targetContainer.appendChild(el);
            } else {
                el.innerHTML = '...';
                const lastChild = this.targetContainer.children[this.targetContainer.childElementCount - 1];
                this.targetContainer.insertBefore(el, lastChild);
            }
            lastIndex = seqIndex;
        }
    }

    visualizeTarget(sequence: string[], timestamps: number[][]) {
        for (let i = 0; i < sequence.length; i++) {
            const el = document.createElement('div');
            el.innerHTML = sequence[i];
            this.refContainer.appendChild(el);
        }
        for (let i = 0; i < sequence.length; i++) {
            const beginDiv = document.createElement('div');
            const endDiv = document.createElement('div');
            beginDiv.innerHTML = timestamps[i][0] + '';
            endDiv.innerHTML = timestamps[i][1] + '';
            this.beginContainer.appendChild(beginDiv);
            this.endContainer.appendChild(endDiv);
        }
    }
}