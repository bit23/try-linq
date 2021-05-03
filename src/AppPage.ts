
namespace TryLinq {

    export class AppPage extends Juice.Page {

        protected static readonly DefaultAppPageStyles = `

    .app-page {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .app-page-content {
        flex-grow: 1;
        overflow: hidden;
    }`;

        protected static readonly DefaultAppPageHtmlTemplate = `
    <template template-class="AppPage">
        <div template-part="appRoot" class="app-page">
            <div template-part="appToolbar" class="app-page-toolbar"></div>
            <div template-part="appContent" class="app-page-content"></div>
            <div class="app-page-footer">
				<span>try-linq v. <span template-part="appVersion"></span></span>
				<span>&nbsp;&nbsp;-&nbsp;&nbsp;</span>
                <span>linq-g v. <span template-part="engineVersion"></span></span>
            </div>
        </div>
    </template>`;

        private static readonly DefaultAppPageTemplate = `<style>\n${AppPage.DefaultAppPageStyles}\n</style>\n${AppPage.DefaultAppPageHtmlTemplate}`;

        private static readonly DefaultEditorCode = `data
    .where(x => x.state === "LA" && /@gmail?/.test(x.email))
    .select(x => {
        return {
            first_name: x.first_name,
            last_name: x.last_name,
            email: x.email,
            state: x.state
        };
    })`;

        private static readonly StoragePrefix = "try-linq:";

        private _applicationService: Juice.ApplicationService

        private _part_appRoot: HTMLElement;
        private _part_appToolbar: HTMLElement;
        private _part_appContent: HTMLElement;
        private _part_appVersion: HTMLElement;
		private _part_engineVersion: HTMLElement;

        private _appToolbar: AppToolbar;
        private _appPanelsLayout: AppPanelsLayout;
        private _dataPanel: AppDataPanel;
        private _codePanel: AppCodePanel;
        private _resultsPanel: AppResultsPanel;

        private _btnLayout1: Juice.Button;
        private _btnLayout2: Juice.Button;
        private _btnLayout3: Juice.Button;
        private _btnTheme: Juice.Button;

        private _performance = {
            enumerableConstruction: <PerformanceEntry>null,
            enumerableReading: <PerformanceEntry>null,
            totalTime: <PerformanceEntry>null,
        };

        constructor(
            applicationService: Juice.ApplicationService,
            template?: Juice.TemplateSource) {
            super(template || AppPage.DefaultAppPageTemplate);

            this._applicationService = applicationService;
            this._applicationService.application.onApplicationReady.add((s, e) => this.readFromLocalStorage(), this);
            this._applicationService.application.onThemeChanged.add(this.onApplicationThemeChanged, this);

            this.initializeAppToolbar();
            this.initializeAppPanelsLayout();
        }

