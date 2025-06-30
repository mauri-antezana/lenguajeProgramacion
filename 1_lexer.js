const keywords = ['si', 'sino', 'mientras', 'para', 'imprimir', 'funcion', 'retornar','variable'];

function tokenize(code) {
    const tokens = [];
    const regex = /\s*("(?:[^"\\]|\\.)*"|[a-zA-Z_]\w*|\d+|==|<=|>=|!=|[{}();=<>+\-*/])/g;

    let match;
    while ((match = regex.exec(code)) !== null) {
        const token = match[1];

        if (token.startsWith('"') && token.endsWith('"')) {
            tokens.push({ type: 'string', value: token.slice(1, -1) });
        }
        else if (keywords.includes(token)) {
            tokens.push({ type: 'keyword', value: token });
        }
        else if (!isNaN(token)) {
            tokens.push({ type: 'number', value: Number(token) });
        }
        else if (/^[a-zA-Z_]\w*$/.test(token)) {
            tokens.push({ type: 'identifier', value: token });
        }
        else {
            tokens.push({ type: 'symbol', value: token }); // operadores y puntuación
        }
    }

    return tokens;
}

export default tokenize;
