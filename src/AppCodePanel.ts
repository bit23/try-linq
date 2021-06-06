/// <reference path="AppToolPanel.ts" />

namespace TryLinq {

    declare var ace: any;

    export class AppCodePanel extends AppToolPanel {

        // TODO inherit and manipulate template
        protected static readonly DefaultAppCodePanelStyles = `${AppToolPanel.DefaultAppToolPanelStyles}\n
    .app-code-panel-footer {
        display: flex;
        flex-direction: row;
    }
    
    .app-code-panel-footer-info {
        width: auto;
        flex-grow: 1;
    }`;

        protected static readonly DefaultAppCodePanelHtmlTemplate = /*html*/ `
    <template template-class="AppCodePanel">
        <div template-part="layoutRoot" class="app-tool-panel">
            <div template-part="toolbar" class="app-tool-panel-toolbar"></div>
            <div template-part="content" class="app-tool-panel-content"></div>
            <div template-part="footer" class="app-code-panel-footer">
                <div class="app-code-panel-footer-info">
                    <span>
                        <span style="display: inline-block; margin-right: 10px;">Construction &nbsp;<b id="enumerableConstruction">0 ms</b></span>
                        <span style="display: inline-block; margin-right: 10px;">Reading &nbsp;<b id="enumerableReading">0 ms</b></span>
                        <span style="display: inline-block; margin-right: 10px;">Total time: &nbsp;<b id="totalTime">0 ms</b></span>
                    </span>
                </div>
                <div template-part="buttonsContainer" class="app-code-panel-footer-butttons">
                </div>
            </div>
        </div>
    </template>`;

        private static readonly DefaultAppCodePanelTemplate = `<style>\n${AppCodePanel.DefaultAppCodePanelStyles}\n</style>\n${AppCodePanel.DefaultAppCodePanelHtmlTemplate}`;

        private _part_layoutRoot?: HTMLElement;
        private _part_content?: HTMLElement;
        private _part_footer?: HTMLElement;
        private _part_buttonsContainer?: HTMLElement;

        private _editor: any;
        private _btnRun?: Juice.Button;

        constructor(template?: Juice.TemplateSource) {
            super(template || AppCodePanel.DefaultAppCodePanelTemplate);

            //CssLoader.from(AppCodePanel.DefaultAppCodePanelStyles + " ");
            this.onUserCodeLoaded = new Juice.EventSet<AppCodePanel, Juice.EventArgs>(this.events, "onUserCodeLoaded");
            this.onButtonResetCodeClick = new Juice.EventSet<AppCodePanel, Juice.EventArgs>(this.events, "onButtonResetCodeClick");
            this.onButtonRunClick = new Juice.EventSet<AppCodePanel, Juice.EventArgs>(this.events, "onButtonRunClick");
        }

        protected initializeTemplate(templatedElement: Juice.TemplatedElement) {
            super.initializeTemplate(templatedElement);

            this._part_layoutRoot = templatedElement.getPart<HTMLElement>("layoutRoot").element;
            this._part_content = templatedElement.getPart<HTMLElement>("content").element;
            this._part_footer = templatedElement.getPart<HTMLElement>("footer").element;
            this._part_buttonsContainer = templatedElement.getPart<HTMLElement>("buttonsContainer").element;

            this._btnRun = new Juice.Button();
            this._btnRun.content = "Run";
            this._btnRun.onClick.add((s, e) => this.events.trigger("onButtonRunClick"), this);
            this._btnRun.appendToHtmlElement(this._part_buttonsContainer);

            this._editor = ace.edit(this._part_content);
            this._editor.session.setMode("ace/mode/javascript");

			// let popupContainer = new Juice.HtmlContainer();
			// let popupButton = new Juice.Button();
			// popupButton.content = '<i class="fa fa-chevron-down"></i>';
			// popupButton.onClick.add((s,e) => popup.isPopUpOpen = !popup.isPopUpOpen);
			// let popup = new Juice.PopUp();
			// popup.content = "popup content";
			// popupContainer.addContent(popupButton.htmlElement, popup.htmlElement);
			// this.toolbar.items.add(popupContainer);

			this.toolbar.addSeparator();

			let snippetLabel = this.toolbar.addLabel("load snippet");
			//(snippetLabel.htmlElement as HTMLElement).style.marginRight = "5px";

			let snippetSelector = document.createElement("select");
			let opt = document.createElement("option");
			opt.text = "-";
			snippetSelector.appendChild(opt);
			for (const snippet of CodeSnippets.allSnippets) {
				opt = document.createElement("option");
				opt.value = snippet.code;
				opt.text = snippet.name;
				snippetSelector.appendChild(opt);
			}
			snippetSelector.addEventListener("change", (e) => btnAddSnippet.isEnabled = snippetSelector.selectedIndex > 0)

			let htmlSelect = new Juice.HtmlContainer();
			htmlSelect.addContent(snippetSelector);
			this.toolbar.items.add(htmlSelect);

			let btnAddSnippet = this.toolbar.addButton(`<i class="fas fa-check"></i>`);
			btnAddSnippet.isEnabled = false;
            btnAddSnippet.onClick.add((s, e) => {
				let snippetCode = snippetSelector.selectedOptions[0].value;
				//this._editor.insert(snippetCode);
				this.code = snippetCode;
			});

            this.toolbar.addSeparator();

            let btnLoadCode = new Juice.FileButton();
            btnLoadCode.accept = ".js,.txt";
            btnLoadCode.readType = Juice.FileReadType.Text;
            btnLoadCode.readerHandler(reader => {
                this.code = reader.result as string;
                this.onUserCodeLoaded.trigger();
            });
            btnLoadCode.content = `<i class="fas fa-file-download"></i>&nbsp;&nbsp;load code`;
            this.toolbar.items.add(btnLoadCode);

            let btnResetCode = this.toolbar.addButton(`<i class="fas fa-poo"></i>&nbsp;&nbsp;reset`);
            btnResetCode.onClick.add(() => this.onButtonResetCodeClick.trigger());

            this.toolbar.addSeparator();
        }

        public get code(): string {
            return (this._editor.getValue() as string).trim();
        }
        public set code(text: string) {
            this._editor.setValue(text);
        }

        public setEditorTheme(themePath: string) {
            this._editor.setTheme(themePath);
        }

        public onUserCodeLoaded: Juice.EventSet<AppCodePanel, Juice.EventArgs>;

        public onButtonResetCodeClick: Juice.EventSet<AppCodePanel, Juice.EventArgs>;

        public onButtonRunClick: Juice.EventSet<AppCodePanel, Juice.EventArgs>;
    }

    Juice.Builder.defineComponent({
        baseClass: TryLinq.AppToolPanel,
        classConstructor: AppCodePanel,
        className: "AppCodePanel",
        tagName: "app-code-panel"
    });
}