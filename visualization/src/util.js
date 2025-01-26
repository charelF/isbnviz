export function posToNum(x, y) {
    const dimensions = 16
    let h = 0;

    let n = 2 ** dimensions;
    let n2, t;

    for (let i = dimensions - 1; i >= 0; i--) {
        n2 = n / 2;

        let bits;
        if (x < n2 && y < n2) {
            // Case 0
            t = x;
            x = y;
            y = t;
            bits = 0;
        } else if (x < n2 && y >= n2) {
            // Case 1
            y -= n2;
            bits = 1;
        } else if (x >= n2 && y >= n2) {
            // Case 2
            x -= n2;
            y -= n2;
            bits = 2;
        } else {
            // Case 3
            t = y;
            y = (n2 - 1) - x + n2;
            x = (n2 - 1) - t;
            bits = 3;
        }

        h = (h << 2) | bits; // Shift h left by 2 bits and add the bits
        n = n2;
    }

    return h;
}

