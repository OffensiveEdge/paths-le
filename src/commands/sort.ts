import * as vscode from 'vscode';
import * as nls from 'vscode-nls';

const localize = nls.config({ messageFormat: nls.MessageFormat.file })();

type SortOrder = 'asc' | 'desc' | 'length-asc' | 'length-desc';

interface SortOption {
	readonly label: string;
	readonly value: SortOrder;
}

export function registerSortCommand(context: vscode.ExtensionContext): void {
	const command = vscode.commands.registerCommand(
		'paths-le.postProcess.sort',
		async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage(
					localize('runtime.sort.no-editor', 'No active editor found'),
				);
				return;
			}

			const sortOption = await promptSortOrder();
			if (!sortOption) {
				return;
			}

			const document = editor.document;
			const lines = extractLines(document.getText());
			const sorted = sortLines(lines, sortOption.value);

			await replaceDocumentContent(document, sorted);

			vscode.window.showInformationMessage(
				localize(
					'runtime.sort.success',
					'Sorted {0} paths ({1})',
					sorted.length,
					sortOption.label,
				),
			);
		},
	);

	context.subscriptions.push(command);
}

async function promptSortOrder(): Promise<SortOption | undefined> {
	const options: SortOption[] = [
		{
			label: localize('runtime.sort.pick.alpha-asc', 'Alphabetical (A → Z)'),
			value: 'asc',
		},
		{
			label: localize('runtime.sort.pick.alpha-desc', 'Alphabetical (Z → A)'),
			value: 'desc',
		},
		{
			label: localize(
				'runtime.sort.pick.length-asc',
				'By Length (Short → Long)',
			),
			value: 'length-asc',
		},
		{
			label: localize(
				'runtime.sort.pick.length-desc',
				'By Length (Long → Short)',
			),
			value: 'length-desc',
		},
	];

	return vscode.window.showQuickPick(options, {
		placeHolder: localize('runtime.sort.pick.placeholder', 'Select sort order'),
	});
}

function extractLines(text: string): string[] {
	return text
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
}

function sortLines(lines: string[], order: SortOrder): string[] {
	if (order === 'length-asc') {
		return [...lines].sort((a, b) => a.length - b.length);
	}

	if (order === 'length-desc') {
		return [...lines].sort((a, b) => b.length - a.length);
	}

	if (order === 'asc') {
		return [...lines].sort((a, b) => a.localeCompare(b));
	}

	return [...lines].sort((a, b) => b.localeCompare(a));
}

async function replaceDocumentContent(
	document: vscode.TextDocument,
	lines: string[],
): Promise<void> {
	const edit = new vscode.WorkspaceEdit();
	edit.replace(
		document.uri,
		new vscode.Range(0, 0, document.lineCount, 0),
		lines.join('\n'),
	);
	await vscode.workspace.applyEdit(edit);
}
