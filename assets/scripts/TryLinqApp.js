var TryLinq;
(function (TryLinq) {
    class AppToolPanel extends Juice.UIElement {
        constructor(template) {
            super(template || AppToolPanel.DefaultAppToolPanelTemplate);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_toolbar = templatedElement.getPart("toolbar").element;
            this._toolbar = new Juice.Toolbar();
            this._toolbar.appendToHtmlElement(this._part_toolbar);
        }
        get toolbar() {
            return this._toolbar;
        }
    }
    AppToolPanel.DefaultAppToolPanelStyles = `
    .app-tool-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .app-tool-panel-content {
        flex-grow: 1;
        overflow: auto;
    }`;
    AppToolPanel.DefaultAppToolPanelHtmlTemplate = `
    <template template-class="AppToolPanel">
        <div template-part="layoutRoot" class="app-tool-panel">
            <div template-part="toolbar" class="app-tool-panel-toolbar"></div>
            <div template-part="content" class="app-tool-panel-content"></div>
        </div>
    </template>`;
    AppToolPanel.DefaultAppToolPanelTemplate = `<style>\n${AppToolPanel.DefaultAppToolPanelStyles}\n</style>\n${AppToolPanel.DefaultAppToolPanelHtmlTemplate}`;
    TryLinq.AppToolPanel = AppToolPanel;
    Juice.Builder.defineComponent({
        baseClass: Juice.UIElement,
        classConstructor: AppToolPanel,
        className: "AppToolPanel",
        tagName: "app-tool-panel"
    });
})(TryLinq || (TryLinq = {}));
var TryLinq;
(function (TryLinq) {
    class AppCodePanel extends TryLinq.AppToolPanel {
        constructor(template) {
            super(template || AppCodePanel.DefaultAppCodePanelTemplate);
            this.onUserCodeLoaded = new Juice.EventSet(this.events, "onUserCodeLoaded");
            this.onButtonResetCodeClick = new Juice.EventSet(this.events, "onButtonResetCodeClick");
            this.onButtonRunClick = new Juice.EventSet(this.events, "onButtonRunClick");
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_layoutRoot = templatedElement.getPart("layoutRoot").element;
            this._part_content = templatedElement.getPart("content").element;
            this._part_footer = templatedElement.getPart("footer").element;
            this._part_buttonsContainer = templatedElement.getPart("buttonsContainer").element;
            this._btnRun = new Juice.Button();
            this._btnRun.content = "Run";
            this._btnRun.onClick.add((s, e) => this.events.trigger("onButtonRunClick"), this);
            this._btnRun.appendToHtmlElement(this._part_buttonsContainer);
            this._editor = ace.edit(this._part_content);
            this._editor.session.setMode("ace/mode/javascript");
            this.toolbar.addSeparator();
            let snippetLabel = this.toolbar.addLabel("snippet");
            snippetLabel.htmlElement.style.marginRight = "5px";
            let snippetSelector = document.createElement("select");
            for (const snippet of TryLinq.CodeSnippets.allSnippets) {
                let opt = document.createElement("option");
                opt.value = snippet.code;
                opt.text = snippet.name;
                snippetSelector.appendChild(opt);
            }
            let htmlSelect = new Juice.HtmlContainer();
            htmlSelect.addContent(snippetSelector);
            this.toolbar.items.add(htmlSelect);
            let btnAddSnippet = this.toolbar.addButton(`<i class="fas fa-plus"></i>`);
            btnAddSnippet.onClick.add((s, e) => { });
            this.toolbar.addSeparator();
            let btnLoadCode = new Juice.FileButton();
            btnLoadCode.accept = ".js,.txt";
            btnLoadCode.readType = Juice.FileReadType.Text;
            btnLoadCode.readerHandler(reader => {
                this.code = reader.result;
                this.onUserCodeLoaded.trigger();
            });
            btnLoadCode.content = `<i class="fas fa-file-download"></i>&nbsp;&nbsp;load code`;
            this.toolbar.items.add(btnLoadCode);
            let btnResetCode = this.toolbar.addButton(`<i class="fas fa-poo"></i>&nbsp;&nbsp;reset`);
            btnResetCode.onClick.add(() => this.onButtonResetCodeClick.trigger());
            this.toolbar.addSeparator();
        }
        get code() {
            return this._editor.getValue().trim();
        }
        set code(text) {
            this._editor.setValue(text);
        }
        setEditorTheme(themePath) {
            this._editor.setTheme(themePath);
        }
    }
    AppCodePanel.DefaultAppCodePanelStyles = `${TryLinq.AppToolPanel.DefaultAppToolPanelStyles}\n
    .app-code-panel-footer {
        display: flex;
        flex-direction: row;
    }
    
    .app-code-panel-footer-info {
        width: auto;
        flex-grow: 1;
    }`;
    AppCodePanel.DefaultAppCodePanelHtmlTemplate = `
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
    AppCodePanel.DefaultAppCodePanelTemplate = `<style>\n${AppCodePanel.DefaultAppCodePanelStyles}\n</style>\n${AppCodePanel.DefaultAppCodePanelHtmlTemplate}`;
    TryLinq.AppCodePanel = AppCodePanel;
    Juice.Builder.defineComponent({
        baseClass: TryLinq.AppToolPanel,
        classConstructor: AppCodePanel,
        className: "AppCodePanel",
        tagName: "app-code-panel"
    });
})(TryLinq || (TryLinq = {}));
var TryLinq;
(function (TryLinq) {
    class AppDataPanel extends TryLinq.AppToolPanel {
        constructor(template) {
            super(template);
            this.onUserDataLoaded = new Juice.EventSet(this.events, "onUserDataLoaded");
            this.onResetData = new Juice.EventSet(this.events, "onResetData");
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_layoutRoot = templatedElement.getPart("layoutRoot").element;
            this._part_content = templatedElement.getPart("content").element;
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
        btnLoadReaderHandler(reader) {
            let data = JSON.parse(reader.result);
            this.customData = data;
            this.onUserDataLoaded.trigger();
        }
        onBtnResetDataClick(s, e) {
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
        loadDefaultSourceData() {
            if (typeof this._defaultSourceDataHandler === "function") {
                let funcResult = this._defaultSourceDataHandler();
                if (typeof funcResult["then"] === "function") {
                    funcResult
                        .then((res) => {
                        this._tableView.data = res;
                        this._btnResetData.isEnabled = false;
                        this._isCustomData = false;
                        this.onResetData.trigger();
                    })
                        .catch((err) => {
                        Juice.MessageDialog.showMessage("Reset default data", err, this.getApplication().rootElement);
                    });
                }
                else {
                    this._tableView.data = funcResult;
                    this._btnResetData.isEnabled = false;
                    this._isCustomData = false;
                    this.onResetData.trigger();
                }
            }
        }
        setDefaultSourceData(v) {
            this._defaultSourceDataHandler = v;
        }
        get customData() {
            return this._tableView.data;
        }
        set customData(v) {
            this._tableView.data = v;
            this._btnResetData.isEnabled = !!v;
            this._isCustomData = true;
        }
        get hasCustomData() {
            return this._isCustomData;
        }
        resetData() {
            this._tableView.clear();
            this.loadDefaultSourceData();
        }
    }
    TryLinq.AppDataPanel = AppDataPanel;
    Juice.Builder.defineComponent({
        baseClass: TryLinq.AppToolPanel,
        classConstructor: AppDataPanel,
        className: "AppDataPanel",
        tagName: "app-data-panel"
    });
})(TryLinq || (TryLinq = {}));
var TryLinq;
(function (TryLinq) {
    class AppPage extends Juice.Page {
        constructor(applicationService, template) {
            super(template || AppPage.DefaultAppPageTemplate);
            this._performance = {
                enumerableConstruction: null,
                enumerableReading: null,
                totalTime: null,
            };
            this._applicationService = applicationService;
            this._applicationService.application.onApplicationReady.add((s, e) => this.readFromLocalStorage(), this);
            this._applicationService.application.onThemeChanged.add(this.onApplicationThemeChanged, this);
            this.initializeAppToolbar();
            this.initializeAppPanelsLayout();
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this.resources.set("icon_layout-1", `<svg class="app-toolbar-icon-svg" style="vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" width="20" height="20" viewBox="0 0 20.00 20.00" enable-background="new 0 0 20.00 20.00" xml:space="preserve">
            <path fill-opacity="1" stroke-width="0" stroke-linejoin="round" d="M 1.33317,1.33317L 18.6643,1.33317L 18.6643,18.6643L 1.33317,18.6643L 1.33317,1.33317 Z M 2.66633,2.66634L 2.66633,6.66584L 17.3312,6.66584L 17.3312,2.66634L 2.66633,2.66634 Z M 2.51821,7.999L 2.51821,11.9985L 17.3312,11.9985L 17.3312,7.999L 2.51821,7.999 Z M 2.51821,13.3317L 2.51821,17.3312L 17.3312,17.3312L 17.3312,13.3317L 2.51821,13.3317 Z "/>
            <rect x="2.66633" y="2.66633" fill-opacity="0.1" stroke-width="0" stroke-linejoin="round" width="14.6648" height="3.9995"/>
            <rect x="2.51821" y="7.999" fill-opacity="0.1" stroke-width="0" stroke-linejoin="round" width="14.813" height="3.9995"/>
            <rect x="2.51821" y="13.3317" fill-opacity="0.1" stroke-width="0" stroke-linejoin="round" width="14.813" height="3.9995"/>
        </svg>`);
            this.resources.set("icon_layout-2", `<svg class="app-toolbar-icon-svg" style="vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" width="20" height="20" viewBox="0 0 20.00 20.00" enable-background="new 0 0 20.00 20.00" xml:space="preserve">
            <path fill-opacity="1" stroke-width="0" stroke-linejoin="round" d="M 1.33317,1.33317L 18.6643,1.33317L 18.6643,18.6643L 1.33317,18.6643L 1.33317,1.33317 Z M 9.33216,10.6653L 9.33216,17.3312L 17.3312,17.3312L 17.3312,10.6653L 9.33216,10.6653 Z M 9.33216,2.66634L 9.33216,9.33217L 17.3312,9.33217L 17.3312,2.66634L 9.33216,2.66634 Z M 2.66633,2.66634L 2.66633,17.3312L 7.999,17.3312L 7.999,2.66634L 2.66633,2.66634 Z "/>
            <rect x="9.33217" y="10.6653" fill-opacity="0.1" stroke-width="0" stroke-linejoin="round" width="7.999" height="6.66583"/>
            <rect x="9.33217" y="2.66633" fill-opacity="0.1" stroke-width="0" stroke-linejoin="round" width="7.999" height="6.66583"/>
            <rect x="2.66633" y="2.66633" fill-opacity="0.1" stroke-width="0" stroke-linejoin="round" width="5.33267" height="14.6648"/>
        </svg>`);
            this.resources.set("icon_layout-3", `<svg class="app-toolbar-icon-svg" style="vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" width="20" height="20" viewBox="0 0 20.00 20.00" enable-background="new 0 0 20.00 20.00" xml:space="preserve">
            <path fill-opacity="1" stroke-width="0.32" stroke-linejoin="round" d="M 1.33317,1.33317L 18.6643,1.33317L 18.6643,18.6643L 1.33317,18.6643L 1.33317,1.33317 Z M 2.66633,2.66634L 2.66633,17.3312L 6.66583,17.3312L 6.66583,2.66634L 2.66633,2.66634 Z M 13.3317,2.66634L 13.3317,17.3312L 17.3312,17.3312L 17.3312,2.66634L 13.3317,2.66634 Z M 7.999,2.66634L 7.999,17.3312L 11.9985,17.3312L 11.9985,2.66634L 7.999,2.66634 Z "/>
            <rect x="2.66633" y="2.66633" fill-opacity="0.12" stroke-width="0.32" stroke-linejoin="round" width="3.9995" height="14.6648"/>
            <rect x="13.3317" y="2.66633" fill-opacity="0.12" stroke-width="0.32" stroke-linejoin="round" width="3.9995" height="14.6648"/>
            <rect x="7.999" y="2.66633" fill-opacity="0.12" stroke-width="0.32" stroke-linejoin="round" width="3.9995" height="14.6648"/>
        </svg>`);
            this.resources.set("icon_theme", '<i class="fas fa-lightbulb icon-dark"></i><i class="far fa-lightbulb icon-light"></i>');
            this._part_appRoot = templatedElement.getPart("appRoot").element;
            this._part_appToolbar = templatedElement.getPart("appToolbar").element;
            this._part_appContent = templatedElement.getPart("appContent").element;
            this._part_appVersion = templatedElement.withPartElement("appVersion", (element) => {
                element.innerText = TryLinq.Version;
            });
            this._part_engineVersion = templatedElement.withPartElement("engineVersion", (element) => {
                element.innerText = Linq.Version;
            });
        }
        initializeAppToolbar() {
            this._appToolbar = new TryLinq.AppToolbar();
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
        initializeAppPanelsLayout() {
            this._appPanelsLayout = new TryLinq.AppPanelsLayout();
            this._appPanelsLayout.appendToHtmlElement(this._part_appContent);
            this.initializeAppDataPanel();
            this.initializeAppCodePanel();
            this.initializeAppResultsPanel();
        }
        initializeAppDataPanel() {
            this._dataPanel = new TryLinq.AppDataPanel();
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
        initializeAppCodePanel() {
            this._codePanel = new TryLinq.AppCodePanel();
            this._codePanel.toolbar.header = `<span><i class="fas fa-stream app-panel-icon"></i> code</span>`;
            this._codePanel.onUserCodeLoaded.add((s, e) => {
                this.saveToLocalStorage();
            }, this);
            this._codePanel.onButtonResetCodeClick.add(this.onCodePanelResetCodeClick, this);
            this._codePanel.onButtonRunClick.add(this.onButtonRunClick, this);
            this._codePanel.htmlElement.querySelector(".app-tool-panel-content").style.overflow = "hidden";
            this._appPanelsLayout.panel2 = this._codePanel;
        }
        initializeAppResultsPanel() {
            this._resultsPanel = new TryLinq.AppResultsPanel();
            this._resultsPanel.toolbar.header = `<span><i class="fas fa-filter app-panel-icon"></i> result</span>`;
            this._resultsPanel.onButtonUseAsDataClick.add(this.onResultsPanelUseAsDataClick, this);
            this._resultsPanel.onButtonExportClick.add(this.onResultsPanelExportClick, this);
            this._appPanelsLayout.panel3 = this._resultsPanel;
        }
        onApplicationThemeChanged(s, e) {
            if (s.currentTheme === "dark-theme") {
                this._btnTheme.htmlElement.querySelector("i.fas").style.display = "none";
                this._btnTheme.htmlElement.querySelector("i.far").style.display = "inline-block";
                this._btnTheme.isSelected = false;
                this._codePanel.setEditorTheme("ace/theme/monokai");
            }
            else {
                this._btnTheme.htmlElement.querySelector("i.fas").style.display = "inline-block";
                this._btnTheme.htmlElement.querySelector("i.far").style.display = "none";
                this._btnTheme.isSelected = true;
                this._codePanel.setEditorTheme("ace/theme/textmate");
            }
        }
        onCodePanelResetCodeClick(s, e) {
            var question = new Juice.QuestionDialog("Reset code", "Reset code to default ?", Juice.QuestionDialogButtons.YesNo, (result) => {
                if (result) {
                    this._codePanel.code = AppPage.DefaultEditorCode;
                    localStorage.removeItem(`${AppPage.StoragePrefix}current-code`);
                }
            });
            question.show(this.getApplication().rootElement);
        }
        onResultsPanelUseAsDataClick(s, e) {
            if (this._resultsPanel.resultData) {
                let data = this.clone(this._resultsPanel.resultData);
                this._dataPanel.customData = data;
                this.saveToLocalStorage();
            }
        }
        onResultsPanelExportClick(s, e) {
            if (this._resultsPanel.resultData) {
                Juice.MessageDialog.showMessage("Export", "not yet implemented", this.getApplication().rootElement);
            }
        }
        clone(value) {
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
        setLayout(layout) {
            switch (layout) {
                case TryLinq.PanelsLayoutType.Layout1: {
                    this._btnLayout1.isSelected = true;
                    this._btnLayout2.isSelected = false;
                    this._btnLayout3.isSelected = false;
                    break;
                }
                case TryLinq.PanelsLayoutType.Layout2: {
                    this._btnLayout1.isSelected = false;
                    this._btnLayout2.isSelected = true;
                    this._btnLayout3.isSelected = false;
                    break;
                }
                case TryLinq.PanelsLayoutType.Layout3: {
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
        readFromLocalStorage() {
            let savedLayout = localStorage.getItem(`${AppPage.StoragePrefix}current-layout`);
            let savedTheme = localStorage.getItem(`${AppPage.StoragePrefix}current-theme`);
            let savedCode = localStorage.getItem(`${AppPage.StoragePrefix}current-code`);
            let savedData = localStorage.getItem(`${AppPage.StoragePrefix}current-data`);
            if (savedLayout) {
                this.setLayout(TryLinq.PanelsLayoutType[savedLayout]);
            }
            else {
                this.setLayout(TryLinq.PanelsLayoutType.Layout1);
            }
            if (savedTheme) {
                this._applicationService.setCurrentTheme(savedTheme);
            }
            if (savedCode) {
                this._codePanel.code = savedCode;
            }
            else {
                this._codePanel.code = AppPage.DefaultEditorCode;
            }
            if (savedData) {
                let data = JSON.parse(savedData);
                this._dataPanel.customData = data;
            }
            else {
                this._dataPanel.resetData();
            }
        }
        saveToLocalStorage() {
            localStorage.setItem(`${AppPage.StoragePrefix}current-layout`, TryLinq.PanelsLayoutType[this._appPanelsLayout.layoutType]);
            localStorage.setItem(`${AppPage.StoragePrefix}current-theme`, this._applicationService.application.currentTheme);
            localStorage.setItem(`${AppPage.StoragePrefix}current-code`, this._codePanel.code);
            if (this._dataPanel.hasCustomData) {
                localStorage.setItem(`${AppPage.StoragePrefix}current-data`, JSON.stringify(this._dataPanel.customData));
            }
        }
        loadDefaultDataHandler() {
            return this.downloadJsonData("assets/data/us-500.json");
        }
        loadResult(result) {
            if (Linq.isGroupedEnumerable(result)) {
                const tmp = {};
                for (const grouping of result) {
                    Reflect.set(tmp, grouping.key, [...grouping]);
                }
                result = tmp;
            }
            else if (Linq.isEnumerable(result)) {
                result = result.toArray();
            }
            this._resultsPanel.resultData = result;
        }
        downloadJsonData(url) {
            return new Promise((resolve, reject) => {
                var xhr = new XMLHttpRequest();
                xhr.onload = (e) => {
                    resolve(JSON.parse(xhr.response));
                };
                xhr.onerror = (e) => { reject(xhr.status + xhr.statusText); };
                xhr.open("GET", url);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send();
            });
        }
        getLastArrayItem(array) {
            if (!array)
                return null;
            return array[array.length - 1];
        }
        showPerformances() {
            document.querySelector("#enumerableConstruction").innerText = (Math.round(this._performance.enumerableConstruction.duration * 1000) / 1000) + " ms";
            document.querySelector("#enumerableReading").innerText = (Math.round(this._performance.enumerableReading.duration * 1000) / 1000) + " ms";
            document.querySelector("#totalTime").innerText = (Math.round(this._performance.totalTime.duration * 1000) / 1000) + " ms";
        }
        onButtonRunClick(s, e) {
            var p = window.performance;
            p.clearMarks();
            p.clearMeasures();
            var code = this._codePanel.code;
            if (code.charAt(code.length - 1) === ";")
                code = code.substr(0, code.length - 1);
            var func = new Function("data", "return " + code + ";");
            var dataEnumerable = Linq.Enumerable.from(this._dataPanel.customData);
            let result;
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
        onButtonLayoutClick(s, e) {
            if (s === this._btnLayout1) {
                this.setLayout(TryLinq.PanelsLayoutType.Layout1);
            }
            else if (s === this._btnLayout2) {
                this.setLayout(TryLinq.PanelsLayoutType.Layout2);
            }
            else if (s === this._btnLayout3) {
                this.setLayout(TryLinq.PanelsLayoutType.Layout3);
            }
            this.saveToLocalStorage();
        }
        onButtonThemeClick(s, e) {
            if (s.isSelected) {
                this._applicationService.setCurrentTheme(null);
            }
            else {
                this._applicationService.setCurrentTheme("dark-theme");
            }
            this.saveToLocalStorage();
        }
    }
    AppPage.DefaultAppPageStyles = `

    .app-page {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .app-page-content {
        flex-grow: 1;
        overflow: hidden;
    }`;
    AppPage.DefaultAppPageHtmlTemplate = `
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
    AppPage.DefaultAppPageTemplate = `<style>\n${AppPage.DefaultAppPageStyles}\n</style>\n${AppPage.DefaultAppPageHtmlTemplate}`;
    AppPage.DefaultEditorCode = `data
    .where(x => x.state === "LA" && /@gmail?/.test(x.email))
    .select(x => {
        return {
            first_name: x.first_name,
            last_name: x.last_name,
            email: x.email,
            state: x.state
        };
    })`;
    AppPage.StoragePrefix = "try-linq:";
    TryLinq.AppPage = AppPage;
    Juice.Builder.defineComponent({
        baseClass: Juice.Page,
        classConstructor: AppPage,
        className: "AppPage",
        tagName: "app-page"
    });
})(TryLinq || (TryLinq = {}));
var TryLinq;
(function (TryLinq) {
    let PanelsLayoutType;
    (function (PanelsLayoutType) {
        PanelsLayoutType[PanelsLayoutType["Layout1"] = 0] = "Layout1";
        PanelsLayoutType[PanelsLayoutType["Layout2"] = 1] = "Layout2";
        PanelsLayoutType[PanelsLayoutType["Layout3"] = 2] = "Layout3";
    })(PanelsLayoutType = TryLinq.PanelsLayoutType || (TryLinq.PanelsLayoutType = {}));
    class AppPanelsLayout extends Juice.UIElement {
        constructor(template) {
            super(template || AppPanelsLayout.DefaultAppPanelsLayoutTemplate);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_layoutRoot = templatedElement.getPart("layoutRoot").element;
            this._part_panel1 = templatedElement.getPart("panel1").element;
            this._part_panel2 = templatedElement.getPart("panel2").element;
            this._part_panel3 = templatedElement.getPart("panel3").element;
            this.layoutType = PanelsLayoutType.Layout1;
        }
        onLayoutTypeChanged() {
            switch (this._layoutType) {
                case PanelsLayoutType.Layout1: {
                    this._part_layoutRoot.classList.add("layout-1");
                    this._part_layoutRoot.classList.remove("layout-2", "layout-3");
                    break;
                }
                case PanelsLayoutType.Layout2: {
                    this._part_layoutRoot.classList.add("layout-2");
                    this._part_layoutRoot.classList.remove("layout-1", "layout-3");
                    break;
                }
                case PanelsLayoutType.Layout3: {
                    this._part_layoutRoot.classList.add("layout-3");
                    this._part_layoutRoot.classList.remove("layout-1", "layout-2");
                    break;
                }
            }
        }
        get panel1() {
            return this._panel1;
        }
        set panel1(v) {
            if (this._panel1 !== v) {
                this._panel1 = v;
                this._part_panel1.innerHTML = "";
                this._part_panel1.appendChild(this._panel1.htmlElement);
            }
        }
        get panel2() {
            return this._panel2;
        }
        set panel2(v) {
            if (this._panel2 !== v) {
                this._panel2 = v;
                this._part_panel2.innerHTML = "";
                this._part_panel2.appendChild(this._panel2.htmlElement);
            }
        }
        get panel3() {
            return this._panel3;
        }
        set panel3(v) {
            if (this._panel3 !== v) {
                this._panel3 = v;
                this._part_panel3.innerHTML = "";
                this._part_panel3.appendChild(this._panel3.htmlElement);
            }
        }
        get layoutType() {
            return this._layoutType;
        }
        set layoutType(v) {
            this._layoutType = v;
            this.onLayoutTypeChanged();
        }
    }
    AppPanelsLayout.DefaultAppPanelsLayoutStyles = `
    .app-panels-layout {
        height: 100%;
        position: relative;
    }`;
    AppPanelsLayout.DefaultAppPanelsLayoutHtmlTemplate = `
    <template template-class="AppFramesLayout">
        <div template-part="layoutRoot" class="app-panels-layout">
            <div template-part="panel1" class="layout-panel panel1"></div>
            <div template-part="panel2" class="layout-panel panel2"></div>
            <div template-part="panel3" class="layout-panel panel3"></div>
        </div>
    </template>`;
    AppPanelsLayout.DefaultAppPanelsLayoutTemplate = `<style>\n${AppPanelsLayout.DefaultAppPanelsLayoutStyles}\n</style>\n${AppPanelsLayout.DefaultAppPanelsLayoutHtmlTemplate}`;
    TryLinq.AppPanelsLayout = AppPanelsLayout;
    Juice.Builder.defineComponent({
        baseClass: Juice.UIElement,
        classConstructor: AppPanelsLayout,
        className: "AppPanelsLayout",
        tagName: "app-panels-layout"
    });
})(TryLinq || (TryLinq = {}));
var TryLinq;
(function (TryLinq) {
    class AppResultsPanel extends TryLinq.AppToolPanel {
        constructor(template) {
            super(template);
            this.onDataCleared = new Juice.EventSet(this.events, "onDataCleared");
            this.onButtonUseAsDataClick = new Juice.EventSet(this.events, "onButtonUseAsDataClick");
            this.onButtonExportClick = new Juice.EventSet(this.events, "onButtonExportClick");
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_layoutRoot = templatedElement.getPart("layoutRoot").element;
            this._part_content = templatedElement.getPart("content").element;
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
        get resultData() {
            return this._tableView.data;
        }
        set resultData(v) {
            this._tableView.data = v;
            this._btnClearResult.isEnabled = !!v;
            this._btnUseResultAsData.isEnabled = !!v;
            this._btnExportResult.isEnabled = !!v;
        }
        clearData() {
            this._tableView.clear();
            this._btnClearResult.isEnabled = false;
            this._btnUseResultAsData.isEnabled = false;
            this._btnExportResult.isEnabled = false;
        }
    }
    TryLinq.AppResultsPanel = AppResultsPanel;
    Juice.Builder.defineComponent({
        baseClass: TryLinq.AppToolPanel,
        classConstructor: AppResultsPanel,
        className: "AppResultsPanel",
        tagName: "app-results-panel"
    });
})(TryLinq || (TryLinq = {}));
var TryLinq;
(function (TryLinq) {
    class AppToolbar extends Juice.Toolbar {
        constructor(template) {
            super(template || AppToolbar.DefaultAppToolbarTemplate);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
        }
    }
    AppToolbar.DefaultAppToolbarStyles = `
    .app-toolbar {
        display: flex;
        flex-flow: row;
        align-items: center;
    }

    .app-toolbar-label {
        flex-grow: 1;
    }

    .app-toolbar-items {
        width: auto;
        white-space: nowrap;
        overflow-x: hidden;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    /*.app-toolbar-button.button-theme i.icon-dark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 18px;
        color: #fff;
    }
    .app-toolbar-button.button-theme i.icon-light {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 18px;
        color: #fff;
        display: none;
    }

    .app-toolbar-button.button-theme.active i.icon-dark {
        display: none;
    }

    .app-toolbar-button.button-theme.active i.icon-light {
        display: block;
    }*/`;
    AppToolbar.DefaultAppToolbarHtmlTemplate = `
    <template template-class="AppToolbar">
    <div class="app-toolbar">
        <div template-part="header" class="app-toolbar-label"></div>
        <div template-part="toolbarItems" class="app-toolbar-items"></div>
        <!--<div template-part="toolbarMenuButton" class="app-toolbar-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="5.5" r="1.5" fill="black" />
                <circle cx="12" cy="12" r="1.5" fill="black" />
                <circle cx="12" cy="18.5" r="1.5" fill="black" />
            </svg>
        </div>-->
    </div>
</template>`;
    AppToolbar.DefaultAppToolbarTemplate = `<style>\n${AppToolbar.DefaultAppToolbarStyles}\n</style>\n${AppToolbar.DefaultAppToolbarHtmlTemplate}`;
    TryLinq.AppToolbar = AppToolbar;
    Juice.Builder.defineComponent({
        baseClass: Juice.Toolbar,
        classConstructor: AppToolbar,
        className: "AppToolbar",
        tagName: "app-toolbar"
    });
})(TryLinq || (TryLinq = {}));
var TryLinq;
(function (TryLinq) {
    class CodeSnippets {
        static get allSnippets() {
            return CodeSnippets._snippetsList;
        }
    }
    CodeSnippets.aggregate = `data.aggregate( "seed!", (accumulate, source) => accumulate + ", " + source)`;
    CodeSnippets.all = `data.all(x => x.first_name.length > 5)`;
    CodeSnippets.any = `data.any(x => x.first_name.length < 5)`;
    CodeSnippets.append = `data.append({
			first_name: "Mario",
			last_name: "Rossi"
		})`;
    CodeSnippets.average = `data.average(x => parseInt(x.zip))`;
    CodeSnippets.concat = `data.concat([
			{
				first_name: "Mario",
				last_name: "Rossi"
			},
			{
				first_name: "Luigi",
				last_name: "Bianchi"
			}
		])`;
    CodeSnippets.contains = `data.contains("James", (x, value) => x.first_name == value)`;
    CodeSnippets.count = `data.count(x => x.state == "LA")`;
    CodeSnippets.distinct = `data.select(x => x.state)
		.distinct()`;
    CodeSnippets.elementAt = `data.elementAt(3)`;
    CodeSnippets.elementAtOrDefault = `data.elementAtOrDefault(-3)`;
    CodeSnippets.except = `data.except([...sequence...])`;
    CodeSnippets.first = `data.first()`;
    CodeSnippets.firstOrDefault = `data.firstOrDefault(x => x.state = "ZZ")`;
    CodeSnippets.groupBy = `data.groupBy(
			x => x.state,
			x => x
			)`;
    CodeSnippets.groupJoin = `data.groupJoin(
			innerSequence,
			outerKeySelector,
			innerKeySelector,
			resultSelector,
			comparer?
			)`;
    CodeSnippets.intersect = `data.intersect(...sequence...)`;
    CodeSnippets.join = `data.join(
			innerSequence,
			outerKeySelector,
			innerKeySelector,
			resultSelector,
			comparer?
			)`;
    CodeSnippets.last = `data.last()`;
    CodeSnippets.lastOrDefault = `data.lastOrDefault(x => x.state == "LA")`;
    CodeSnippets.max = `data.max(x => parseInt(x.zip))`;
    CodeSnippets.min = `data.min(x => parseInt(x.zip))`;
    CodeSnippets.orderBy = `data.orderBy(x => x.last_name)`;
    CodeSnippets.orderByDescending = `data.orderByDescending(x => x.last_name)`;
    CodeSnippets.prepend = `data.prepend({
			first_name: "Mario",
			last_name: "Rossi"
		})`;
    CodeSnippets.reverse = `data.reverse()`;
    CodeSnippets.select = `select(x => {
			return {
				firstName: x.first_name,
				lastName: x.last_name,
				state: x.state
			}
		})`;
    CodeSnippets.selectMany = `data.selectMany(x => x.first_name)
		.distinct()`;
    CodeSnippets.sequenceEqual = `data.sequenceEqual(...sequence..., comparer?)`;
    CodeSnippets.single = `data.single(x => x.first_name == "James" && x.last_name == "Butt")`;
    CodeSnippets.singleOrDefault = `data.singleOrDefault(x => x.first_name == "James" && x.last_name == "Butt")`;
    CodeSnippets.skip = `data.skip(1)`;
    CodeSnippets.skipLast = `data.skipLast(3)`;
    CodeSnippets.skipWhile = `data.skipWhile(x => x.last_name.length < 13)`;
    CodeSnippets.sum = `data.sum(x => x.first_name.length)`;
    CodeSnippets.take = `data.take(10)`;
    CodeSnippets.takeLast = `data.takeLast(3)`;
    CodeSnippets.takeWhile = `data.takeWhile(x => x.last_name.length < 13)`;
    CodeSnippets.toArray = `data.toArray()`;
    CodeSnippets.toDictionary = `data.toDictionary(
			x => \`$\{x.first_name\} $\{x.last_name\}\`,
			x => {
				return {
					firstName: x.first_name,
					lastName: x.last_name
				}
			})`;
    CodeSnippets.union = `data.union(...sequence...)`;
    CodeSnippets.where = `data.where(x => x.last_name.length > 10)`;
    CodeSnippets.zip = `data.zip(...sequence..., resultSelector)`;
    CodeSnippets._snippetsList = [
        {
            name: "aggregate",
            code: CodeSnippets.aggregate
        },
        {
            name: "all",
            code: CodeSnippets.all
        },
        {
            name: "any",
            code: CodeSnippets.any
        },
        {
            name: "append",
            code: CodeSnippets.append
        },
        {
            name: "average",
            code: CodeSnippets.average
        },
        {
            name: "concat",
            code: CodeSnippets.concat
        },
        {
            name: "contains",
            code: CodeSnippets.contains
        },
        {
            name: "count",
            code: CodeSnippets.count
        },
        {
            name: "distinct",
            code: CodeSnippets.distinct
        },
        {
            name: "elementAt",
            code: CodeSnippets.elementAt
        },
        {
            name: "elementAtOrDefault",
            code: CodeSnippets.elementAtOrDefault
        },
        {
            name: "except",
            code: CodeSnippets.except
        },
        {
            name: "first",
            code: CodeSnippets.first
        },
        {
            name: "firstOrDefault",
            code: CodeSnippets.firstOrDefault
        },
        {
            name: "groupBy",
            code: CodeSnippets.groupBy
        },
        {
            name: "groupJoin",
            code: CodeSnippets.groupJoin
        },
        {
            name: "intersect",
            code: CodeSnippets.intersect
        },
        {
            name: "join",
            code: CodeSnippets.join
        },
        {
            name: "last",
            code: CodeSnippets.last
        },
        {
            name: "lastOrDefault",
            code: CodeSnippets.lastOrDefault
        },
        {
            name: "max",
            code: CodeSnippets.max
        },
        {
            name: "min",
            code: CodeSnippets.min
        },
        {
            name: "orderBy",
            code: CodeSnippets.orderBy
        },
        {
            name: "orderByDescending",
            code: CodeSnippets.orderByDescending
        },
        {
            name: "prepend",
            code: CodeSnippets.prepend
        },
        {
            name: "reverse",
            code: CodeSnippets.reverse
        },
        {
            name: "select",
            code: CodeSnippets.select
        },
        {
            name: "selectMany",
            code: CodeSnippets.selectMany
        },
        {
            name: "sequenceEqual",
            code: CodeSnippets.sequenceEqual
        },
        {
            name: "single",
            code: CodeSnippets.single
        },
        {
            name: "singleOrDefault",
            code: CodeSnippets.singleOrDefault
        },
        {
            name: "skip",
            code: CodeSnippets.skip
        },
        {
            name: "skipLast",
            code: CodeSnippets.skipLast
        },
        {
            name: "skipWhile",
            code: CodeSnippets.skipWhile
        },
        {
            name: "sum",
            code: CodeSnippets.sum
        },
        {
            name: "take",
            code: CodeSnippets.take
        },
        {
            name: "takeLast",
            code: CodeSnippets.takeLast
        },
        {
            name: "takeWhile",
            code: CodeSnippets.takeWhile
        },
        {
            name: "toArray",
            code: CodeSnippets.toArray
        },
        {
            name: "toDictionary",
            code: CodeSnippets.toDictionary
        },
        {
            name: "union",
            code: CodeSnippets.union
        },
        {
            name: "where",
            code: CodeSnippets.where
        },
        {
            name: "zip",
            code: CodeSnippets.zip
        },
    ];
    TryLinq.CodeSnippets = CodeSnippets;
})(TryLinq || (TryLinq = {}));
var TryLinq;
(function (TryLinq) {
    var Application = Juice.Application;
    TryLinq.Version = "0.0.1";
    class TryLinqApp extends Application {
        constructor() {
            super();
        }
        initialize() {
            super.initialize();
        }
        run() {
            super.configure(() => {
                return {
                    mainElement: () => new TryLinq.AppPage(this.applicationService),
                    rootNode: () => document.body,
                    currentTheme: () => "dark-theme",
                    templateUrls: () => []
                };
            });
            super.run();
        }
    }
    TryLinq.TryLinqApp = TryLinqApp;
})(TryLinq || (TryLinq = {}));
//# sourceMappingURL=TryLinqApp.js.map