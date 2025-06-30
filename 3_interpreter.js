export default class Interpreter {
    constructor() {
        this.globalEnv = {};
        this.envStack = [this.globalEnv];
        this.functions = {};
    }

    get environment() {
        return this.envStack[this.envStack.length - 1];
    }

    pushEnv() {
        this.envStack.push({});
    }

    popEnv() {
        this.envStack.pop();
    }


    run(program) {
        if (!program || !Symbol.iterator in Object(program)) {
            throw new Error("Programa inválido para ejecutar");
        }

        for (const statement of program) {
            const result = this.execute(statement);
            // Si la ejecución devuelve un objeto tipo 'Return', propagamos
            if (result && result.type === 'Return') {
                return result.value;
            }
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
            case 'VariableDeclaration':
                return this.evaluateVariableDeclaration(node);
            case 'ReturnStatement':
                return this.executeReturn(node);
            default:
                throw new Error(`Tipo de instrucción no soportado: ${node.type}`);
        }
    }


    executeBlock(statements) {
        for (const stmt of statements) {
            const result = this.execute(stmt);
            
            if (result && result.type === 'Return') {
                return result;
            }
        }
    }

    executeFunctionDeclaration(node) {
        // Suponiendo que node.name es string, si es token usa node.name.value
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
                if (!(node.name in this.environment)) {
                    throw new Error(`Variable no definida: ${node.name}`);
                }
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

        if (!node.left || !node.left.name) {
            throw new Error('Lado izquierdo de asignación inválido');
        }

        // Puedes agregar validación aquí si quieres que solo asigne variables ya declaradas
        this.environment[node.left.name] = value;

        return value;
    }

    executeIf(node) {
        const condition = this.evaluate(node.condition);

        if (condition) {
            const result = this.execute(node.consequent);
            // Propagar retorno si existe (para manejar ReturnStatement)
            if (result && result.type === 'Return') {
                return result;
            }
        } else if (node.alternate) {
            const result = this.execute(node.alternate);
            if (result && result.type === 'Return') {
                return result;
            }
        }
    }

    executeWhile(node) {
        while (this.evaluate(node.condition)) {
            const result = this.execute(node.body);
            if (result && result.type === 'Return') {
                return result;  // Propagar retorno para salir del ciclo y función
            }
        }
    }

    executeFor(node) {
        this.execute(node.init);
        while (this.evaluate(node.condition)) {
            const result = this.execute(node.body);
            if (result && result.type === 'Return') {
                return result;  // Propagar retorno para salir del ciclo y función
            }
            this.evaluate(node.update);
        }
    }

    executePrint(node) {
        const value = this.evaluate(node.expression);
        console.log(value);
    }

    executeReturn(node) {
        const value = this.evaluate(node.expression);
        return { type: 'Return', value };
    }

    evaluateVariableDeclaration(node) {
        if (!node.name || !node.value) {
            throw new Error('Declaración de variable inválida');
        }
        const value = this.evaluate(node.value);
        this.environment[node.name] = value;
        return value;
    }


    evaluateFunctionCall(node) {
        const func = this.functions[node.name];
        if (!func) {
            throw new Error(`Función no definida: ${node.name}`);
        }

        this.pushEnv();

        
        node.args.forEach((arg, i) => {
            const paramName = func.params[i];
            this.environment[paramName] = this.evaluate(arg);
        });
        
        const result = this.execute(func.body);

        this.popEnv();

        return result && result.type === 'Return' ? result.value : undefined;
    }


}
