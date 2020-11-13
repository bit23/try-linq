
namespace TryLinq {

    export class AppResultsPanel extends AppToolPanel {

        private _part_layoutRoot: HTMLElement;
        private _part_content: HTMLElement;

        private _tableView: Juice.TableView;
        private _btnClearResult: Juice.Button;
        private _btnUseResultAsData: Juice.Button;
        private _btnExportResult: Juice.Button;
        private _lblElapsedTime: Juice.HtmlContainer;

        constructor(template?: Juice.TemplateSource) {
            super(template);
            this.onDataCleared = new Juice.EventSet<AppResultsPanel, Juice.EventArgs>(this.events, "onDataCleared");
            this.onButtonUseAsDataClick = new Juice.EventSet<AppResultsPanel, Juice.EventArgs>(this.events, "onButtonUseAsDataClick");
            this.onButtonExportClick = new Juice.EventSet<AppResultsPanel, Juice.EventArgs>(this.events, "onButtonExportClick");
        }

        protected initializeTemplate(templatedElement: Juice.TemplatedElement) {
            super.initializeTemplate(templatedElement);

            this._part_layoutRoot = templatedElement.getPart<HTMLElement>("layoutRoot").element;
            this._part_content = templatedElement.getPart<HTMLElement>("content").element;

            this._tableView = new Juice.TableView();
            this._part_content.appendChild(this._tableView.htmlElement);

            this.toolbar.addSeparator();

            this._btnClearResult = this.toolbar.addButton(`<i class="far fa-trash-alt"></i>&nbsp;&nbsp;clear`);
            this._btnClearResult.isEnabled = false;
            this._btnClearResult.onClick.add((s, e) => {
                this.clearData();
                this.onDataCleared.trigger();
            }, this);

            this._btnUseResultAsData = this.toolbar.addButton(`<i class="fas fa-table"></i>&nbsp;&nbsp;use as data`);
            this._btnUseResultAsData.isEnabled = false;
            this._btnUseResultAsData.onClick.add((s, e) => this.onButtonUseAsDataClick.trigger(), this);

            this._btnExportResult = this.toolbar.addButton(`<i class="fas fa-file-export"></i>&nbsp;&nbsp;export`);
            this._btnExportResult.isEnabled = false;
            this._btnExportResult.onClick.add((s, e) => this.onButtonExportClick.trigger(), this);

            this.toolbar.addSeparator();
        }

        public onDataCleared: Juice.EventSet<AppResultsPanel, Juice.EventArgs>;
        public onButtonUseAsDataClick: Juice.EventSet<AppResultsPanel, Juice.EventArgs>;
        public onButtonExportClick: Juice.EventSet<AppResultsPanel, Juice.EventArgs>;

        public get resultData(): any {
            return this._tableView.data;
        }
        public set resultData(v: any) {
            this._tableView.data = v;
            this._btnClearResult.isEnabled = !!v;
            this._btnUseResultAsData.isEnabled = !!v;
            this._btnExportResult.isEnabled = !!v;
        }

        public clearData() {
            this._tableView.clear();
            this._btnClearResult.isEnabled = false;
            this._btnUseResultAsData.isEnabled = false;
            this._btnExportResult.isEnabled = false;
        }
    }

    Juice.Builder.defineComponent({
        baseClass: TryLinq.AppToolPanel,
        classConstructor: AppResultsPanel,
        className: "AppResultsPanel",
        tagName: "app-results-panel"
    });
}