export default class Parser {
    constructor(tokens){
        this.tokens = tokens;
        this.position = 0;
    }

    current() {
        return this.tokens[this.position];
    }

    next() {
        this.position++;
    }

    expect(value) {
        if (this.current() == value) {
            this.next();
        } else {
            throw new SyntaxError(`Se esperaba '${value}', pero se encontro '${this.current()}'`);
        }
    }

    parseProgram() {
        const statementes = [];

        while (this.position < this.tokens.length) {
            statementes.push(this.parseStatement());
        }

        return statementes;
    }

    parseStatement() {
        const token = this.current();

        if (token === 'variable') {
            return this.parseVariableDeclaration();
        } else if (token === 'imprimir') {
            return this.parsePrintStatement();
        } else {
            throw new SyntaxError(`Instruccion desconocida: ${token}`);
        }
    }

    parseVariableDeclaration() {
        this.expect('variable');        // Consume 'variable'
        const name = this.current();    // Nombre de la variable
        this.next();

        this.expect('=');               // Consume '='
        
        const value = this.parseExpression();

        this.expect(';');               // Consume ';'

        return { 
            type: 'VariableDeclaration', 
            name, 
            value
        };
    }

    parsePrintStatement() {
        this.expect('imprimir');        // Consume 'imprimir'
        this.expect('(');               // Consume '('
        
        const expression = this.parseExpression();

        this.expect(')');               // Consume ')'
        this.expect(';');               // Consume ';'

        return { 
            type: 'PrintStatement', 
            expression 
        };
    }

    parseExpression() {
        let left = this.parsePrimary();

        while (this.current() === '+' || this.current() === '-' || this.current() === '*' || this.current() === '/') {
            const operator = this.current();
            this.next();
            const right = this.parsePrimary();
            left = {
                type: 'BinaryExpression',
                operator,
                left,
                right
            };

            return left;
        }
    }

    parsePrimary() {
        const token = this.current();

        // Numero
        if (/^\d+$/.test(token)) {
            this.next();
            return {
                type: 'NumeroLiteral',
                value: Number(token)
            };
        }

        // Identificador 
        if (/^[a-zA-Z_áéíóúñÁÉÍÓÚÑ]\w*$/.test(token)) {
            this.next();
            return {
                type: 'Identifier',
                name: token
            };
        }

        throw new SyntaxError(`Token inesperado en expresion: ${token}`)
    }
}
