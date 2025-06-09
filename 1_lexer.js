function tokenize(input){
    const tokens = [];
    const tokenRegex = /\s*(variable|imprimir|para|\d+|[a-zA-Z_áéíóúñÁÉÍÓÚÑ]\w*|==|!=|>|<|[-+*/=();{}])\s*/g;
    let match;

    while (match = tokenRegex.exec(input)) {
        tokens.push(match[1]);
    }

    return tokens;
}

export default tokenize;