/// <reference path="../../libs/juice-lite/juice-lite.d.ts" />
/// <reference path="../../libs/linq-g/linq-g.d.ts" />
declare namespace TryLinq {
    class AppToolPanel extends Juice.UIElement {
        protected static readonly DefaultAppToolPanelStyles = "\n    .app-tool-panel {\n        display: flex;\n        flex-direction: column;\n        height: 100%;\n    }\n\n    .app-tool-panel-content {\n        flex-grow: 1;\n        overflow: auto;\n    }";
        protected static readonly DefaultAppToolPanelHtmlTemplate = "\n    <template template-class=\"AppToolPanel\">\n        <div template-part=\"layoutRoot\" class=\"app-tool-panel\">\n            <div template-part=\"toolbar\" class=\"app-tool-panel-toolbar\"></div>\n            <div template-part=\"content\" class=\"app-tool-panel-content\"></div>\n        </div>\n    </template>";
        private static readonly DefaultAppToolPanelTemplate;
        private _part_toolbar;
        private _toolbar;
        constructor(template?: Juice.TemplateSource);
        protected initializeTemplate(templatedElement: Juice.TemplatedElement): void;
        get toolbar(): Juice.Toolbar;
    }
}
declare namespace TryLinq {
    class AppCodePanel extends AppToolPanel {
        protected static readonly DefaultAppCodePanelStyles: string;
        protected static readonly DefaultAppCodePanelHtmlTemplate = "\n    <template template-class=\"AppCodePanel\">\n        <div template-part=\"layoutRoot\" class=\"app-tool-panel\">\n            <div template-part=\"toolbar\" class=\"app-tool-panel-toolbar\"></div>\n            <div template-part=\"content\" class=\"app-tool-panel-content\"></div>\n            <div template-part=\"footer\" class=\"app-code-panel-footer\">\n                <div class=\"app-code-panel-footer-info\">\n                    <span>\n                        <span style=\"display: inline-block; margin-right: 10px;\">Construction &nbsp;<b id=\"enumerableConstruction\">0 ms</b></span>\n                        <span style=\"display: inline-block; margin-right: 10px;\">Reading &nbsp;<b id=\"enumerableReading\">0 ms</b></span>\n                        <span style=\"display: inline-block; margin-right: 10px;\">Total time: &nbsp;<b id=\"totalTime\">0 ms</b></span>\n                    </span>\n                </div>\n                <div template-part=\"buttonsContainer\" class=\"app-code-panel-footer-butttons\">\n                </div>\n            </div>\n        </div>\n    </template>";
        private static readonly DefaultAppCodePanelTemplate;
        private _part_layoutRoot;
        private _part_content;
        private _part_footer;
        private _part_buttonsContainer;
        private _editor;
        private _btnRun;
        constructor(template?: Juice.TemplateSource);
        protected initializeTemplate(templatedElement: Juice.TemplatedElement): void;
        get code(): string;
        set code(text: string);
        setEditorTheme(themePath: string): void;
        onUserCodeLoaded: Juice.EventSet<AppCodePanel, Juice.EventArgs>;
        onButtonResetCodeClick: Juice.EventSet<AppCodePanel, Juice.EventArgs>;
        onButtonRunClick: Juice.EventSet<AppCodePanel, Juice.EventArgs>;
    }
}
declare namespace TryLinq {
    class AppDataPanel extends AppToolPanel {
        private _part_layoutRoot;
        private _part_content;
        private _tableView;
        private _btnResetData;
        private _defaultSourceDataHandler;
        private _isCustomData;
        constructor(template?: Juice.TemplateSource);
        protected initializeTemplate(templatedElement: Juice.TemplatedElement): void;
        private btnLoadReaderHandler;
        private onBtnResetDataClick;
        private loadDefaultSourceData;
        setDefaultSourceData(v: () => any): void;
        get customData(): any;
        set customData(v: any);
        get hasCustomData(): boolean;
        resetData(): void;
        onUserDataLoaded: Juice.EventSet<AppDataPanel, Juice.EventArgs>;
        onResetData: Juice.EventSet<AppDataPanel, Juice.EventArgs>;
    }
}
declare namespace TryLinq {
    class AppPage extends Juice.Page {
        protected static readonly DefaultAppPageStyles = "\n\n    .app-page {\n        display: flex;\n        flex-direction: column;\n        height: 100%;\n    }\n\n    .app-page-content {\n        flex-grow: 1;\n        overflow: hidden;\n    }";
        protected static readonly DefaultAppPageHtmlTemplate = "\n    <template template-class=\"AppPage\">\n        <div template-part=\"appRoot\" class=\"app-page\">\n            <div template-part=\"appToolbar\" class=\"app-page-toolbar\"></div>\n            <div template-part=\"appContent\" class=\"app-page-content\"></div>\n            <div class=\"app-page-footer\">\n                <span>linq-g ver. <span template-part=\"appVersion\"></span></span>\n            </div>\n        </div>\n    </template>";
        private static readonly DefaultAppPageTemplate;
        private static readonly DefaultEditorCode;
        private static readonly StoragePrefix;
        private _applicationService;
        private _part_appRoot;
        private _part_appToolbar;
        private _part_appContent;
        private _part_appVersion;
        private _appToolbar;
        private _appPanelsLayout;
        private _dataPanel;
        private _codePanel;
        private _resultsPanel;
        private _btnLayout1;
        private _btnLayout2;
        private _btnLayout3;
        private _btnTheme;
        constructor(applicationService: Juice.ApplicationService, template?: Juice.TemplateSource);
        protected initializeTemplate(templatedElement: Juice.TemplatedElement): void;
        private initializeAppToolbar;
        private initializeAppPanelsLayout;
        private initializeAppDataPanel;
        private initializeAppCodePanel;
        private initializeAppResultsPanel;
        private onApplicationThemeChanged;
        private onCodePanelResetCodeClick;
        private onResultsPanelUseAsDataClick;
        private onResultsPanelExportClick;
        private clone;
        private setLayout;
        private readFromLocalStorage;
        private saveToLocalStorage;
        private loadDefaultDataHandler;
        private loadResult;
        private downloadJsonData;
        private onButtonRunClick;
        private onButtonLayoutClick;
        private onButtonThemeClick;
    }
}
declare namespace TryLinq {
    enum PanelsLayoutType {
        Layout1 = 0,
        Layout2 = 1,
        Layout3 = 2
    }
    class AppPanelsLayout extends Juice.UIElement {
        protected static readonly DefaultAppPanelsLayoutStyles = "\n    .app-panels-layout {\n        height: 100%;\n        position: relative;\n    }";
        protected static readonly DefaultAppPanelsLayoutHtmlTemplate = "\n    <template template-class=\"AppFramesLayout\">\n        <div template-part=\"layoutRoot\" class=\"app-panels-layout\">\n            <div template-part=\"panel1\" class=\"layout-panel panel1\"></div>\n            <div template-part=\"panel2\" class=\"layout-panel panel2\"></div>\n            <div template-part=\"panel3\" class=\"layout-panel panel3\"></div>\n        </div>\n    </template>";
        private static readonly DefaultAppPanelsLayoutTemplate;
        private _panel1;
        private _panel2;
        private _panel3;
        private _layoutType;
        private _part_layoutRoot;
        private _part_panel1;
        private _part_panel2;
        private _part_panel3;
        constructor(template?: Juice.TemplateSource);
        protected initializeTemplate(templatedElement: Juice.TemplatedElement): void;
        private onLayoutTypeChanged;
        get panel1(): AppToolPanel;
        set panel1(v: AppToolPanel);
        get panel2(): AppToolPanel;
        set panel2(v: AppToolPanel);
        get panel3(): AppToolPanel;
        set panel3(v: AppToolPanel);
        get layoutType(): PanelsLayoutType;
        set layoutType(v: PanelsLayoutType);
    }
}
declare namespace TryLinq {
    class AppResultsPanel extends AppToolPanel {
        private _part_layoutRoot;
        private _part_content;
        private _tableView;
        private _btnClearResult;
        private _btnUseResultAsData;
        private _btnExportResult;
        constructor(template?: Juice.TemplateSource);
        protected initializeTemplate(templatedElement: Juice.TemplatedElement): void;
        onDataCleared: Juice.EventSet<AppResultsPanel, Juice.EventArgs>;
        onButtonUseAsDataClick: Juice.EventSet<AppResultsPanel, Juice.EventArgs>;
        onButtonExportClick: Juice.EventSet<AppResultsPanel, Juice.EventArgs>;
        get resultData(): any;
        set resultData(v: any);
        clearData(): void;
    }
}
declare namespace TryLinq {
    class AppToolbar extends Juice.Toolbar {
        protected static readonly DefaultAppToolbarStyles = "\n    .app-toolbar {\n        display: flex;\n        flex-flow: row;\n        align-items: center;\n    }\n\n    .app-toolbar-label {\n        flex-grow: 1;\n    }\n\n    .app-toolbar-items {\n        width: auto;\n        white-space: nowrap;\n        overflow-x: hidden;\n        display: flex;\n        flex-direction: row;\n        align-items: center;\n    }\n\n    /*.app-toolbar-button.button-theme i.icon-dark {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        font-size: 18px;\n        color: #fff;\n    }\n    .app-toolbar-button.button-theme i.icon-light {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        font-size: 18px;\n        color: #fff;\n        display: none;\n    }\n\n    .app-toolbar-button.button-theme.active i.icon-dark {\n        display: none;\n    }\n\n    .app-toolbar-button.button-theme.active i.icon-light {\n        display: block;\n    }*/";
        protected static readonly DefaultAppToolbarHtmlTemplate = "\n    <template template-class=\"AppToolbar\">\n    <div class=\"app-toolbar\">\n        <div template-part=\"header\" class=\"app-toolbar-label\"></div>\n        <div template-part=\"toolbarItems\" class=\"app-toolbar-items\"></div>\n        <!--<div template-part=\"toolbarMenuButton\" class=\"app-toolbar-button\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\n                <circle cx=\"12\" cy=\"5.5\" r=\"1.5\" fill=\"black\" />\n                <circle cx=\"12\" cy=\"12\" r=\"1.5\" fill=\"black\" />\n                <circle cx=\"12\" cy=\"18.5\" r=\"1.5\" fill=\"black\" />\n            </svg>\n        </div>-->\n    </div>\n</template>";
        private static readonly DefaultAppToolbarTemplate;
        constructor(template?: Juice.TemplateSource);
        protected initializeTemplate(templatedElement: Juice.TemplatedElement): void;
    }
}
declare namespace TryLinq {
    import Application = Juice.Application;
    class TryLinqApp extends Application {
        private _appPage;
        constructor();
        protected initialize(): void;
        run(): void;
    }
}