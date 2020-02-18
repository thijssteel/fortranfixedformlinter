// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function padding(n: number): string {
	let pad = "";
	for (let i = 0; i < n; i++) {
		pad = pad + " ";
	}
	return pad;
}

export function activate(context: vscode.ExtensionContext) {

	console.log('Fortran linter activated');


	vscode.languages.registerDocumentFormattingEditProvider('fortran_fixed-form', {
		provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] | undefined {
			const sourcematcher = /^(\s|\d)+/gm;
			const continuationmatcher = /^(\s{5}(?=\S)([^0]))/gm;
			let continuationsymbol = "$";


			const edits: vscode.TextEdit[] = [];
			let linestart = 0;
			while (linestart < document.lineCount) {
				let line = document.lineAt(linestart);
				let fulllinetext = line.text.trim();
				const indentation = line.firstNonWhitespaceCharacterIndex - 6;
				let shouldbeformatted = line.text.length > 72;
				if (line.text.slice(0,5).match(sourcematcher)) {
					let lineend = linestart;
					let lastchar = line.range.end.character;
					while (lineend + 1 < document.lineCount) {
						line = document.lineAt(lineend + 1);
						if (line.text.slice(0,6).match(continuationmatcher)) {
							// This line is a continuation line
							continuationsymbol = line.text.charAt(5);
							fulllinetext = fulllinetext + line.text.slice(6).trim();
							lastchar = line.range.end.character;
							lineend++;
							if (line.text.length > 72) {
								shouldbeformatted = true;
							}
						} else {
							break;
						}
					}

					if (shouldbeformatted) {

						let formattedlinetext = padding(6 + indentation) + fulllinetext.slice(0, 72 - 6 - indentation);
						let i = 72 - 6 - indentation;
						while (i < fulllinetext.length) {
							formattedlinetext = formattedlinetext + "\n     " + continuationsymbol + padding(indentation + 3) +
								fulllinetext.slice(i, i + (72 - 6 - indentation - 3));
							i = i + (72 - 6 - indentation - 3);
						}

						edits.push(vscode.TextEdit.replace(new vscode.Range(
							new vscode.Position(linestart, 0),
							new vscode.Position(lineend, lastchar)
						), formattedlinetext));

					}

					linestart = lineend + 1;
				} else {
					linestart++;
				}

			}

			return edits;
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
