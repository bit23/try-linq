declare namespace Juice {
    interface ClassInfoBase {
        baseClass: any;
        className: string;
        isAbstract?: boolean;
    }
    interface ComponentInfoBase extends ClassInfoBase {
        tagName?: string;
    }
    interface ClassInfo<T> extends ClassInfoBase {
        classConstructor: new (...args: any[]) => T;
    }
    interface ComponentInfo<T> extends ComponentInfoBase {
        classConstructor: new (...args: any[]) => T;
    }
    interface ComponentsFilterOptions {
        baseClass?: any;
        className?: RegExp;
        tagName?: RegExp;
        classConstructor?: (...args: any[]) => any;
        extendClass?: any;
    }
    class Builder {
        private static _classes;
        private static _components;
        private static registerClass;
        private static registerComponent;
        private static classExtendsOrIsClass;
        static defineComponent<T>(info: ComponentInfo<T>): void;
        static defineClass<T>(info: ClassInfo<T>): void;
        static applyBehaviours(type: any, behaviourTypes: any[]): void;
        static getComponents(filterOptions?: ComponentsFilterOptions): Iterable<ComponentInfoBase>;
    }
}
declare namespace Juice {
    interface PropertyChangedEventArgs extends EventArgs {
        propertyName: string;
        propertyValue: any;
    }
    class BindableObject {
        protected readonly events: EventsManager;
        constructor();
        readonly onPropertyChanged: EventSet<BindableObject, PropertyChangedEventArgs>;
    }
}
declare namespace Juice {
    class UIElement extends BindableObject {
        private _template;
        private _templatedElement;
        private _htmlElement;
        private _data;
        private _applyTemplateListeners;
        constructor(template?: TemplateSource);
        private init;
        protected readonly resources: Map<string, any>;
        protected initializeTemplate(templatedElement: TemplatedElement): void;
        protected _onApplyTemplate(templatedElement: TemplatedElement): void;
        protected registerApplyTemplateListener(handler: (templatedElement: TemplatedElement) => void): void;
        get data(): any;
        set data(v: any);
        readonly uid: string;
        get template(): TemplateSource;
        set template(v: TemplateSource);
        get htmlElement(): Element;
        appendToHtmlElement(parentElement: HTMLElement | string): boolean;
        getApplicationId(): string;
        getApplication(): Application;
    }
}
declare namespace Juice {
    class UIElementBehaviour extends BindableObject {
        static applyTo(type: any, behaviourTypes: any[]): void;
        protected static initialize<T extends UIElementBehaviour>(behaviourType: new () => T, instance: UIElement): void;
    }
}
declare namespace Juice {
    class HeaderedControlBehaviour extends UIElementBehaviour {
        private _headerValue;
        private _headerElement;
        private _headerElementSelector;
        private initializeHeaderedControlBehaviour;
        private onHeaderPropertyChanged;
        private getHeaderElement;
        protected _onHeaderChanged(headerElement: HTMLElement, content: Content): void;
        protected _setHeaderElement(headerElement: Selector | HTMLElement): void;
        get header(): Content;
        set header(v: Content);
    }
    class HeaderedControl extends UIElement {
        constructor(template?: TemplateSource);
        protected initializeTemplate(templatedElement: TemplatedElement): void;
        protected _onApplyTemplate(templatedElement: TemplatedElement): void;
    }
    interface HeaderedControl extends HeaderedControlBehaviour {
        new (template?: string | HTMLTemplateElement | HTMLElement): HeaderedControl;
    }
}
declare namespace Juice {
    class Control extends UIElement {
        constructor(template?: TemplateSource);
        protected initializeTemplate(templatedElement: TemplatedElement): void;
        get isEnabled(): boolean;
        set isEnabled(v: boolean);
    }
}
declare namespace Juice {
    type ValueContent = undefined | string | number | boolean | object;
    type VisualContent = HTMLElement | UIElement | NodeList;
    type ContentArray = Array<ValueContent> | Array<VisualContent>;
    type Content = string | number | boolean | object | HTMLElement | UIElement | ContentArray;
    class ContentControlBehaviour extends UIElementBehaviour {
        private _contentValue;
        private _contentElement;
        private _contentElementSelector;
        private initializeContentControlBehaviour;
        private onContentPropertyChanged;
        private getContentElement;
        protected _onContentChanged(contentElement: HTMLElement, content: Content): void;
        protected _setContentElement(contentElement: Selector | HTMLElement): void;
        get content(): Content;
        set content(v: Content);
    }
    class ContentControl extends Control {
        private static readonly DefaultContentControlTemplate;
        constructor(template?: TemplateSource);
        protected initializeTemplate(templatedElement: TemplatedElement): void;
        protected _onApplyTemplate(templatedElement: TemplatedElement): void;
    }
    interface ContentControl extends ContentControlBehaviour {
        new (template?: string | HTMLTemplateElement | HTMLElement): ContentControl;
    }
}
declare namespace Juice {
    class HeaderedContentControl extends UIElement {
        constructor(template?: TemplateSource);
        protected initializeTemplate(templatedElement: TemplatedElement): void;
    }
    interface HeaderedContentControl extends HeaderedControlBehaviour, ContentControlBehaviour {
        new (template?: string | HTMLTemplateElement | HTMLElement): HeaderedContentControl;
    }
}
declare namespace Juice {
    interface AccordionStateChangedArgs {
        isExpanded: boolean;
        isFirstExpansion: boolean;
    }
    class Accordion extends HeaderedContentControl {
        protected static readonly DefaultAccordionStyles = "\n    .jui-accordion {\n    \n    }\n    \n    .jui-accordion-header {\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        /*border-top-left-radius: 3px;\n        border-top-right-radius: 3px;\n        border: 1px solid #ccc;\n        background: #eee;\n        padding-top: 4px;\n        padding-left: 6px;\n        padding-right: 3ch;\n        padding-bottom: 5px;*/\n        position: relative;\n        user-select: none;\n        cursor: pointer;\n    }\n    \n    .jui-accordion-symbol {\n        position: absolute;\n        right: 1ch;\n        top: 50%;\n        transform: translateY(-50%);\n        /*color: #777;*/\n    }\n\n    .jui-accordion-symbol > .expanded {\n        display: none;\n    }\n\n    .jui-accordion-symbol > .collapsed {\n        display: inline;\n    }\n    \n    .jui-accordion-symbol.expanded > .expanded {\n        display: inline;\n    }\n    \n    .jui-accordion-symbol.expanded > .collapsed {\n        display: none;\n    }\n    \n    .jui-accordion-container {\n        display: none;\n        /*padding: 6px;\n        border-top: 0;\n        border-left: 1px solid #ccc;\n        border-right: 1px solid #ccc;\n        border-bottom: 1px solid #ccc;*/\n        content: ' ';\n    }";
        protected static readonly DefaultAccordionHtmlTemplate = "\n    <template template-class=\"Juice.Accordion\">\n        <div class=\"jui-accordion\">\n            <div template-part=\"accordionHeader\" class=\"jui-accordion-header\">\n                <div template-part=\"accordionHead\" class=\"jui-accordion-head\"><span template-part=\"header\"></span></div>\n                <div template-part=\"accordionSymbol\" class=\"jui-accordion-symbol\"><i class=\"fa fa-chevron-down collapsed\"></i><i class=\"fa fa-chevron-up expanded\"></i></div>\n            </div>\n            <div template-part=\"accordionContainer\" class=\"jui-accordion-container\">\n                <div>text from template</div>\n                <div template-part=\"content\"></div>\n            </div>\n        </div>\n    </template>";
        private static readonly DefaultAccordionTemplate;
        private _isExpanded;
        private _neverExpanded;
        private _part_accordionHeader;
        private _part_accordionHead;
        private _part_accordionSymbol;
        private _part_accordionContainer;
        constructor(template?: string | HTMLTemplateElement | HTMLElement);
        protected initializeTemplate(templatedElement: TemplatedElement): void;
        private onHeaderClick;
        private onIsExpandedChanged;
        onStateChanged: EventSet<Accordion, AccordionStateChangedArgs>;
        get isExpanded(): boolean;
        set isExpanded(v: boolean);
    }
}
declare namespace Juice {
    type TemplateSource = Template | string | HTMLElement;
    class Template {
        private static loadTemplateDocument;
        static from(html: string | Document): Template;
        private _element;
        private _styles;
        private _script;
        constructor(className: string, element: HTMLTemplateElement, styles: HTMLStyleElement, script: HTMLScriptElement);
        readonly templateClass: string;
        importTemplate(): TemplatedElement;
        importStyles(): HTMLStyleElement;
    }
    class TemplatedElement {
        private _template;
        private _parts;
        private _templateNode;
        constructor(template: Template, templateNode: ParentNode);
        private findParts;
        get rootElement(): Element;
        get templateDefinition(): Template;
        getPart<T>(name: string, throwIfNotExists?: boolean): TemplatePart<T>;
        withPartElement<T>(name: string, action: (element: T) => void, throwIfNotExists?: boolean): T;
    }
    class TemplatePart<T> {
        constructor(name: string, element: T);
        readonly name: string;
        readonly element: T;
    }
    class TemplateManager {
        private static _templateDefinitions;
        private static _importedClassesStyles;
        static createTemplate(templateSource: TemplateSource): Template;
        static addTemplate(template: Template): void;
        static getTemplate(className: string): Promise<Template>;
        static loadExternal(className: string): Promise<Template>;
    }
}
declare namespace Juice {
    interface ApplicationOptions {
        [name: string]: () => any;
        rootNode?: () => Node;
        mainElement?: () => UIElement;
        appId?: () => string;
        currentTheme?: () => string;
    }
    class ApplicationService {
        readonly application: Application;
        constructor(application: Application, setCurrentPageHandler: (page: Page) => void, setCurrentThemeHandler: (theme: string) => void);
        readonly setCurrentPage: (page: Page) => void;
        readonly setCurrentTheme: (theme: string) => void;
    }
    class Application {
        private readonly _defaultOptions;
        private _isRunning;
        private _root;
        private _configure;
        private _options;
        private _appFrame;
        private _appId;
        private _currentPage;
        private _currentTheme;
        protected readonly applicationService: ApplicationService;
        protected readonly events: EventsManager;
        constructor();
        protected initialize(): void;
        private setCurrentPage;
        private setCurrentTheme;
        private readOptions;
        private getOptionsValueOrDefault;
        private assertIsRunning;
        readonly onApplicationReady: EventSet<Application, EventArgs>;
        readonly onThemeChanged: EventSet<Application, EventArgs>;
        configure(configure: () => ApplicationOptions): void;
        run(): void;
        get appId(): string;
        get rootElement(): Element;
        get currentPage(): Page;
        get currentTheme(): string;
    }
}
declare namespace Juice {
    abstract class ButtonBase extends ContentControl {
        private _isSelected;
        private _isToggle;
        constructor(template?: TemplateSource);
        protected initializeTemplate(templatedElement: TemplatedElement): void;
        protected onButtonClick(e: Event): void;
        private onIsSelectedPropertyChanged;
        onClick: EventSet<ButtonBase, EventArgs>;
        get isSelected(): boolean;
        set isSelected(v: boolean);
        get isToggle(): boolean;
        set isToggle(v: boolean);
        focus(): void;
    }
    class Button extends ButtonBase {
        protected static readonly DefaultButtonStyles = "\n    .jui-button {\n        display: inline-block;\n        /*padding: 4px 12px;\n        border-radius: 4px;\n        border: 1px solid #006ab6;\n        border-bottom: 1px solid #004475;\n        background-color: #006ab6;\n        color: #f0f0f0;*/\n        cursor: default;\n        user-select: none;\n    }\n\n    /*.jui-button:hover {\n        border-color: #0094ff;\n        border-bottom-color: #006ab6;\n        background-color: #0094ff;\n        color: #fff;\n        box-shadow: 0px 0px 2px 2px rgba(45, 165, 252, 0.2);\n    }*/";
        protected static readonly DefaultButtonHtmlTemplate = "\n<template template-class=\"Juice.Button\">\n    <button template-part=\"button\" class=\"jui-button\">\n        <div template-part=\"content\" class=\"jui-button-content\"></div>\n    </button>\n</template>";
        private static readonly DefaultButtonTemplate;
        constructor(template?: TemplateSource);
    }
    enum FileReadType {
        ArrayBuffer = "arrayBuffer",
        BinaryString = "binaryString",
        DataURL = "dataURL",
        Text = "text"
    }
    class FileButton extends Button {
        protected static readonly DefaultFileButtonHtmlTemplate = "\n<template template-class=\"Juice.FileButton\">\n    <button template-part=\"button\" class=\"jui-button\">\n        <input template-part=\"inputFile\" type=\"file\" style=\"display: none\" />\n        <div template-part=\"content\" class=\"jui-button-content\"></div>\n    </button>\n</template>";
        private static readonly DefaultFileButtonTemplate;
        private _part_inputFile;
        private _readerHandler;
        constructor(template?: TemplateSource);
        protected initializeTemplate(templatedElement: TemplatedElement): void;
        private onHiddenFileDataChanged;
        protected onButtonClick(e: Event): void;
        readerHandler(handler: (reader: FileReader) => void): void;
        get accept(): string;
        set accept(v: string);
        readType: FileReadType;
    }
    class LinkButton extends ButtonBase {
        protected static readonly DefaultLinkButtonStyles = "\n    .jui-link-button {\n        padding-left: 2px;\n        padding-right: 2px;\n        border-radius: 3px;\n        display: inline-block;\n        color: #006ab6;\n        user-select: none;\n    }\n\n    .jui-link-button:hover {\n        background-color: #0094ff;\n        color: #fff;\n        text-decoration: none;\n    }";
        protected static readonly DefaultLinkButtonHtmlTemplate = "\n    <template template-class=\"Juice.LinkButton\">\n        <a template-part=\"content\" class=\"jui-link-button\"></a>\n    </template>";
        private static readonly DefaultLinkButtonTemplate;
        private _part_linkButton;
        constructor(template?: TemplateSource);
        protected initializeTemplate(templatedElement: Juice.TemplatedElement): void;
        get href(): string;
        set href(v: string);
        get title(): string;
        set title(v: string);
    }
}
declare namespace Juice {
    enum CollectionChangedAction {
        Added = 0,
        Removed = 1,
        Cleared = 2
    }
    class CollectionChangedEventArgs<T> implements EventArgs {
        readonly action: CollectionChangedAction;
        readonly index: number;
        constructor(action: CollectionChangedAction, index: number, items: T[]);
        readonly items: T[];
    }
    class Collection<T> {
        private _items;
        private _events;
        constructor(initialItems?: T[]);
        private triggerCollectionChanged;
        insert(index: number, item: T): number;
        insertRange(index: number, items: T[]): number;
        get length(): number;
        forEach(callback: (item: T, index: number, collection: Collection<T>) => void): void;
        mapToArray(callback: (item: T, index: number, collection: Collection<T>) => T): T[];
        add(item: T): number;
        addRange(items: T[]): number;
        at(index: number): T;
        clear(): void;
        contains(item: any, selector: (item: T) => any): boolean;
        indexOf(item: any, selector?: (item: T) => any): number;
        remove(item: any, selector?: (item: T) => any): boolean;
        removeAt(index: number): T;
        removeItems(items: T[]): T[];
        removeRange(index: number, length: number): T[];
        removeAll(predicate?: (item: T, index?: number) => boolean): T[];
        toArray(): T[];
        readonly onItemsAdded: EventSet<Collection<T>, CollectionChangedEventArgs<T>>;
        readonly onItemsRemoved: EventSet<Collection<T>, CollectionChangedEventArgs<T>>;
        readonly onCollectionCleared: EventSet<Collection<T>, CollectionChangedEventArgs<T>>;
    }
}
declare namespace Juice {
    class Dialog extends UIElement {
        protected static readonly DefaultDialogStyles = "\n    .jui-dialog {\n        position: fixed;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        /*min-width: 240px;\n        min-height: 100px;\n        border-radius: 4px 4px 2px 2px;\n        background-color: #fff;\n        box-shadow: 0px 0px 5px 5px rgba(0, 0, 0, 0.07);\n        border: 1px solid #c0c0c0;*/\n        display: flex;\n        flex-direction: column;\n    }\n    \n    .jui-dialog-header {\n        height: auto;\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        /*padding: 5px 20px;\n        font-weight: 600;\n        border-radius: 4px 4px 0 0;\n        border-bottom: 2px solid #fff;\n        background-color: #f0f0f0;*/\n    }\n    \n    .jui-dialog-content {\n        height: auto;\n        flex-grow: 1;\n        /*border-radius: 0 0 2px 2px;\n        padding: 10px 20px;*/\n    }\n    \n    .jui-dialog-buttons {\n        height: auto;\n        /*text-align: center;\n        padding-top: 10px;\n        padding-bottom: 15px;*/\n    }";
        protected static readonly DefaultDialogHtmlTemplate = "\n    <template template-class=\"Juice.Dialog\">\n        <div template-part=\"dialog\" class=\"jui-dialog\">\n            <div template-part=\"header\" class=\"jui-dialog-header\"></div>\n            <div template-part=\"content\" class=\"jui-dialog-content\"></div>\n            <div template-part=\"buttons\" class=\"jui-dialog-buttons\"></div>\n        </div>\n    </template>";
        private static readonly DefaultDialogTemplate;
        private _content;
        private _part_dialog;
        private _part_header;
        private _part_content;
        private _part_buttons;
        constructor(title: string, template?: TemplateSource);
        protected initializeTemplate(templatedElement: TemplatedElement): void;
        protected setContent(content: Content): void;
        protected getButtonsContainer(): HTMLElement;
        show(parent?: Element): void;
        hide(): void;
    }
    class ModalDialog extends Dialog {
        protected static readonly DefaultModalDialogStyles: string;
        protected static readonly DefaultModalDialogHtmlTemplate = "\n    <template template-class=\"Juice.ModalDialog\">\n        <div template-part=\"dialogMask\" class=\"jui-dialog-mask\">\n            <div template-part=\"dialog\" class=\"jui-dialog\">\n                <div template-part=\"header\" class=\"jui-dialog-header\"></div>\n                <div template-part=\"content\" class=\"jui-dialog-content\"></div>\n                <div template-part=\"buttons\" class=\"jui-dialog-buttons\"></div>\n            </div>\n        </div>\n    </template>";
        protected _part_dialogMask: HTMLElement;
        private static readonly DefaultModalDialogTemplate;
        constructor(title: string, template?: TemplateSource);
        protected initializeTemplate(templatedElement: TemplatedElement): void;
    }
    class MessageDialog extends ModalDialog {
        static showMessage(title: string, message: string, parent?: Element): void;
        constructor(title: string, message: string, template?: TemplateSource);
        protected initializeTemplate(templatedElement: TemplatedElement): void;
    }
    enum QuestionDialogButtons {
        OkCancel = 0,
        YesNo = 1
    }
    class QuestionDialog extends ModalDialog {
        private _result?;
        private _onCompleted;
        constructor(title: string, message: string, buttons: QuestionDialogButtons, onCompleted: (result: boolean) => void);
        private closeDialog;
        get result(): boolean;
    }
}
declare namespace Juice {
    interface EventArgs {
        [name: string]: any;
    }
    type EventHandler<TOwner, TArgs> = (sender: TOwner, eventArgs: TArgs) => void;
    interface EventOptions {
        once: boolean;
    }
    interface EventGroup<T, TArgs> {
        eventName: string;
        entries: Array<EventEntry<T, TArgs>>;
    }
    interface EventEntry<T, TArgs> {
        handler: EventHandler<T, TArgs>;
        options: EventOptions;
        bindTarget: any;
    }
    interface IEventSet<TOwner, TArgs> {
        add(handler: EventHandler<TOwner, TArgs>): void;
        once(handler: EventHandler<TOwner, TArgs>): void;
        remove(handler: EventHandler<TOwner, TArgs>): void;
        has(handler: EventHandler<TOwner, TArgs>): boolean;
        trigger(args?: TArgs): void;
        stop(): void;
        resume(): void;
    }
    class EventSet<TOwner, TArgs> implements IEventSet<TOwner, TArgs> {
        private _eventsManager;
        private _eventName;
        private _bindTarget;
        constructor(eventGroup: EventsManager, eventName: string, bindTarget?: any);
        add(handler: EventHandler<TOwner, TArgs>, bindTarget?: any): void;
        once(handler: EventHandler<TOwner, TArgs>): void;
        remove(handler: EventHandler<TOwner, TArgs>): void;
        has(handler: EventHandler<TOwner, TArgs>): boolean;
        trigger(args?: TArgs): void;
        stop(): void;
        resume(): void;
    }
    class EventsManager {
        private readonly _owner;
        private readonly _validEventOptions;
        private _events;
        private _disabledEventsNames;
        constructor(owner: any);
        private getHandlerEntryIndex;
        attach<TArgs>(eventName: string, eventHandler: EventHandler<any, TArgs>, eventOptions?: EventOptions, bindTarget?: any): void;
        detach<TArgs>(eventName: string, eventHandler: EventHandler<any, TArgs>): void;
        trigger<TArgs>(eventName: string, args?: TArgs): void;
        getHandlersCount(eventName: string): number;
        hasHandler<TArgs>(eventName: string, eventHandler: EventHandler<any, TArgs>): boolean;
        stop(eventName?: string): void;
        resume(eventName?: string): void;
        create<TArgs>(eventName: string): EventSet<any, TArgs>;
        createEventArgs(data?: {
            [name: string]: any;
        }): EventArgs;
    }
}
declare namespace Juice {
    class ItemsControlBehaviour extends UIElementBehaviour {
        private _items;
        private initializeItemsControlBehaviour;
        private onItemsCollectionChanged;
        protected _onItemsCollectionChanged(args: CollectionChangedEventArgs<UIElement>): void;
        get items(): Collection<UIElement>;
    }
    class ItemsControl extends UIElement {
        constructor(template?: TemplateSource);
    }
    interface ItemsControl extends ItemsControlBehaviour {
        new (template?: Template): ItemsControl;
    }
}
declare namespace Juice {
    type GridLength = number | "auto";
    interface GridColumn {
        width: GridLength;
    }
    interface GridRow {
        height: GridLength;
    }
    class Grid extends ItemsControl {
        private static readonly DefaultGridTemplate;
        static getColumn(uiElement: UIElement): number;
        static getRow(uiElement: UIElement): number;
        static getColumnAndRow(uiElement: UIElement): {
            column: number;
            row: number;
        };
        static setColumn(uiElement: UIElement, column: number): void;
        static setRow(uiElement: UIElement, row: number): void;
        static setColumnAndRow(uiElement: UIElement, column: number, row: number): void;
        private _columnDefinitions;
        private _rowDefinitions;
        private _cells;
        private _part_gridContainer;
        private _onUpdateLayout;
        private _layoutUpdated;
        constructor(template?: TemplateSource);
        protected initializeTemplate(templatedElement: TemplatedElement): void;
        private prepareGrid;
        private arrangeCells;
        private updateGridLayout;
        private createCellWrapper;
        private getCellWrapper;
        private onGridColumnCollectionChanged;
        private onGridRowCollectionChanged;
        private onItemsAdded;
        private onItemsRemoved;
        private onCollectionCleared;
        protected _onItemsCollectionChanged(args: CollectionChangedEventArgs<UIElement>): void;
        get columnDefinitions(): Collection<GridColumn>;
        get rowDefinitions(): Collection<GridRow>;
    }
}
declare namespace Juice {
    class HeaderedItemsControl extends UIElement {
        constructor(template?: TemplateSource);
        protected initializeTemplate(templatedElement: TemplatedElement): void;
    }
    interface HeaderedItemsControl extends HeaderedControlBehaviour, ItemsControlBehaviour {
        new (template?: string | HTMLTemplateElement | HTMLElement): HeaderedItemsControl;
    }
}
declare namespace Juice {
    class HtmlContainer extends UIElement {
        private _part_container;
        constructor(template?: Template);
        protected initializeTemplate(templatedElement: TemplatedElement): void;
        get html(): string;
        set html(v: string);
        addContent(...content: HTMLElement[]): void;
        setContent(...content: HTMLElement[]): void;
    }
}
declare namespace Juice {
    function getApplication(appId: string): Application;
    function registerApplication(application: Application): void;
    function unregisterApplication(application: Application): boolean;
}
declare namespace Juice {
    class Page extends UIElement {
        constructor(template?: TemplateSource);
    }
}
declare namespace Juice {
    class Selector {
        selector: string;
        context?: ParentNode | (() => ParentNode);
        constructor(selector: string, context?: ParentNode | (() => ParentNode));
        private getCurrentContext;
        query(): Element;
        queryAll(): NodeListOf<Element>;
    }
}
declare namespace Juice {
    enum Orientation {
        Horizontal = "horizontal",
        Vertical = "vertical"
    }
    class StackLayout extends ItemsControl {
        protected static readonly DefaultStackLayoutStyle = "\n        .jui-stack-layout-items {\n            display: flex;\n            flex-direction: column;\n            justify-content: flex-start;\n            align-items: flex-start;\n        }\n        \n        .jui-stack-layout-items.vertical {\n            flex-direction: column;\n        }\n        \n        .jui-stack-layout-items.horizontal {\n            flex-direction: row;\n        }";
        protected static readonly DefaultStackLayoutHtmlTemplate = "\n<template template-class=\"Juice.StackLayout\">\n    <div class=\"jui-stack-layout\">\n        <div template-part=\"layoutItems\" class=\"jui-stack-layout-items vertical\"></div>\n    </div>\n</template>";
        private static readonly DefaultStackLayoutTemplate;
        private _part_layoutItems;
        private _orientation;
        constructor(template?: TemplateSource);
        protected initializeTemplate(templatedElement: TemplatedElement): void;
        protected _onItemsCollectionChanged(args: CollectionChangedEventArgs<UIElement>): void;
        private onItemsAdded;
        private onItemsRemoved;
        private onCollectionCleared;
        private onOrientationChanged;
        get orientation(): Orientation;
        set orientation(v: Orientation);
    }
}
declare namespace Juice {
    class TableView extends UIElement {
        protected static readonly DefaultTableViewStyles = "\n    .jui-table-view {\n        width: auto;\n        white-space: nowrap;\n    }\n\n    .jui-table-view thead {\n    }\n\n    .jui-table-view th {\n        white-space: nowrap;\n        /*padding: 0 4px;\n        font-size: 0.9em;*/\n    }\n\n    .jui-table-view td {\n        white-space: nowrap;\n        /*padding-left: 4px;\n        padding-right: 4px;*/\n    }";
        protected static readonly DefaultTableViewHtmlTemplate = "\n    <template template-class=\"Juice.TableView\">\n        <table template-part=\"table\" class=\"jui-table-view\">\n        </table>\n    </template>";
        private static readonly DefaultTableViewTemplate;
        private _part_table;
        constructor(template?: Template);
        protected initializeTemplate(templatedElemnt: TemplatedElement): void;
        private onDataPropertyChanged;
        private loadIterable;
        private loadPrimitive;
        private loadObject;
        private clearTable;
        clear(): void;
    }
}
declare namespace Juice {
    class Toolbar extends HeaderedItemsControl {
        protected static readonly DefaultToolbarStyles = "\n    .jui-toolbar {\n        display: flex;\n        flex-flow: row;\n        align-items: center;\n    }\n\n    .jui-toolbar-label {\n        width: auto;\n        /*padding: 0 10px;*/\n        white-space: nowrap;\n    }\n\n    .jui-toolbar-items {\n        width: 100%;\n        white-space: nowrap;\n        overflow-x: hidden;\n        align-items: center;\n        display: flex;\n    }\n\n    .jui-toolbar-items > * {\n        display: inline-block;\n        vertical-align: middle;\n    }\n\n    .jui-toolbar-button {\n        display: inline-block;\n        height: 100%;\n        /*min-width: 32px;\n        min-height: 32px;\n        color: #222;\n        background-color: transparent;\n        outline: 0;\n        border: 0;\n        border-radius: 0;\n        padding: 4px 4px;*/\n        background-position: center center;\n        background-repeat: no-repeat;\n        background-size: auto;\n        position: relative;\n        cursor: default;\n        user-select: none;\n    }\n\n    .jui-toolbar-menu-button > svg {\n        display: block;\n        /*position: relative;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%,-50%);*/\n    }";
        protected static readonly DefaultToolbarHtmlTemplate = "\n<template template-class=\"Juice.Toolbar\">\n    <div class=\"jui-toolbar\">\n        <div template-part=\"header\" class=\"jui-toolbar-label\"></div>\n        <div template-part=\"toolbarItems\" class=\"jui-toolbar-items\"></div>\n        <button disabled template-part=\"toolbarMenuButton\" class=\"jui-toolbar-button jui-toolbar-menu-button\">\n            <svg class=\"jui-toolbar-icon-svg\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\n                <circle cx=\"12\" cy=\"5.5\" r=\"1.5\" />\n                <circle cx=\"12\" cy=\"12\" r=\"1.5\" />\n                <circle cx=\"12\" cy=\"18.5\" r=\"1.5\" />\n            </svg>\n        </button>\n    </div>\n</template>";
        private static readonly DefaultToolbarTemplate;
        private _part_toolbarItems;
        constructor(template?: TemplateSource);
        protected initializeTemplate(templatedElement: TemplatedElement): void;
        private onItemsAdded;
        private onItemsRemoved;
        private onCollectionCleared;
        protected _onItemsCollectionChanged(args: CollectionChangedEventArgs<UIElement>): void;
        protected _onApplyTemplate(templatedElement: TemplatedElement): void;
        addButton(content?: Content): Button;
        addSeparator(): HtmlContainer;
        addLabel(text: string): HtmlContainer;
    }
}
declare namespace Juice {
    namespace Internals {
        function isPrimitive(value: any): boolean;
    }
}
declare namespace Juice {
    namespace Internals {
        var templateDirPath: string;
        function getTemplateFile(relativePath: string): Promise<Document>;
    }
}
declare namespace Juice {
    namespace Internals {
        function getFreeUid(): string;
        function registerElement(uid: string, instance: any, element: Element): void;
        function setContent(element: HTMLElement, content: Content): void;
    }
}
