export default class Interpreter {
    constructor() {
        this.environment = {};
        this.functions = {};
    }

    run(program) {
        for (const statement of program) {
            this.execute(statement);
        }
    }

    execute(node) {
        switch (node.type) {
            case 'IfStatement':
                return this.executeIf(node);
            case 'WhileStatement':
                return this.executeWhile(node);
            case 'ForStatement':
                return this.executeFor(node);
            case 'PrintStatement':
                return this.executePrint(node);
            case 'ExpressionStatement':
                return this.evaluate(node.expression);
            case 'BlockStatement':
                return this.executeBlock(node.body);
            case 'FunctionDeclaration':
                return this.executeFunctionDeclaration(node);
            default:
                throw new Error(`Tipo de instrucción no soportado: ${node.type}`);
        }
    }

    executeBlock(statements) {
        for (const stmt of statements) {
            this.execute(stmt);
        }
    }

    executeFunctionDeclaration(node) {
        this.functions[node.name] = {
            params: node.params,
            body: node.body
        };
    }

    evaluate(node) {
        switch (node.type) {
            case 'BinaryExpression':
                return this.evaluateBinary(node);
            case 'AssignmentExpression':
                return this.evaluateAssignment(node);
            case 'Identifier':
                return this.environment[node.name];
            case 'Literal':
                return node.value;
            case 'FunctionCall':
                return this.evaluateFunctionCall(node);
            default:
                throw new Error(`Expresión no soportada: ${node.type}`);
        }
    }

    evaluateBinary(node) {
        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);
        switch (node.operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '<': return left < right;
            case '>': return left > right;
            case '==': return left === right;
            case '!=': return left !== right;
            default:
                throw new Error(`Operador no soportado: ${node.operator}`);
        }
    }

    evaluateAssignment(node) {
        const value = this.evaluate(node.right);
        this.environment[node.left.name] = value;
        return value;
    }

    executeIf(node) {
        const condition = this.evaluate(node.condition);
        if (condition) {
            this.execute(node.consequent);
        } else if (node.alternate) {
            this.execute(node.alternate);
        }
    }

    executeWhile(node) {
        while (this.evaluate(node.condition)) {
            this.execute(node.body);
        }
    }

    executeFor(node) {
        this.execute(node.init);
        while (this.evaluate(node.condition)) {
            this.execute(node.body);
            this.evaluate(node.update);
        }
    }

    executePrint(node) {
        const value = this.evaluate(node.expression);
        console.log(value);
    }

    evaluateFunctionCall(node) {
        const func = this.functions[node.name];

        if (!func) {
            throw new Error(`Función no definida: ${node.name}`);
        }

        // Guardar el entorno actual
        const previousEnv = { ...this.environment };

        // Evaluar argumentos y asignarlos a los parámetros de la función
        node.args.forEach((arg, index) => {
            const paramName = func.params[index];
            const argValue = this.evaluate(arg);
            this.environment[paramName] = argValue;
        });

        // Ejecutar el cuerpo de la función
        this.execute(func.body);

        // Restaurar el entorno anterior
        this.environment = previousEnv;
    }

}
