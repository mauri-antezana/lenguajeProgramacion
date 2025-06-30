import tokenize from './1_lexer.js';
import Parser from './2_parser.js';
import SemanticAnalyzer from './4_semanticAnalyzer.js';
import Interpreter from './3_interpreter.js';

const codeArea = document.getElementById('codeArea');
const runBtn = document.getElementById('runBtn');
const output = document.getElementById('output');

runBtn.addEventListener('click', () => {
  output.textContent = '';

  const code = codeArea.value;

  try {
    
    const tokens = tokenize(code);
    // output.textContent += 'Tokens:\n' + JSON.stringify(tokens, null, 2) + '\n\n';

    const parser = new Parser(tokens);
    const ast = parser.parseProgram();
    // output.textContent += 'AST:\n' + JSON.stringify(ast, null, 2) + '\n\n';

    const analyzer = new SemanticAnalyzer();
    analyzer.analyze(ast);
    output.textContent += 'Análisis semántico OK\n\n';

    const interpreter = new Interpreter();
    // Para capturar console.log dentro de la salida:
    const originalLog = console.log;
    console.log = (...args) => {
      output.textContent += args.join(' ') + '\n';
      originalLog.apply(console, args);
    };

    interpreter.run(ast);

    console.log = originalLog; // restaurar

  } catch (e) {
    output.textContent += 'Error: ' + e.message;
  }
});
