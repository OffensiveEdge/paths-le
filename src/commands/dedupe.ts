import * as vscode from 'vscode';
import * as nls from 'vscode-nls';

const localize = nls.config({ messageFormat: nls.MessageFormat.file })();

export function registerDedupeCommand(context: vscode.ExtensionContext): void {
	const command = vscode.commands.registerCommand(
		'paths-le.postProcess.dedupe',
		async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage(
					localize('runtime.dedupe.no-editor', 'No active editor found'),
				);
				return;
			}

			const document = editor.document;
			const text = document.getText();
			const lines = text.split('\n').map((line) => line.trim());

			const deduped = deduplicateLines(lines);

			const edit = new vscode.WorkspaceEdit();
			edit.replace(
				document.uri,
				new vscode.Range(0, 0, document.lineCount, 0),
				deduped.join('\n'),
			);
			await vscode.workspace.applyEdit(edit);

			const removedCount = lines.length - deduped.length;
			vscode.window.showInformationMessage(
				localize(
					'runtime.dedupe.success',
					'Removed {0} duplicate paths ({1} remaining)',
					removedCount,
					deduped.length,
				),
			);
		},
	);

	context.subscriptions.push(command);
}

function deduplicateLines(lines: string[]): string[] {
	const seen = new Set<string>();
	const deduped: string[] = [];

	for (const line of lines) {
		if (line === '' || seen.has(line)) {
			continue;
		}

		seen.add(line);
		deduped.push(line);
	}

	return deduped;
}
