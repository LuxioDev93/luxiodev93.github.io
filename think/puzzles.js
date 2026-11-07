// --- PROBLEMAS DE KEY THINK ---
// Ejercicios originales de razonamiento. Cada uno devuelve:
// { op, text, answer, hint, explain } y, si es de elegir, choices; mono para cuadrículas.
const PUZZLE_LEVEL_MIN = 1;
const PUZZLE_LEVEL_MAX = 3;

function pRand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pPick(list) {
    return list[pRand(0, list.length - 1)];
}

function pSymbols(count) {
    const symbols = ['🍎', '🍌', '🍇', '⭐', '🐸', '🚀', '⚽', '🌙'];
    for (let i = symbols.length - 1; i > 0; i--) {
        const j = pRand(0, i);
        [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
    }
    return symbols.slice(0, count);
}

function pParityWord(n) {
    return n % 2 === 0 ? 'par' : 'impar';
}

function pParity(numbers) {
    const total = numbers.reduce((sum, n) => sum + n, 0);
    const odds = numbers.filter(n => n % 2 !== 0).length;
    return {
        op: 'paridad',
        text: `Sin calcular toda la suma:\n${numbers.join(' + ')}\n¿Da par o impar?`,
        answer: total % 2,
        choices: ['Par', 'Impar'],
        hint: 'Pista: mira solo la última cifra de cada número. Cada dos impares forman un par.',
        explain: `Hay ${odds} ${odds === 1 ? 'número impar' : 'números impares'}, así que el resultado es ${pParityWord(total)}. Da ${total}.`
    };
}

function pParityProduct() {
    const a = pRand(11, 49), b = pRand(11, 49);
    const product = a * b;
    return {
        op: 'paridad',
        text: `Sin hacer la multiplicación:\n${a} × ${b}\n¿Da par o impar?`,
        answer: product % 2,
        choices: ['Par', 'Impar'],
        hint: 'Pista: multiplicar es hacer grupos iguales. ¿Qué pasa si uno de los números es par?',
        explain: product % 2 === 0
            ? 'Si al menos uno de los números es par, el resultado siempre es par.'
            : 'Solo da impar cuando los dos números son impares, como aquí.'
    };
}

function pBackwards(steps) {
    const start = pRand(2, 12);
    let value = start;
    const said = [];
    const undo = [];
    for (let i = 0; i < steps; i++) {
        const kind = i === 0 && steps > 1 ? 'mul' : pPick(['add', 'sub']);
        if (kind === 'mul') {
            const k = pRand(2, 5);
            said.push(`lo multiplico por ${k}`);
            value *= k;
            undo.unshift(`dividir entre ${k}`);
        } else if (kind === 'add' || value <= 5) {
            const k = pRand(2, 15);
            said.push(`le sumo ${k}`);
            value += k;
            undo.unshift(`restar ${k}`);
        } else {
            const k = pRand(1, Math.min(9, value - 1));
            said.push(`le resto ${k}`);
            value -= k;
            undo.unshift(`sumar ${k}`);
        }
    }
    return {
        op: 'hacia_atras',
        text: `Pienso un número, ${said.join(', ')} y me da ${value}.\n¿Qué número pensé?`,
        answer: start,
        hint: 'Pista: empieza por el final y deshaz cada paso.',
        explain: `Desde ${value}, hay que ${undo.join(' y luego ')}. Sale ${start}.`
    };
}

function pSequence(items, answer, rule) {
    return {
        op: 'patron',
        text: `¿Qué número sigue?\n${items.join(', ')}, ?`,
        answer,
        hint: 'Pista: mira cuánto cambia de un número al siguiente.',
        explain: `${rule} Sigue el ${answer}.`
    };
}

function pPatternEasy() {
    const start = pRand(1, 9), step = pRand(2, 9);
    const items = [0, 1, 2, 3].map(i => start + step * i);
    return pSequence(items, start + step * 4, `Cada vez suma ${step}.`);
}

function pPatternMedium() {
    return pPick([
        () => {
            const start = pRand(1, 5);
            const items = [0, 1, 2, 3].map(i => start * 2 ** i);
            return pSequence(items, start * 16, 'Cada número es el doble del anterior.');
        },
        () => {
            const start = pRand(1, 9);
            const items = [start];
            for (let i = 1; i <= 4; i++) items.push(items[i - 1] + i);
            return pSequence(items, items[4] + 5, 'Cada vez suma uno más: +1, +2, +3…');
        },
        () => {
            const up = pRand(4, 9), down = pRand(1, 3), start = pRand(2, 9);
            const items = [start];
            for (let i = 1; i <= 5; i++) items.push(items[i - 1] + (i % 2 ? up : -down));
            return pSequence(items, items[5] - down, `Va alternando: suma ${up} y resta ${down}.`);
        }
    ])();
}

function pPatternHard() {
    return pPick([
        () => {
            const start = pRand(1, 4), mid = pRand(2, 5);
            const a = [start, mid];
            for (let i = 2; i < 6; i++) a.push(a[i - 1] + a[i - 2]);
            return pSequence(a, a[4] + a[5], 'Cada número es la suma de los dos anteriores.');
        },
        () => {
            const start = pRand(1, 5);
            const a = [start];
            for (let i = 1; i < 5; i++) a.push(a[i - 1] * 2 + 1);
            return pSequence(a, a[4] * 2 + 1, 'Cada número es el doble del anterior más 1.');
        },
        () => {
            const n = pRand(1, 4);
            const a = [0, 1, 2, 3].map(i => (n + i) ** 2);
            return pSequence(a, (n + 4) ** 2, 'Son números multiplicados por sí mismos.');
        }
    ])();
}

function pCountRange() {
    const a = pRand(3, 30), b = a + pRand(4, 15);
    return {
        op: 'conteo',
        text: `¿Cuántos números hay del ${a} al ${b}, contando los dos?`,
        answer: b - a + 1,
        hint: 'Pista: prueba primero con algo pequeño, como del 3 al 5. Son 3 números, no 2.',
        explain: `${b} − ${a} = ${b - a}, y hay que sumar 1 porque el ${a} también cuenta. Son ${b - a + 1}.`
    };
}

function pCountMultiples() {
    const k = pRand(3, 9), n = pRand(20, 60);
    const answer = Math.floor(n / k);
    return {
        op: 'conteo',
        text: `¿Cuántos números del 1 al ${n} están en la tabla del ${k}?`,
        answer,
        hint: `Pista: ¿cuántas veces cabe el ${k} en ${n}?`,
        explain: `${k} × ${answer} = ${k * answer} y el siguiente ya pasa de ${n}. Son ${answer}.`
    };
}

function pCountDigitSum() {
    const sum = pRand(4, 14);
    let answer = 0;
    for (let n = 10; n <= 99; n++) {
        if (Math.floor(n / 10) + n % 10 === sum) answer++;
    }
    return {
        op: 'conteo',
        text: `¿Cuántos números de dos cifras tienen cifras que suman ${sum}?`,
        answer,
        hint: 'Pista: ve en orden. Prueba con la primera cifra en 1, luego en 2…',
        explain: `Si los escribes en orden sin saltarte ninguno, salen ${answer}.`
    };
}

function pCountDigitAppears() {
    const digit = pRand(2, 9), n = pPick([30, 40, 50, 60]);
    let answer = 0;
    for (let i = 1; i <= n; i++) {
        answer += String(i).split('').filter(c => c === String(digit)).length;
    }
    return {
        op: 'conteo',
        text: `Escribes todos los números del 1 al ${n}.\n¿Cuántas veces escribes la cifra ${digit}?`,
        answer,
        hint: 'Pista: cuenta por separado las unidades y las decenas.',
        explain: `Sumando las veces que sale en las unidades y en las decenas, son ${answer}.`
    };
}

function pCountArrangements() {
    const digits = pRand(3, 5);
    const list = [1, 2, 3, 4, 5].slice(0, digits).join(', ');
    return {
        op: 'conteo',
        text: `Con las cifras ${list}, ¿cuántos números de dos cifras puedes formar sin repetir cifra?`,
        answer: digits * (digits - 1),
        hint: 'Pista: elige la primera cifra. ¿Cuántas quedan para la segunda?',
        explain: `Hay ${digits} opciones para la primera y ${digits - 1} para la segunda: ${digits} × ${digits - 1} = ${digits * (digits - 1)}.`
    };
}

function pHandshakes() {
    const n = pRand(3, 8);
    const answer = n * (n - 1) / 2;
    return {
        op: 'conteo',
        text: `${n} amigos se dan la mano una vez cada pareja.\n¿Cuántos apretones de mano hay?`,
        answer,
        hint: 'Pista: dibuja puntos y une cada pareja con una línea.',
        explain: `El primero saluda a ${n - 1}, el siguiente a ${n - 2} nuevos… En total, ${answer}.`
    };
}

function pSymbolsEasy() {
    const [s1, s2] = pSymbols(2);
    const a = pRand(2, 9), b = pRand(1, 9);
    return {
        op: 'simbolos',
        text: `${s1} + ${s1} = ${a * 2}\n${s1} + ${s2} = ${a + b}\n¿Cuánto vale ${s2}?`,
        answer: b,
        hint: `Pista: empieza por la primera línea. ¿Cuánto vale ${s1}?`,
        explain: `${s1} vale ${a}, así que ${s2} vale ${a + b} − ${a} = ${b}.`
    };
}

function pSymbolsMedium() {
    const [s1, s2, s3] = pSymbols(3);
    const a = pRand(2, 9), b = pRand(2, 9), c = pRand(2, 9);
    return {
        op: 'simbolos',
        text: `${s1} + ${s1} + ${s1} = ${a * 3}\n${s1} + ${s2} = ${a + b}\n${s2} + ${s3} = ${b + c}\n¿Cuánto vale ${s3}?`,
        answer: c,
        hint: 'Pista: resuelve una línea y usa ese valor en la siguiente.',
        explain: `${s1} vale ${a}, ${s2} vale ${b} y ${s3} vale ${c}.`
    };
}

function pSymbolsHard() {
    const [s1, s2, s3] = pSymbols(3);
    const a = pRand(2, 15), b = pRand(2, 15), c = pRand(2, 15);
    return {
        op: 'simbolos',
        text: `${s1} + ${s2} = ${a + b}\n${s2} + ${s3} = ${b + c}\n${s1} + ${s3} = ${a + c}\n¿Cuánto vale ${s1} + ${s2} + ${s3}?`,
        answer: a + b + c,
        hint: 'Pista: suma las tres líneas. ¿Cuántas veces aparece cada símbolo?',
        explain: `Las tres líneas suman ${2 * (a + b + c)} y cada símbolo aparece dos veces. La mitad es ${a + b + c}.`
    };
}

function pMagicSquare(showSum) {
    let grid = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];
    const rotate = g => g[0].map((_, c) => g.map(row => row[c]).reverse());
    for (let i = pRand(0, 3); i > 0; i--) grid = rotate(grid);
    if (Math.random() < 0.5) grid = grid.map(row => [...row].reverse());
    const offset = pRand(0, 5);
    grid = grid.map(row => row.map(n => n + offset));
    const sum = 15 + offset * 3;

    const row = pRand(0, 2), col = pRand(0, 2);
    const otherRow = (row + pRand(1, 2)) % 3;
    const otherCol = (col + pRand(1, 2)) % 3;
    const answer = grid[row][col];
    const shown = grid.map((cells, r) => cells.map((n, c) => {
        if (r === row && c === col) return ' ?';
        if (r === otherRow && c === otherCol) return ' _';
        return String(n).padStart(2, ' ');
    }).join('  ')).join('\n');

    return {
        op: 'cuadricula',
        mono: true,
        text: showSum
            ? `Todas las filas y columnas suman ${sum}.\n\n${shown}\n\n¿Qué número va en el ?`
            : `Todas las filas y columnas suman lo mismo.\n\n${shown}\n\n¿Qué número va en el ?`,
        answer,
        hint: showSum
            ? 'Pista: busca la fila o columna donde solo falta el ?.'
            : 'Pista: una fila está completa. Súmala para saber el total.',
        explain: `Cada línea suma ${sum}, y con los otros dos números de su línea sale ${answer}.`
    };
}

