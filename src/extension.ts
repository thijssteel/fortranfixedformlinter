// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function padding(n: number): string{
	let pad = "";
	for(let i=0;i<n;i++){
		pad = pad + " ";
	}
	return pad;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Fortran linter activated');
		

	vscode.languages.registerDocumentFormattingEditProvider('fortran_fixed-form', {
		provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] | undefined {
			for(let i=0;i<document.lineCount;i++){
				const line = document.lineAt(i);
				if(!line.text.startsWith("*")){
					// Not a comment line
					if(line.text.length > 72) {
						return [
							vscode.TextEdit.replace(line.range, line.text.slice(0,71)),
							vscode.TextEdit.insert(line.range.end, "\n     $" + padding(line.firstNonWhitespaceCharacterIndex - 6) + line.text.slice(72)),
						];
					}
				}
			}
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
