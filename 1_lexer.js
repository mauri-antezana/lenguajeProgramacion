const keywords = ['si', 'sino', 'mientras', 'para', 'imprimir'];

function tokenize(code) {
    const tokens = [];
    const regex = /\s*("(?:[^"\\]|\\.)*"|[a-zA-Z_]\w*|\d+|==|<=|>=|!=|[{}();=<>+\-*/])/g;

    let match;
    while ((match = regex.exec(code)) !== null) {
        const token = match[1];

        // String literal
        if (token.startsWith('"') && token.endsWith('"')) {
            const value = token.slice(1, -1); // quitar comillas
            tokens.push({ type: 'string', value });
        }

        // Keyword
        else if (keywords.includes(token)) {
            tokens.push(token);
        }

        // Número
        else if (!isNaN(token)) {
            tokens.push(token);
        }

        // Identificador u operador
        else {
            tokens.push(token);
        }
    }

    return tokens;
}

export default tokenize;