function pCrossGrid() {
    const a = pRand(1, 12), b = pRand(1, 12), c = pRand(1, 12), d = pRand(1, 12);
    const pad = n => String(n).padStart(2, ' ');
    return {
        op: 'cuadricula',
        mono: true,
        text: `Las flechas dicen cuánto suma cada fila y cada columna.\n\n${pad(a)}   _  → ${pad(a + b)}\n _   ?  → ${pad(c + d)}\n ↓   ↓\n${pad(a + c)}  ${pad(b + d)}\n\n¿Qué número va en el ?`,
        answer: d,
        hint: 'Pista: primero rellena los huecos que tienen un número al lado.',
        explain: `Arriba falta ${b} y abajo a la izquierda falta ${c}. Entonces el ? es ${c + d} − ${c} = ${d}.`
    };
}

function pBoxes() {
    const each = pRand(3, 9), boxes = pRand(2, 5);
    let asked = pRand(2, 9);
    while (asked === boxes) asked = pRand(2, 9);
    return {
        op: 'problema',
        text: `En ${boxes} cajas iguales hay ${each * boxes} lápices.\n¿Cuántos lápices hay en ${asked} cajas?`,
        answer: each * asked,
        hint: 'Pista: ¿cuántos lápices hay en una sola caja?',
        explain: `Cada caja tiene ${each}, así que ${asked} cajas tienen ${each} × ${asked} = ${each * asked}.`
    };
}