        protected initializeTemplate(templatedElement: Juice.TemplatedElement) {
            super.initializeTemplate(templatedElement);

            this.resources.set("icon_layout-1",
                `<svg class="app-toolbar-icon-svg" style="vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" width="20" height="20" viewBox="0 0 20.00 20.00" enable-background="new 0 0 20.00 20.00" xml:space="preserve">
            <path fill-opacity="1" stroke-width="0" stroke-linejoin="round" d="M 1.33317,1.33317L 18.6643,1.33317L 18.6643,18.6643L 1.33317,18.6643L 1.33317,1.33317 Z M 2.66633,2.66634L 2.66633,6.66584L 17.3312,6.66584L 17.3312,2.66634L 2.66633,2.66634 Z M 2.51821,7.999L 2.51821,11.9985L 17.3312,11.9985L 17.3312,7.999L 2.51821,7.999 Z M 2.51821,13.3317L 2.51821,17.3312L 17.3312,17.3312L 17.3312,13.3317L 2.51821,13.3317 Z "/>
            <rect x="2.66633" y="2.66633" fill-opacity="0.1" stroke-width="0" stroke-linejoin="round" width="14.6648" height="3.9995"/>
            <rect x="2.51821" y="7.999" fill-opacity="0.1" stroke-width="0" stroke-linejoin="round" width="14.813" height="3.9995"/>
            <rect x="2.51821" y="13.3317" fill-opacity="0.1" stroke-width="0" stroke-linejoin="round" width="14.813" height="3.9995"/>
        </svg>`);

            this.resources.set("icon_layout-2",
                `<svg class="app-toolbar-icon-svg" style="vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" width="20" height="20" viewBox="0 0 20.00 20.00" enable-background="new 0 0 20.00 20.00" xml:space="preserve">
            <path fill-opacity="1" stroke-width="0" stroke-linejoin="round" d="M 1.33317,1.33317L 18.6643,1.33317L 18.6643,18.6643L 1.33317,18.6643L 1.33317,1.33317 Z M 9.33216,10.6653L 9.33216,17.3312L 17.3312,17.3312L 17.3312,10.6653L 9.33216,10.6653 Z M 9.33216,2.66634L 9.33216,9.33217L 17.3312,9.33217L 17.3312,2.66634L 9.33216,2.66634 Z M 2.66633,2.66634L 2.66633,17.3312L 7.999,17.3312L 7.999,2.66634L 2.66633,2.66634 Z "/>
            <rect x="9.33217" y="10.6653" fill-opacity="0.1" stroke-width="0" stroke-linejoin="round" width="7.999" height="6.66583"/>
            <rect x="9.33217" y="2.66633" fill-opacity="0.1" stroke-width="0" stroke-linejoin="round" width="7.999" height="6.66583"/>
            <rect x="2.66633" y="2.66633" fill-opacity="0.1" stroke-width="0" stroke-linejoin="round" width="5.33267" height="14.6648"/>
        </svg>`);

            this.resources.set("icon_layout-3",
                `<svg class="app-toolbar-icon-svg" style="vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" width="20" height="20" viewBox="0 0 20.00 20.00" enable-background="new 0 0 20.00 20.00" xml:space="preserve">
            <path fill-opacity="1" stroke-width="0.32" stroke-linejoin="round" d="M 1.33317,1.33317L 18.6643,1.33317L 18.6643,18.6643L 1.33317,18.6643L 1.33317,1.33317 Z M 2.66633,2.66634L 2.66633,17.3312L 6.66583,17.3312L 6.66583,2.66634L 2.66633,2.66634 Z M 13.3317,2.66634L 13.3317,17.3312L 17.3312,17.3312L 17.3312,2.66634L 13.3317,2.66634 Z M 7.999,2.66634L 7.999,17.3312L 11.9985,17.3312L 11.9985,2.66634L 7.999,2.66634 Z "/>
            <rect x="2.66633" y="2.66633" fill-opacity="0.12" stroke-width="0.32" stroke-linejoin="round" width="3.9995" height="14.6648"/>
            <rect x="13.3317" y="2.66633" fill-opacity="0.12" stroke-width="0.32" stroke-linejoin="round" width="3.9995" height="14.6648"/>
            <rect x="7.999" y="2.66633" fill-opacity="0.12" stroke-width="0.32" stroke-linejoin="round" width="3.9995" height="14.6648"/>
        </svg>`);

            this.resources.set("icon_theme", '<i class="fas fa-lightbulb icon-dark"></i><i class="far fa-lightbulb icon-light"></i>');

            this._part_appRoot = templatedElement.getPart<HTMLElement>("appRoot").element;
            this._part_appToolbar = templatedElement.getPart<HTMLElement>("appToolbar").element;
            this._part_appContent = templatedElement.getPart<HTMLElement>("appContent").element;
            this._part_appVersion = templatedElement.withPartElement<HTMLElement>("appVersion", (element) => {
                element.innerText = TryLinq.Version;
            });
			this._part_engineVersion = templatedElement.withPartElement<HTMLElement>("engineVersion", (element) => {
                element.innerText = Linq.Version;
            });
        }

