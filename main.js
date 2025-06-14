import fs from 'fs';
import tokenize from './1_lexer.js';
import Parser  from './2_parser.js';
import Interpreter from './3_interpreter.js';

const code = fs.readFileSync('test.code', 'utf-8');

const tokens = tokenize(code);
console.log('Tokens: ', tokens);

const parser = new Parser(tokens);
const ast = parser.parseProgram();

console.log('AST: ', JSON.stringify(ast, null, 2));

// Ejecutar el código
const interpreter = new Interpreter();
interpreter.run(ast);