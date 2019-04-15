export class Visualization {
    ref: Element;
    target: Element;
    constructor(reference_id: string, target_id: string) {
        this.ref = document.getElementById(reference_id);
        this.target = document.getElementById(target_id);
    }

    visualizeReference(sequence: string[], permutation: number[]) {
        let lastIndex = -1;
        for (let i = 0; i < permutation.length; i++) {
            const seqIndex = permutation[i];
            const el = document.createElement('div');
            if (lastIndex !== seqIndex) {
                el.innerHTML = sequence[seqIndex];
            } else {
                el.innerHTML = '...';
            }
            lastIndex = seqIndex;
            this.target.appendChild(el);
        }
    }

    visualizeTarget(sequence: string[]) {
        for (let i = 0; i < sequence.length; i++) {
            const el = document.createElement('div');
            el.innerHTML = sequence[i];
            this.ref.appendChild(el);
        }
    }
}