/// <reference path="AppToolPanel.ts" />

namespace TryLinq {

    export class AppDataPanel extends AppToolPanel {

        private _part_layoutRoot: HTMLElement;
        private _part_content: HTMLElement;

        private _tableView: Juice.TableView;
        private _btnResetData: Juice.Button;
        private _defaultSourceDataHandler: () => any;
        private _isCustomData: boolean;

        constructor(template?: Juice.TemplateSource) {
            super(template);

            this.onUserDataLoaded = new Juice.EventSet<AppDataPanel, Juice.EventArgs>(this.events, "onUserDataLoaded");
            this.onResetData = new Juice.EventSet<AppDataPanel, Juice.EventArgs>(this.events, "onResetData");
        }

        protected initializeTemplate(templatedElement: Juice.TemplatedElement) {
            super.initializeTemplate(templatedElement);

            this._part_layoutRoot = templatedElement.getPart<HTMLElement>("layoutRoot").element;
            this._part_content = templatedElement.getPart<HTMLElement>("content").element;

            this._tableView = new Juice.TableView();
            this._part_content.appendChild(this._tableView.htmlElement);

            this.toolbar.addSeparator();

            let btnLoadData = new Juice.FileButton();
            btnLoadData.accept = ".json,.txt";
            btnLoadData.readType = Juice.FileReadType.Text;
            btnLoadData.readerHandler(this.btnLoadReaderHandler.bind(this));
            btnLoadData.content = `<i class="fas fa-file-download"></i>&nbsp;&nbsp;load data`;
            this.toolbar.items.add(btnLoadData);

            this._btnResetData = this.toolbar.addButton(`<i class="fas fa-poo"></i>&nbsp;&nbsp;reset`);
            this._btnResetData.isEnabled = false;
            this._btnResetData.onClick.add(this.onBtnResetDataClick, this);

            this.toolbar.addSeparator();
        }

        private btnLoadReaderHandler(reader: FileReader) {
            let data = JSON.parse(reader.result as string);
            this.customData = data;
            this.onUserDataLoaded.trigger();
        }

        private onBtnResetDataClick(s: Juice.Button, e: Juice.EventArgs) {
            if (this._isCustomData) {
                var question = new Juice.QuestionDialog("Reset data", "Reset data to default ?", Juice.QuestionDialogButtons.YesNo, (result) => {
                    if (result) {
                        this.resetData();
                    }
                });
                question.show(this.getApplication().rootElement);
            }
            this.onResetData.trigger();
        }

        private loadDefaultSourceData() {
            if (typeof this._defaultSourceDataHandler === "function") {
                let funcResult = this._defaultSourceDataHandler();
                if (typeof funcResult["then"] === "function") {
                    // Promise
                    funcResult
                        .then((res: any) => {
                            this._tableView.data = res;
                            this._btnResetData.isEnabled = false;
                            this._isCustomData = false
                            this.onResetData.trigger();
                        })
                        .catch((err: string) => {
                            Juice.MessageDialog.showMessage("Reset default data", err, this.getApplication().rootElement);
                        });
                } else {
                    this._tableView.data = funcResult;
                    this._btnResetData.isEnabled = false;
                    this._isCustomData = false
                    this.onResetData.trigger();
                }
            }
        }

        public setDefaultSourceData(v: () => any) {
            this._defaultSourceDataHandler = v;
        }

        public get customData(): any {
            return this._tableView.data;
        }
        public set customData(v: any) {
            this._tableView.data = v;
            this._btnResetData.isEnabled = !!v;
            this._isCustomData = true;
        }

        public get hasCustomData() {
            return this._isCustomData;
        }

        public resetData() {
            this._tableView.clear();
            this.loadDefaultSourceData();
        }

        public onUserDataLoaded: Juice.EventSet<AppDataPanel, Juice.EventArgs>;

        public onResetData: Juice.EventSet<AppDataPanel, Juice.EventArgs>;
    }

    Juice.Builder.defineComponent({
        baseClass: TryLinq.AppToolPanel,
        classConstructor: AppDataPanel,
        className: "AppDataPanel",
        tagName: "app-data-panel"
    });
}