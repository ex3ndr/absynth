export function forward(index?: number | string) {
    if (index) {
        return '$$ = $' + index + ';';
    }
    return '$$ = $1;';
}

export function location(start?: number | string, end?: number | string) {
    let s = start || 1;
    let e = end || 1;
    return 'first_column: @' + s + '.first_column, ' +
        'first_line: @' + s + '.first_line, ' +
        'last_column: @' + e + '.last_column, ' +
        'last_line: @' + e + '.last_line';
}