function pSumDifference() {
    const small = pRand(3, 30), diff = pRand(2, 20);
    const big = small + diff;
    return {
        op: 'problema',
        text: `Dos números suman ${small + big} y uno es ${diff} mayor que el otro.\n¿Cuál es el número mayor?`,
        answer: big,
        hint: `Pista: quita ${diff} a la suma y reparte lo que queda en dos partes iguales.`,
        explain: `${small + big} − ${diff} = ${2 * small}. La mitad es ${small}, y el mayor es ${small} + ${diff} = ${big}.`
    };
}

function pHeadsLegs() {
    const hens = pRand(1, 9), rabbits = pRand(1, 9);
    const heads = hens + rabbits, legs = 2 * hens + 4 * rabbits;
    return {
        op: 'problema',
        text: `En una granja hay gallinas y conejos.\nEn total hay ${heads} cabezas y ${legs} patas.\n¿Cuántos conejos hay?`,
        answer: rabbits,
        hint: 'Pista: imagina que todos son gallinas. ¿Cuántas patas sobran?',
        explain: `Si todos fueran gallinas habría ${heads * 2} patas. Sobran ${legs - heads * 2}, y cada conejo añade 2: son ${rabbits}.`
    };
}

function pOddSums() {
    const n = pRand(5, 9);
    const odds = Array.from({ length: n }, (_, i) => 2 * i + 1);
    return {
        op: 'patron',
        text: `1 + 3 = 4\n1 + 3 + 5 = 9\n1 + 3 + 5 + 7 = 16\n¿Cuánto da ${odds.join(' + ')}?`,
        answer: n * n,
        hint: 'Pista: mira cuántos números sumas en cada línea y el resultado.',
        explain: `Al sumar ${n} impares seguidos desde el 1 sale ${n} × ${n} = ${n * n}.`
    };
}

