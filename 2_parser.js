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
        } else if (token === 'para') {
            return this.parseForStatement();
        } else if (token === 'mientras'){
            return this.parseWhileStatement();
        } else if (token === 'si') {
            return this.parseIfStatement(); 
        } else if (token === 'funcion') {
            return this.parseFunctionDeclaration(); 
        } else {
            // Cualquier otra cosa es una expresión (como asignaciones)
            const expr = this.parseExpression();
            this.expect(';');
            return {
                type: 'ExpressionStatement',
                expression: expr
            };
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

    parseForStatement() {
        this.expect('para');                        // Consume 'para'
        this.expect('(');                           // Consume '('

        const init = this.parseStatement();         // Parse variable declaration

        const condition = this.parseExpression();   // Parse condition
        this.expect(';');                           // Consume ';'

        const update = this.parseExpression();    // Parse increment expression
        this.expect(')');                           // Consume ')'

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
        this.expect('mientras');
        this.expect('(');

        const condition = this.parseExpression();
        this.expect(')');

        const body = this.parseBlock();
        return {
            type: 'WhileStatement',
            condition,
            body
        };
    }

    parseIfStatement() {
        this.expect('si');
        this.expect('(');

        const condition = this.parseExpression();
        this.expect(')');

        const consequent = this.parseBlock();

        let alternate = null;
        if (this.current() === 'sino') {
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

    parseFunctionDeclaration() {
        this.expect('funcion');

        const name = this.current();
        this.next();

        this.expect('(');
        const params = [];

        while (this.current() !== ')') {
            params.push(this.current());
            this.next();

            if (this.current() === ',') {
                this.next(); // omitir coma
            }
        }

        this.expect(')');

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

        if (this.current() === '=') {
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

        while (['<', '>', '=='].includes(this.current())) {
            const operator = this.current();
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

        while (['+', '-'].includes(this.current())) {
            const operator = this.current();
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

        while (['*', '/'].includes(this.current())) {
            const operator = this.current();
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

        if (token === '(') {
            this.next();
            const expr = this.parseExpression();
            this.expect(')');
            return expr;
        }

        // Número
        if (!isNaN(token)) {
            this.next();
            return {
                type: 'Literal',
                value: Number(token)
            };
        }

        // Cadena (si estás manejando strings como objetos tokenizados)
        if (typeof token === 'object' && token.type === 'string') {
            this.next();
            return {
                type: 'Literal',
                value: token.value,
            };
        }

        // Identificador (variable o función)
        if (/^[a-zA-Z_]\w*$/.test(token)) {
            const name = token;
            this.next();

            // 👉 Si después del identificador viene '(', es una función
            if (this.current() === '(') {
                this.next(); // '('
                const args = [];

                if (this.current() !== ')') {
                    do {
                        args.push(this.parseExpression());
                    } while (this.current() === ',' && this.next());
                }

                this.expect(')');
                return {
                    type: 'FunctionCall',
                    name,
                    args
                };
            }

            // Si no hay paréntesis, es una variable
            return {
                type: 'Identifier',
                name
            };
        }

        throw new SyntaxError(`Expresión no válida: '${token}'`);
    }


    parseBlock() {
        this.expect('{');

        const body = [];

        while (this.current() !== '}') {
            if (this.position >= this.tokens.length) {
                throw new SyntaxError("Bloque sin cerrar: falta '}'");
            }

            body.push(this.parseStatement());
        }

        this.expect('}');

        return {
            type: 'BlockStatement',
            body
        };
    }
}