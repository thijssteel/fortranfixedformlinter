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

function getLastSplittingIndex(text: string, i1: number, i2: number): number {
	if (i2 > text.length) {
		return i2;
	}

	const splitterregex = /,|\+|\-|\*|\.and\.|\.or\.|then/gmi;
	const slice = text.slice(i1, i2);



	const matches = slice.match(splitterregex);
	if (matches) {
		const index = slice.lastIndexOf(matches[matches.length - 1]) + matches[matches.length - 1].length;

		// Prefer splitting on comma instead of operators
		const commaindex = slice.lastIndexOf(",") + 1;
		if (commaindex !== -1 && Math.abs(index - commaindex) < 12) {
			return i1 + commaindex;
		}

		return i1 + index;
	}

	return i2;
}

function getAppropriateContinuationSpacing(line: string) {
	const subroutinecallmatcher = /call|subroutine|function/gmi;
	const declarationmatcher = /^\s*(double precision|real\([^\)]*\)|complex\([^\)]*\)|integer|parameter|external|intrinsic)\s*/gmi;
	const declarationmatcher2 = /[a-z]/gmi;

	if( line.match(subroutinecallmatcher) ){
		//The line is a subroutine call, indent to the first argument
		const index = line.indexOf('(');
		if( index !== -1 ) {
			return index+2;
		}
	}
	let match = declarationmatcher.exec( line );
	if( match && match.length > 0 ){
		//The line is a group declaration, indent to first declared variable
		const index1 = match.index;
		const length = match[0].length;
		let match2 = declarationmatcher2.exec( line.slice( index1 + length ) );
		if( match2 && match2.length > 0 ) {
			const index2 = match2.index;
			return index1 + index2 + length;
		}
	}
	return 3;
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
				if (line.text.slice(0, 5).match(sourcematcher) && !line.text.includes("!")) {
					let lineend = linestart;
					let lastchar = line.range.end.character;

					// Determine the full line, including continuations
					while (lineend + 1 < document.lineCount) {
						line = document.lineAt(lineend + 1);
						if (line.text.slice(0, 6).match(continuationmatcher)) {
							// This line is a continuation line
							continuationsymbol = line.text.charAt(5);
							fulllinetext = fulllinetext + line.text.slice(6).trim();
							lastchar = line.range.end.character;
							lineend++;
						} else {
							break;
						}
					}

					// Add whitespace in some places
					let hasBeenEdited = false;
					const commamatcher = /,\s*/gm;
					const definitionmatcher = /::\s\s+/gm;
					const plusmatcher = /(?!([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?))(\s*\+\s*)/gm;
					const minusmatcher = /(?!([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?))(\s*\-\s*)/gm;
					const leftbracketmatcher = /(\(\s*)/gm;
					const rightbracketmatcher = /(\s*\))/gm;
					const equalsmatcher = /(\s*=\s*)/gm;

					let temp = fulllinetext;
					// temp = temp.replace(plusmatcher, " + ");
					// temp = temp.replace(minusmatcher, " - ");
					temp = temp.replace(commamatcher, ", ");
					temp = temp.replace(definitionmatcher, ":: ");
					temp = temp.replace(leftbracketmatcher, "( ");
					temp = temp.replace(rightbracketmatcher, " )");
					temp = temp.replace(equalsmatcher, " = ");

					// // Make some intrinsics lower case
					// const intrinsicsmatcher = /(double|precision|complex|allocatable|integer|random_number|allocate|deallocate|module|program|parameter|write|call|read|if|end|stop|do|while|then)/gmi;
					// temp = temp.replace(intrinsicsmatcher, a => a.toLowerCase());

					// make upper case
					temp = temp.toUpperCase();

					hasBeenEdited = temp !== fulllinetext;
					fulllinetext = temp;


					// Handle line continuations
					const shouldbeformatted = (fulllinetext.length > 72 - 6 - indentation) || lineend !== linestart || hasBeenEdited;

					if (shouldbeformatted) {

						let i2 = getLastSplittingIndex(fulllinetext, 0, 72 - 6 - indentation);
						let formattedlinetext = padding(6 + indentation) + fulllinetext.slice(0, i2);
						let i = i2;
						const extraindent = getAppropriateContinuationSpacing(fulllinetext);
						while (i < fulllinetext.length) {
							i2 = getLastSplittingIndex(fulllinetext, i, i + (72 - 6 - indentation - extraindent));
							formattedlinetext = formattedlinetext + "\n     " + continuationsymbol + padding(indentation + extraindent) +
								fulllinetext.slice(i, i2).trim();
							i = i2;
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