// --- VISIÓN ESPACIAL ---
// Las cuadrículas se dibujan con emojis.
const SPATIAL_ITEMS = [
    { e: '🍎' }, { e: '🍌' }, { e: '🍇' },
    { e: '🍓' }, { e: '🍒' }, { e: '🥕' },
    { e: '⭐' }, { e: '🌙' }, { e: '🚀' },
    { e: '⚽' }, { e: '🎈' }, { e: '🐟' },
    { e: '🐞' }, { e: '🌸' }, { e: '🍄' },
    { e: '🔔' }
];
const SPATIAL_EMPTY = '⬜';
// Direcciones en el sentido de las agujas del reloj: arriba, derecha, abajo, izquierda
const SPATIAL_DIRS = [
    { arrow: '⬆️', word: 'arriba', dr: -1, dc: 0 },
    { arrow: '➡️', word: 'a la derecha', dr: 0, dc: 1 },
    { arrow: '⬇️', word: 'abajo', dr: 1, dc: 0 },
    { arrow: '⬅️', word: 'a la izquierda', dr: 0, dc: -1 }
];

function pShuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = pRand(0, i);
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function pDrawGrid(grid) {
    return grid.map(row => row.join(' ')).join('\n');
}

// Pregunta de elegir: mezcla la respuesta con las alternativas y devuelve las opciones y el índice correcto
function pChoices(correct, distractors) {
    const choices = pShuffle([correct, ...distractors]);
    return { choices, answer: choices.indexOf(correct) };
}

