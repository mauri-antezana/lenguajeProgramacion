export default class Interpreter {
    constructor() {
        this.environment = {};
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
            default:
                throw new Error(`Tipo de instrucción no soportado: ${node.type}`);
        }
    }

    executeBlock(statements) {
        for (const stmt of statements) {
            this.execute(stmt);
        }
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

}
