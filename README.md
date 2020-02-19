# fixedformfortranlinter README

Just a small extension that does some formatting for fixed form fortran.

## Features

If a line exceeds the 72 column limit, it will be split over two lines and a line continuation character is added. Some attempt at determining the line continuation character is made, with "$" taken as the default.

If a line that is spread over multiple lines can be shortened, the formatter will do so.

It also removes whitespace before and after ",", "+", "-" and "*". This is a stylistic choice, defended as follows: less characters -> less line continuations -> more readable code

## Known Issues

Assumes indentation with spaces and and indentation size of 3, does not understand fortran so cannot do stuff like smart indentation or selective formatting.

No option to disable the separate features is provided

Only line continuations directly after the previous line are recognized

## Release Notes

### 0.0.2

With this release, the formatter also removes whitespace between function arguments and operators.

### 0.0.1

Initial release, only features automatic line continuation.

-----------------------------------------------------------------------------------------------------------

<!-- ## Working with Markdown

**Note:** You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!** -->