function pSpatialPosition() {
    const items = pShuffle(SPATIAL_ITEMS).slice(0, 6);
    const cells = pShuffle([...items, null, null, null]);
    const grid = [0, 1, 2].map(r => cells.slice(r * 3, r * 3 + 3));
    const options = [];
    grid.forEach((row, r) => row.forEach((item, c) => {
        if (!item) return;
        SPATIAL_DIRS.forEach(dir => {
            const target = grid[r + dir.dr] && grid[r + dir.dr][c + dir.dc];
            if (target) options.push({ item, dir, target });
        });
    }));
    const { item, dir, target } = pPick(options);
    const others = items.filter(i => i !== target && i !== item);
    const { choices, answer } = pChoices(target.e, pShuffle(others).slice(0, 2).map(i => i.e));
    return {
        op: 'espacial',
        text: `${pDrawGrid(grid.map(row => row.map(i => (i ? i.e : SPATIAL_EMPTY))))}\n\n¿Qué hay justo ${dir.word} ${dir.arrow} de ${item.e}?`,
        answer,
        choices,
        hint: `Pista: pon el dedo en ${item.e} y muévelo una casilla ${dir.word}.`,
        explain: `Justo ${dir.word} de ${item.e} está ${target.e}.`
    };
}

function pSpatialWalk(steps) {
    const size = 4;
    const items = pShuffle(SPATIAL_ITEMS);
    for (;;) {
        const start = { r: pRand(0, size - 1), c: pRand(0, size - 1) };
        const moves = [];
        let { r, c } = start;
        for (let i = 0; i < steps; i++) {
            const dir = pPick(SPATIAL_DIRS.filter(d => r + d.dr >= 0 && r + d.dr < size && c + d.dc >= 0 && c + d.dc < size));
            moves.push(dir);
            r += dir.dr;
            c += dir.dc;
        }
        if (r === start.r && c === start.c) continue;

        let next = 0;
        const grid = Array.from({ length: size }, (_, gr) => Array.from({ length: size }, (_, gc) =>
            (gr === start.r && gc === start.c ? { e: '🐸' } : items[next++])));
        const target = grid[r][c];
        // Las alternativas son casillas vecinas del final: los errores típicos de un paso de más o de menos
        const near = SPATIAL_DIRS
            .map(d => grid[r + d.dr] && grid[r + d.dr][c + d.dc])
            .filter(cell => cell && cell.e !== '🐸');
        const { choices, answer } = pChoices(target.e, pShuffle(near).slice(0, 2).map(i => i.e));
        return {
            op: 'espacial',
            text: `${pDrawGrid(grid.map(row => row.map(i => i.e)))}\n\nLa 🐸 salta una casilla en cada flecha:\n${moves.map(m => m.arrow).join(' ')}\n¿Dónde llega?`,
            answer,
            choices,
            hint: 'Pista: pon el dedo en la 🐸 y muévelo flecha a flecha.',
            explain: `Siguiendo las flechas una a una, la 🐸 llega a ${target.e}.`
        };
    }
}

