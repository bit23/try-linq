
namespace TryLinq {

	declare var ace: any;

	let JsonEditDialogContentTemplate = document.createElement("template");
	JsonEditDialogContentTemplate.innerHTML = /*html*/ `
	<div template-part="editorContainer" style="height: 100%; width: 100%; display: flex; flex-direction: column; justify-content: stretch; align-items: stretch;">
	</div>
	`;

	let JsonEditDialogButtonsTemplate = document.createElement("template");
	JsonEditDialogButtonsTemplate.innerHTML = /*html*/ `
	<div template-part="buttonsStrip" style="text-align: right;">
		<button template-part="buttonCancel" class="jui-button json-editor-btn-cancel" style="margin-right: 8px; min-width: 75px;">Cancel</button>
		<button template-part="buttonOk" class="jui-button json-editor-btn-ok" style="min-width: 75px;">Ok</button>
	</div>
	`;

	export class JsonEditDialog extends Juice.ModalDialog {

		private _editor: any;
		private _jsonData: string = null;
		private part_editorContainer: HTMLTextAreaElement;

		constructor(templateSource?: Juice.TemplateSource) {
			super("Edit Data", templateSource);
		}

		protected initializeTemplate(templatedElement: Juice.TemplatedElement) {
            super.initializeTemplate(templatedElement);

			templatedElement.withPartElement<HTMLElement>("dialog", (element) => {
				element.style.width = "80%";
				element.style.height = "80%";
			});

			let contentTemplate = Juice.Template.from(JsonEditDialogContentTemplate.outerHTML);
			let contentTemplatedElement = contentTemplate.importTemplate();
			this.part_editorContainer = contentTemplatedElement.getPart<HTMLTextAreaElement>("editorContainer").element;

			// if (this._jsonData != null) {
			// 	this.part_editorContainer.textContent = this._jsonData;
			// }
			this.setContent(contentTemplatedElement.rootElement);

			this._editor = ace.edit(this.part_editorContainer);
			this._editor.session.setMode("ace/mode/json5");

			let buttonsStripTemplate = Juice.Template.from(JsonEditDialogButtonsTemplate.outerHTML);
			let buttonsStripTemplateElement = buttonsStripTemplate.importTemplate();
			let buttonsStripElement = buttonsStripTemplateElement.getPart<HTMLElement>("buttonsStrip").element;

			let buttonsContainer = templatedElement.getPart<HTMLElement>("buttons").element;
			buttonsContainer.appendChild(buttonsStripElement);

			buttonsStripTemplateElement.withPartElement<HTMLElement>("buttonCancel", (element) => {
				element.addEventListener("click", (e) => {
					this.dialogResult = false;
					this.close();
				});
			});
			buttonsStripTemplateElement.withPartElement<HTMLElement>("buttonOk", (element) => {
				element.addEventListener("click", (e) => {
					this.dialogResult = true;
					this.close();
				});
			});
		}

		// override
		protected onDialogClosing(args: Juice.DialogClosingEventArgs) {

			if (!!this.dialogResult) {
				const newData = this._editor.getValue();
				try {
					const jsonData = JSON.parse(newData);
					this._jsonData = newData;
					args.cancel = false;
				}
				catch(err) {
					args.cancel = true;
				}
			}

			super.onDialogClosing(args);
		}

		public setEditorTheme(themePath: string) {
            this._editor.setTheme(themePath);
        }

		public get jsonData() {
			return this._jsonData;
		}
		public set jsonData(v: string) {
			this._jsonData = v;
			if (this._editor != null) {
				this._editor.setValue(this._jsonData);
			}
		}
	}
}