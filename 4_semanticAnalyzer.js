export default class SemanticAnalyzer {
    constructor() {
        this.scopes = [{}]; // Stack de ámbitos: cada uno es un objeto { variables, funciones }
    }

    currentScope() {
        return this.scopes[this.scopes.length - 1];
    }

    pushScope() {
        this.scopes.push({});
    }

    popScope() {
        this.scopes.pop();
    }

    analyze(program) {
        for (const node of program) {
            this.checkNode(node);
        }
    }

    checkNode(node) {
        switch(node.type) {
            case 'VariableDeclaration':
                this.checkVariableDeclaration(node);
                break;
            case 'FunctionDeclaration':
                this.checkFunctionDeclaration(node);
                break;
            case 'ExpressionStatement':
                this.checkExpression(node.expression);
                break;
            case 'PrintStatement':
                this.checkExpression(node.expression);
                break;
            case 'IfStatement':
                this.checkIfStatement(node);
                break;
            case 'WhileStatement':
                this.checkWhileStatement(node);
                break;
            case 'ForStatement':
                this.checkForStatement(node);
                break;
            case 'BlockStatement':
                this.pushScope();
                for (const stmt of node.body) {
                    this.checkNode(stmt);
                }
                this.popScope();
                break;
            case 'ReturnStatement':
                this.checkExpression(node.expression);
                break;
            default:
                throw new Error(`Nodo no soportado en análisis semántico: ${node.type}`);
        }
    }

    checkVariableDeclaration(node) {
        const scope = this.currentScope();
        if (scope[node.name]) {
            throw new Error(`Variable '${node.name}' ya declarada en este ámbito`);
        }
        // Declaramos variable en ámbito actual
        scope[node.name] = 'variable';
        this.checkExpression(node.value);
    }

    checkFunctionDeclaration(node) {
        const scope = this.currentScope();
        if (scope[node.name]) {
            throw new Error(`Función '${node.name}' ya declarada en este ámbito`);
        }
        scope[node.name] = {
            type: 'function',
            params: node.params
        };

        this.pushScope();
        // Declaramos parámetros como variables locales
        const funcScope = this.currentScope();
        for (const param of node.params) {
            funcScope[param] = 'variable';
        }
        this.checkNode(node.body);
        this.popScope();
    }

    checkIfStatement(node) {
        this.checkExpression(node.condition);
        this.checkNode(node.consequent);
        if (node.alternate) {
            this.checkNode(node.alternate);
        }
    }

    checkWhileStatement(node) {
        this.checkExpression(node.condition);
        this.checkNode(node.body);
    }

    checkForStatement(node) {
        this.pushScope();
        this.checkNode(node.init);
        this.checkExpression(node.condition);
        this.checkExpression(node.update);
        this.checkNode(node.body);
        this.popScope();
    }

    checkExpression(node) {
        switch(node.type) {
            case 'BinaryExpression':
                this.checkExpression(node.left);
                this.checkExpression(node.right);
                break;
            case 'AssignmentExpression':
                this.checkAssignment(node);
                break;
            case 'Identifier':
                this.checkIdentifier(node);
                break;
            case 'Literal':
                // Literales no requieren chequeo semántico
                break;
            case 'FunctionCall':
                this.checkFunctionCall(node);
                break;
            default:
                throw new Error(`Expresión no soportada en análisis semántico: ${node.type}`);
        }
    }

    checkAssignment(node) {
        this.checkIdentifier(node.left);
        this.checkExpression(node.right);
    }

    checkIdentifier(node) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i][node.name]) return; // Encontrado en algún ámbito
        }
        throw new Error(`Variable no declarada: ${node.name}`);
    }

    checkFunctionCall(node) {
        let func = null;
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            const entry = this.scopes[i][node.name];
            if (entry && entry.type === 'function') {
                func = entry;
                break;
            }
        }
        if (!func) {
            throw new Error(`Función no declarada: ${node.name}`);
        }
        if (func.params.length !== node.args.length) {
            throw new Error(`La función '${node.name}' espera ${func.params.length} argumentos, pero recibió ${node.args.length}`);
        }
        for (const arg of node.args) {
            this.checkExpression(arg);
        }
    }
}