function pSpatialTurn(level) {
    const start = pRand(0, 3);
    const quarter = level >= 3 ? null : pPick([1, 1, 2, 3].slice(0, level === 1 ? 1 : 4));
    let turns;
    if (quarter) {
        turns = Array(quarter).fill(1);
    } else {
        turns = Array.from({ length: pRand(3, 4) }, () => pPick([1, -1]));
    }
    const end = ((start + turns.reduce((s, t) => s + t, 0)) % 4 + 4) % 4;
    const said = turns.map(t => (t === 1 ? 'derecha ↻' : 'izquierda ↺'));
    const arrows = SPATIAL_DIRS.map(d => d.arrow);
    return {
        op: 'espacial',
        text: quarter
            ? `Un robot 🤖 mira hacia ${arrows[start]}\nGira a la derecha ↻ ${quarter === 1 ? 'una vez' : `${quarter} veces`}.\n¿Hacia dónde mira ahora?`
            : `Un robot 🤖 mira hacia ${arrows[start]}\nGira: ${said.join(', ')}.\n¿Hacia dónde mira ahora?`,
        answer: end,
        choices: arrows,
        hint: 'Pista: ponte de pie y gira tú como el robot. A la derecha es como las agujas del reloj.',
        explain: quarter
            ? `Cada giro a la derecha pasa a la siguiente flecha: ⬆️ ➡️ ⬇️ ⬅️. Acaba mirando ${arrows[end]}.`
            : `Un giro a la izquierda deshace uno a la derecha. Acaba mirando ${arrows[end]}.`
    };
}

function pSpatialMirror(count) {
    const row = pShuffle(SPATIAL_ITEMS).slice(0, count).map(i => i.e);
    const mirrored = [...row].reverse();
    const shifted = [...row.slice(1), row[0]];
    const swapped = [...mirrored];
    [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
    const { choices, answer } = pChoices(mirrored.join(''), [row.join(''), count > 3 ? swapped.join('') : shifted.join('')]);
    return {
        op: 'espacial',
        text: `Pones esto delante de un espejo 🪞:\n${row.join('')}\n¿Qué ves en el espejo?`,
        answer,
        choices,
        hint: 'Pista: en el espejo, lo que está a la derecha se ve a la izquierda.',
        explain: `El espejo da la vuelta a la fila: ${mirrored.join('')}.`
    };
}

function pSpatialSquares(size) {
    let answer = 0;
    for (let k = 1; k <= size; k++) answer += (size - k + 1) ** 2;
    const grid = Array.from({ length: size }, () => Array(size).fill('🟦'));
    return {
        op: 'espacial',
        text: `${pDrawGrid(grid)}\n\n¿Cuántos cuadrados hay en total?\nCuenta también los grandes.`,
        answer,
        hint: size === 2
            ? 'Pista: cuenta los pequeños y luego mira si juntos forman uno más grande.'
            : 'Pista: cuenta por tamaños. Primero los de 1, luego los de 2×2 y por último el de 3×3.',
        explain: size === 2
            ? 'Hay 4 pequeños y 1 grande que los junta a todos: 5.'
            : 'Hay 9 pequeños, 4 de 2×2 y 1 grande: 14.'
    };
}

function pSpatialStairs() {
    const shown = pRand(2, 4), asked = shown + 1;
    const stairs = Array.from({ length: shown }, (_, i) => '🟧'.repeat(i + 1)).join('\n');
    const answer = asked * (asked + 1) / 2;
    return {
        op: 'espacial',
        text: `Esta escalera de ${shown} peldaños está hecha con cubos:\n${stairs}\n¿Cuántos cubos necesitas para una de ${asked} peldaños?`,
        answer,
        hint: `Pista: el peldaño nuevo de abajo tiene ${asked} cubos.`,
        explain: `Es la escalera de ${shown} peldaños (${answer - asked} cubos) más una fila de ${asked}: ${answer}.`
    };
}

function pSpatialDiceOpposite() {
    const top = pRand(1, 6);
    return {
        op: 'espacial',
        text: `En un dado 🎲, las caras de enfrente siempre suman 7.\nSi arriba hay ${top}, ¿cuánto hay en la cara de abajo?`,
        answer: 7 - top,
        hint: `Pista: ¿cuánto le falta a ${top} para llegar a 7?`,
        explain: `${top} + ${7 - top} = 7, así que abajo hay ${7 - top}.`
    };
}

function pSpatialDiceHidden() {
    // Una cara de cada pareja opuesta (1-6, 2-5, 3-4) se ve; las otras tres quedan escondidas
    const seen = [pPick([1, 6]), pPick([2, 5]), pPick([3, 4])];
    const total = seen.reduce((s, n) => s + n, 0);
    return {
        op: 'espacial',
        text: `Miras un dado 🎲 y ves tres caras: ${seen.join(', ')}.\nLas caras de enfrente suman 7.\n¿Cuánto suman las tres caras que no ves?`,
        answer: 21 - total,
        hint: 'Pista: detrás de cada cara que ves hay otra que suma 7 con ella.',
        explain: `Las escondidas son ${seen.map(n => 7 - n).join(', ')}, que suman ${21 - total}.`
    };
}

function pSpatialShortest() {
    const size = 5;
    for (;;) {
        const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => (Math.random() < 0.3 ? '🧱' : SPATIAL_EMPTY)));
        const free = [];
        grid.forEach((row, r) => row.forEach((cell, c) => { if (cell === SPATIAL_EMPTY) free.push({ r, c }); }));
        if (free.length < 2) continue;
        const [from, to] = pShuffle(free);
        grid[from.r][from.c] = '🐸';
        grid[to.r][to.c] = '⭐';

        // Búsqueda en anchura: el menor número de pasos sin diagonales
        const dist = grid.map(row => row.map(() => -1));
        dist[from.r][from.c] = 0;
        const queue = [from];
        while (queue.length) {
            const { r, c } = queue.shift();
            for (const d of SPATIAL_DIRS) {
                const nr = r + d.dr, nc = c + d.dc;
                if (nr < 0 || nr >= size || nc < 0 || nc >= size || dist[nr][nc] !== -1 || grid[nr][nc] === '🧱') continue;
                dist[nr][nc] = dist[r][c] + 1;
                queue.push({ r: nr, c: nc });
            }
        }
        const answer = dist[to.r][to.c];
        const straight = Math.abs(from.r - to.r) + Math.abs(from.c - to.c);
        // Que haya que rodear algún muro y que no sea demasiado largo
        if (answer < 4 || answer > 9 || answer === straight) continue;
        return {
            op: 'espacial',
            text: `${pDrawGrid(grid)}\n\nLa 🐸 quiere llegar a la ⭐ sin pisar 🧱.\nSolo se mueve ⬆️ ➡️ ⬇️ ⬅️, una casilla por paso.\n¿Cuántos pasos necesita como mínimo?`,
            answer,
            hint: 'Pista: dibuja el camino con el dedo y cuenta cada casilla que pisas.',
            explain: `El camino más corto rodea los muros y tiene ${answer} pasos.`
        };
    }
}

