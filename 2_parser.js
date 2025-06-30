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

    expectSymbol(value) {
        const token = this.current();
        if (token?.type === 'symbol' && token.value === value) {
            this.next();
        } else {
            throw new SyntaxError(`Se esperaba símbolo '${value}', pero se encontró '${token?.value}'`);
        }
    }

    expectKeyword(value) {
        const token = this.current();
        if (token?.type === 'keyword' && token.value === value) {
            this.next();
        } else {
            throw new SyntaxError(`Se esperaba palabra clave '${value}', pero se encontró '${token?.value}'`);
        }
    }

    expectIdentifier() {
        const token = this.current();
        if (token?.type === 'identifier') {
            this.next();
            return token.value;
        } else {
            throw new SyntaxError(`Se esperaba un identificador, pero se encontró '${token?.value}'`);
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

        if (token.type === 'keyword') {
            switch (token.value) {
                case 'variable':
                    return this.parseVariableDeclaration();
                case 'imprimir':
                    return this.parsePrintStatement();
                case 'para':
                    return this.parseForStatement();
                case 'mientras':
                    return this.parseWhileStatement();
                case 'si':
                    return this.parseIfStatement();
                case 'funcion':
                    return this.parseFunctionDeclaration();
                case 'retornar':
                    return this.parseReturnStatement();
                default:
                    // Si es una palabra reservada no reconocida, lanzar error o tratar como expresión
                    throw new SyntaxError(`Palabra reservada no soportada: ${token.value}`);
            }
        } else {
            // Si no es keyword, asumimos expresión
            const expr = this.parseExpression();
            this.expectSymbol(';');
            return {
                type: 'ExpressionStatement',
                expression: expr
            };
        }
    }


    parseVariableDeclaration() {
        this.expectKeyword('variable');        // Consume 'variable'
        const name = this.current().value;    // Nombre de la variable
        this.next();

        this.expectSymbol('=');               // Consume '='

        const value = this.parseExpression();

        this.expectSymbol(';');               // Consume ';'

        return { 
            type: 'VariableDeclaration', 
            name, 
            value
        };
    }

    parsePrintStatement() {
        this.expectKeyword('imprimir');        // Consume 'imprimir'
        this.expectSymbol('(');               // Consume '('

        const expression = this.parseExpression();

        this.expectSymbol(')');               // Consume ')'
        this.expectSymbol(';');               // Consume ';'

        return { 
            type: 'PrintStatement', 
            expression 
        };
    }

    parseForStatement() {
        this.expectKeyword('para');                        // Consume 'para'
        this.expectSymbol('(');                           // Consume '('

        const init = this.parseStatement();         // Parse variable declaration

        const condition = this.parseExpression();   // Parse condition
        this.expectSymbol(';');                           // Consume ';'

        const update = this.parseExpression();    // Parse increment expression
        this.expectSymbol(')');                           // Consume ')'

        const body = this.parseBlock();             // Parse body

        return {
            type: 'ForStatement',
            init,
            condition,
            update,
            body
        };
    }

    parseWhileStatement() {
        this.expectKeyword('mientras');
        this.expectSymbol('(');

        const condition = this.parseExpression();
        this.expectSymbol(')');

        const body = this.parseBlock();
        return {
            type: 'WhileStatement',
            condition,
            body
        };
    }

    parseIfStatement() {
        this.expectKeyword('si');
        this.expectSymbol('(');

        const condition = this.parseExpression();
        this.expectSymbol(')');

        const consequent = this.parseBlock();

        let alternate = null;
        if (this.current().value === 'sino') {
            this.next();
            alternate = this.parseBlock();
        }

        return {
            type: 'IfStatement',
            condition,
            consequent,
            alternate
        };
    }

    parseReturnStatement() {
        this.expectKeyword('retornar');

        const expression = this.parseExpression();
        this.expectSymbol(';');

        return {
            type: 'ReturnStatement',
            expression
        };
    }
    
    parseFunctionDeclaration() {
        this.expectKeyword('funcion');

        const name = this.current().value;
        this.next();

        this.expectSymbol('(');
        const params = [];

        while (this.current().value !== ')') {
            params.push(this.current().value);
            this.next();

            if (this.current().value === ',') {
                this.next(); // omitir coma
            }
        }

        this.expectSymbol(')');

        const body = this.parseBlock();

        return {
            type: 'FunctionDeclaration',
            name,
            params,
            body,
        };
    }

    parseExpression() {
        return this.parseAssignment();
    }

    parseAssignment() {
        const left = this.parseComparison();

        if (this.current().value === '=') {
            this.next();
            const right = this.parseAssignment();
            return {
                type: 'AssignmentExpression',
                left,
                right
            };
        }

        return left;
    }

    parseComparison() {
        let left = this.parseAddition();

        while (
            this.current()?.type === 'symbol' &&
            ['<', '>', '=='].includes(this.current().value)
        ) {
            const operator = this.current().value;
            this.next();
            const right = this.parseAddition();
            left = {
                type: 'BinaryExpression',
                operator,
                left,
                right
            };
        }

        return left;
    }

    parseAddition() {
        let left = this.parseMultiplication();

        while (
            this.current()?.type === 'symbol' &&
            ['+', '-'].includes(this.current().value)
        ) {
            const operator = this.current().value;
            this.next();
            const right = this.parseMultiplication();
            left = {
                type: 'BinaryExpression',
                operator,
                left,
                right
            };
        }

        return left;
    }

    parseMultiplication() {
        let left = this.parsePrimary();

        while (
            this.current()?.type === 'symbol' &&
            ['*', '/'].includes(this.current().value)
        ) {
            const operator = this.current().value;
            this.next();
            const right = this.parsePrimary();
            left = {
                type: 'BinaryExpression',
                operator,
                left,
                right
            };
        }

        return left;
    }

    parsePrimary() {
        const token = this.current();

        if (!token) {
            throw new SyntaxError("Fin inesperado de entrada");
        }

        // Paréntesis: expresión agrupada
        if (token.type === 'symbol' && token.value === '(') {
            this.next();
            const expr = this.parseExpression();
            this.expectSymbol(')');
            return expr;
        }

        // Literal numérico
        if (token.type === 'number') {
            this.next();
            return {
                type: 'Literal',
                value: token.value
            };
        }

        // Literal string
        if (token.type === 'string') {
            this.next();
            return {
                type: 'Literal',
                value: token.value
            };
        }

        // Identificador (variable o llamada a función)
        if (token.type === 'identifier') {
            const name = token.value;
            this.next();

            // Llamada a función
            if (this.current()?.type === 'symbol' && this.current().value === '(') {
                this.next(); // consumir '('
                const args = [];

                while (this.current()?.type !== 'symbol' || this.current()?.value !== ')') {
                    args.push(this.parseExpression());

                    if (this.current()?.type === 'symbol' && this.current().value === ',') {
                        this.next(); // omitir coma
                    } else {
                        break;
                    }
                }

                this.expectSymbol(')');

                return {
                    type: 'FunctionCall',
                    name,
                    args
                };
            }

            // Variable
            return {
                type: 'Identifier',
                name
            };
        }

        throw new SyntaxError(`Expresión no válida: '${token?.value}'`);
    }

    parseBlock() {
        this.expectSymbol('{');

        const body = [];

        while (this.current().value !== '}') {
            if (this.position >= this.tokens.length) {
                throw new SyntaxError("Bloque sin cerrar: falta '}'");
            }

            body.push(this.parseStatement());
        }

        this.expectSymbol('}');

        return {
            type: 'BlockStatement',
            body
        };
    }
}