        private initializeAppToolbar() {

            this._appToolbar = new AppToolbar();
            this._appToolbar.header = "TryLinq";


            this._appToolbar.addSeparator();

            this._btnLayout1 = this._appToolbar.addButton(this.resources.get("icon_layout-1"));
            this._btnLayout1.isToggle = true;
            this._btnLayout1.onClick.add(this.onButtonLayoutClick, this);


            this._btnLayout2 = this._appToolbar.addButton(this.resources.get("icon_layout-2"));
            this._btnLayout2.isToggle = true;
            this._btnLayout2.onClick.add(this.onButtonLayoutClick, this);


            this._btnLayout3 = this._appToolbar.addButton(this.resources.get("icon_layout-3"));
            this._btnLayout3.isToggle = true;
            this._btnLayout3.onClick.add(this.onButtonLayoutClick, this);

            this._appToolbar.addSeparator();

            this._btnTheme = this._appToolbar.addButton(this.resources.get("icon_theme"));
            this._btnTheme.htmlElement.classList.add("app-button-theme", "app-toolbar-icon-font");
            this._btnTheme.isToggle = true;
            this._btnTheme.onClick.add(this.onButtonThemeClick, this);

            this._appToolbar.appendToHtmlElement(this._part_appToolbar);
        }

        private initializeAppPanelsLayout() {
            this._appPanelsLayout = new AppPanelsLayout();
            this._appPanelsLayout.appendToHtmlElement(this._part_appContent);
            this.initializeAppDataPanel();
            this.initializeAppCodePanel();
            this.initializeAppResultsPanel();
        }

        private initializeAppDataPanel() {
            this._dataPanel = new AppDataPanel();
            this._dataPanel.toolbar.header = `<span><i class="fas fa-table app-panel-icon"></i> data</span>`;
            this._dataPanel.setDefaultSourceData(this.loadDefaultDataHandler.bind(this));
            this._dataPanel.onUserDataLoaded.add((s, e) => {
                this.saveToLocalStorage();
            }, this);
            this._dataPanel.onResetData.add((s, e) => {
                localStorage.removeItem(`${AppPage.StoragePrefix}current-data`);
            }, this);
            this._appPanelsLayout.panel1 = this._dataPanel;
        }

        private initializeAppCodePanel() {
            this._codePanel = new AppCodePanel();
            this._codePanel.toolbar.header = `<span><i class="fas fa-stream app-panel-icon"></i> code</span>`;
            this._codePanel.onUserCodeLoaded.add((s, e) => {
                this.saveToLocalStorage();
            }, this);
            this._codePanel.onButtonResetCodeClick.add(this.onCodePanelResetCodeClick, this);
            this._codePanel.onButtonRunClick.add(this.onButtonRunClick, this);
            (<HTMLElement>this._codePanel.htmlElement.querySelector(".app-tool-panel-content")).style.overflow = "hidden";
            this._appPanelsLayout.panel2 = this._codePanel;
        }

        private initializeAppResultsPanel() {
            this._resultsPanel = new AppResultsPanel();
            this._resultsPanel.toolbar.header = `<span><i class="fas fa-filter app-panel-icon"></i> result</span>`;
            this._resultsPanel.onButtonUseAsDataClick.add(this.onResultsPanelUseAsDataClick, this);
            this._resultsPanel.onButtonExportClick.add(this.onResultsPanelExportClick, this);
            this._appPanelsLayout.panel3 = this._resultsPanel;
        }



        private onApplicationThemeChanged(s: Juice.Application, e: Juice.EventArgs) {
            if (s.currentTheme === "dark-theme") {
                (<HTMLElement>this._btnTheme.htmlElement.querySelector("i.fas")).style.display = "none";
                (<HTMLElement>this._btnTheme.htmlElement.querySelector("i.far")).style.display = "inline-block";
                this._btnTheme.isSelected = false;
                this._codePanel.setEditorTheme("ace/theme/monokai");
            }
            else {
                (<HTMLElement>this._btnTheme.htmlElement.querySelector("i.fas")).style.display = "inline-block";
                (<HTMLElement>this._btnTheme.htmlElement.querySelector("i.far")).style.display = "none";
                this._btnTheme.isSelected = true;
                this._codePanel.setEditorTheme("ace/theme/textmate");
            }
        }