// Los problemas espaciales de cada nivel ocupan dos huecos, para que no dominen la partida
const SPATIAL_BY_LEVEL = {
    1: [pSpatialPosition, () => pSpatialWalk(2), () => pSpatialTurn(1)],
    2: [() => pSpatialWalk(3), () => pSpatialTurn(2), () => pSpatialMirror(3), () => pSpatialSquares(2), pSpatialStairs, pSpatialDiceOpposite],
    3: [() => pSpatialWalk(5), () => pSpatialTurn(3), () => pSpatialMirror(4), () => pSpatialSquares(3), pSpatialDiceHidden, pSpatialShortest]
};

function pSpatial(level) {
    return pPick(SPATIAL_BY_LEVEL[level])();
}

const PUZZLES_BY_LEVEL = {
    1: [
        () => pParity([pRand(2, 15), pRand(2, 15)]),
        () => pBackwards(1),
        pPatternEasy,
        pCountRange,
        pSymbolsEasy,
        () => pSpatial(1),
        () => pSpatial(1)
    ],
    2: [
        () => pParity([pRand(11, 49), pRand(11, 49), pRand(11, 49)]),
        () => pBackwards(2),
        pPatternMedium,
        pCountMultiples,
        pSymbolsMedium,
        () => pMagicSquare(true),
        pCrossGrid,
        pBoxes,
        () => pSpatial(2),
        () => pSpatial(2)
    ],
    3: [
        pParityProduct,
        () => pBackwards(3),
        pPatternHard,
        pOddSums,
        pCountDigitSum,
        pCountDigitAppears,
        pCountArrangements,
        pHandshakes,
        pSymbolsHard,
        () => pMagicSquare(false),
        pSumDifference,
        pHeadsLegs,
        () => pSpatial(3),
        () => pSpatial(3)
    ]
};

function generatePuzzle(level) {
    return pPick(PUZZLES_BY_LEVEL[level])();
}
