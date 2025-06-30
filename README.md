# Mini Language + Web IDE

This project is a custom **programming language** (with Spanish-style syntax) that includes:

- A **lexer**, **parser**, and **semantic analyzer**
- An **interpreter** that runs the AST
- A lightweight **web-based IDE** to write and execute code in real time

---

## Features

- Spanish keywords (`variable`, `si`, `mientras`, `imprimir`, `funcion`, etc.)
- Control flow: `if`, `else`, `while`, `for`
- Function definitions and calls
- Variable declarations and arithmetic expressions
- Semantic analysis with pre-execution error checking
- Simple web IDE (HTML + JS) to run code directly in the browser

---

## How to Use

### Requirements

- A modern web browser
- A local server (e.g., Live Server extension or `python -m http.server`)

### Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```
2. Open index.html with a local server

3. Write code in the text area and click "Run"

---

## Project Structure

```less
root
├── 1_lexer.js             // Lexical analyzer
├── 2_parser.js            // Syntax parser
├── 3_interpreter.js       // AST interpreter
├── 4_semanticAnalyzer.js  // Semantic analyzer
├── main.js                // Web IDE logic
├── index.html             // IDE UI
├── test.code              // Test code sample
└── README.md              // This file
```

---

## Notes

This project is for educational and experimental purposes.

Advanced features like type checking and precise error lines are not included yet.

You can extend it with support for types, arrays, classes, or custom standard libraries.

---

## License

This project is licensed under the [MIT License](./LICENSE).