        private onCodePanelResetCodeClick(s: AppCodePanel, e: Juice.EventArgs) {
            var question = new Juice.QuestionDialog("Reset code", "Reset code to default ?", Juice.QuestionDialogButtons.YesNo, (result) => {
                if (result) {
                    this._codePanel.code = AppPage.DefaultEditorCode;
                    localStorage.removeItem(`${AppPage.StoragePrefix}current-code`);
                }
            });
            question.show(this.getApplication().rootElement);
        }

        private onResultsPanelUseAsDataClick(s: AppResultsPanel, e: Juice.EventArgs) {
            if (this._resultsPanel.resultData) {
                let data = this.clone(this._resultsPanel.resultData);
                this._dataPanel.customData = data;
                this.saveToLocalStorage();
            }
        }

        private onResultsPanelExportClick(s: AppResultsPanel, e: Juice.EventArgs) {
            if (this._resultsPanel.resultData) {
                // TODO
                Juice.MessageDialog.showMessage("Export", "not yet implemented", this.getApplication().rootElement);
            }
        }

        private clone(value: any): any {
            if (value instanceof Linq.Enumerable) {
                var array = value.toArray();
                return new Linq.Enumerable(array);
            }
            else if (value instanceof Array || typeof value === "object") {
                return JSON.parse(JSON.stringify(value));
            }
            else {
                return value;
            }
        }

        private setLayout(layout: PanelsLayoutType) {
            switch (layout) {
                case PanelsLayoutType.Layout1: {
                    this._btnLayout1.isSelected = true;
                    this._btnLayout2.isSelected = false;
                    this._btnLayout3.isSelected = false;
                    break;
                }
                case PanelsLayoutType.Layout2: {
                    this._btnLayout1.isSelected = false;
                    this._btnLayout2.isSelected = true;
                    this._btnLayout3.isSelected = false;
                    break;
                }
                case PanelsLayoutType.Layout3: {
                    this._btnLayout1.isSelected = false;
                    this._btnLayout2.isSelected = false;
                    this._btnLayout3.isSelected = true;
                    break;
                }
                default: {
                    throw new Error("invalid layout type");
                }
            }
            this._appPanelsLayout.layoutType = layout;
        }

        private readFromLocalStorage() {

            let savedLayout = localStorage.getItem(`${AppPage.StoragePrefix}current-layout`);
            let savedTheme = localStorage.getItem(`${AppPage.StoragePrefix}current-theme`);
            let savedCode = localStorage.getItem(`${AppPage.StoragePrefix}current-code`);
            let savedData = localStorage.getItem(`${AppPage.StoragePrefix}current-data`);

            if (savedLayout) {
                this.setLayout(PanelsLayoutType[savedLayout as keyof typeof PanelsLayoutType])
            } else {
                this.setLayout(PanelsLayoutType.Layout1);
            }

            if (savedTheme) {
                this._applicationService.setCurrentTheme(savedTheme);
            }

            if (savedCode) {
                this._codePanel.code = savedCode;
            } else {
                this._codePanel.code = AppPage.DefaultEditorCode;
            }

            if (savedData) {
                let data = JSON.parse(savedData);
                this._dataPanel.customData = data;
            } else {
                this._dataPanel.resetData();
            }
        }

        private saveToLocalStorage() {

            localStorage.setItem(`${AppPage.StoragePrefix}current-layout`, PanelsLayoutType[this._appPanelsLayout.layoutType]);
            localStorage.setItem(`${AppPage.StoragePrefix}current-theme`, this._applicationService.application.currentTheme);

            localStorage.setItem(`${AppPage.StoragePrefix}current-code`, this._codePanel.code);

            if (this._dataPanel.hasCustomData) {
                localStorage.setItem(`${AppPage.StoragePrefix}current-data`, JSON.stringify(this._dataPanel.customData));
            }
        }

        private loadDefaultDataHandler() {
            return this.downloadJsonData("assets/data/us-500.json");
        }

        private loadResult(result: any) {

			if (Linq.isGroupedEnumerable(result)) {
				// const tmp: any[] = [];
				// for (const grouping of result) {
				// 	const item = {
				// 		key: grouping.key,
				// 		children: grouping.count()
				// 	};
				// 	tmp.push(item);
				// }
				// result = tmp;

				const tmp: {[name: string]: any} = {};
				for (const grouping of result) {
					Reflect.set(tmp, grouping.key, [...grouping]);
				}
				result = tmp;
			}
			else if (Linq.isEnumerable(result)) {
				result = (result as any).toArray();
			}

            this._resultsPanel.resultData = result;
		}

        private downloadJsonData(url: string) {
            return new Promise<any>(
                (resolve, reject) => {
                    var xhr = new XMLHttpRequest();
                    xhr.onload = (e) => {
                        resolve(JSON.parse(xhr.response));
                    };
                    xhr.onerror = (e) => { reject(xhr.status + xhr.statusText); };
                    xhr.open("GET", url);
                    xhr.setRequestHeader("Content-Type", "application/json");
                    xhr.send();
                },
            );
        }

        private getLastArrayItem<T>(array: Array<T>) {
            if(!array) return null;
            return array[array.length -1];
        }

        private showPerformances() {
            (<HTMLElement>document.querySelector("#enumerableConstruction")).innerText = (Math.round(this._performance.enumerableConstruction.duration * 1000) / 1000) + " ms";
            (<HTMLElement>document.querySelector("#enumerableReading")).innerText = (Math.round(this._performance.enumerableReading.duration * 1000) / 1000) + " ms";
            (<HTMLElement>document.querySelector("#totalTime")).innerText = (Math.round(this._performance.totalTime.duration * 1000) / 1000) + " ms";
        }

        private onButtonRunClick(s: AppCodePanel, e: Juice.EventArgs) {

            var p = window.performance;
            p.clearMarks();
            p.clearMeasures();

            var code = this._codePanel.code;
            if (code.charAt(code.length - 1) === ";")
                code = code.substr(0, code.length - 1);

            var func = new Function("data", "return " + code + ";");
            var dataEnumerable = Linq.Enumerable.from(this._dataPanel.customData);

            let result: any;

            try {
                p.mark("start");
                result = func(dataEnumerable);
                p.mark("func-executed");
            }
            catch (err) {
                p.mark("func-executed");
                Juice.MessageDialog.showMessage("Execution error", err);
            }

            this.loadResult(result);
            p.mark("result-loaded");

            p.measure("enumerable construction", "start", "func-executed");
            p.measure("enumerable reading", "func-executed", "result-loaded");
            p.measure("total time", "start", "result-loaded");

            this._performance.enumerableConstruction = this.getLastArrayItem(p.getEntriesByName("enumerable construction"));
            this._performance.enumerableReading = this.getLastArrayItem(p.getEntriesByName("enumerable reading"));
            this._performance.totalTime = this.getLastArrayItem(p.getEntriesByName("total time"));

            this.showPerformances();

            this.saveToLocalStorage();
        }

        private onButtonLayoutClick(s: Juice.Button, e: Juice.EventArgs) {
            if (s === this._btnLayout1) {
                this.setLayout(PanelsLayoutType.Layout1);
            }
            else if (s === this._btnLayout2) {
                this.setLayout(PanelsLayoutType.Layout2);
            }
            else if (s === this._btnLayout3) {
                this.setLayout(PanelsLayoutType.Layout3);
            }
            this.saveToLocalStorage();
        }

        private onButtonThemeClick(s: Juice.Button, e: Juice.EventArgs) {
            if (s.isSelected) {
                this._applicationService.setCurrentTheme(null);
            }
            else {
                this._applicationService.setCurrentTheme("dark-theme");
            }
            this.saveToLocalStorage();
        }
    }

    Juice.Builder.defineComponent({
        baseClass: Juice.Page,
        classConstructor: AppPage,
        className: "AppPage",
        tagName: "app-page"
    });
}