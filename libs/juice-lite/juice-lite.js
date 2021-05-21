var Juice;
(function (Juice) {
    class Builder {
        static registerClass(info) {
            if (this._classes.has(info.className)) {
                console.log(info.className + " already defined");
                return;
            }
            this._classes.set(info.className, info);
        }
        static registerComponent(info) {
            if (this._components.has(info.className)) {
                console.log(info.className + " already defined");
                return;
            }
            this._components.set(info.className, info);
        }
        static classExtendsOrIsClass(componentInfo, testClass) {
            if (componentInfo.classConstructor === testClass) {
                return true;
            }
            return componentInfo.classConstructor.prototype instanceof testClass;
        }
        static defineComponent(info) {
            this.registerComponent(info);
            Object.defineProperty(info.classConstructor, "baseClass", { value: info.baseClass });
            Object.defineProperty(info.classConstructor, "className", { value: info.className });
            if (info.tagName) {
                Object.defineProperty(info.classConstructor, "tagName", { value: info.tagName });
            }
        }
        static defineClass(info) {
            this.registerClass(info);
            Object.defineProperty(info.classConstructor, "className", { value: info.className });
            Object.defineProperty(info.classConstructor, "baseClass", { value: info.baseClass });
        }
        static applyBehaviours(type, behaviourTypes) {
            behaviourTypes.forEach(baseCtor => {
                Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
                    Object.defineProperty(type.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
                });
            });
        }
        static getComponents(filterOptions) {
            if (!filterOptions) {
                return this._components.values();
            }
            else {
                let filterHandler = (v) => {
                    if (filterOptions.extendClass && !this.classExtendsOrIsClass(v, filterOptions.extendClass)) {
                        return false;
                    }
                    if (filterOptions.baseClass && filterOptions.baseClass !== v.baseClass) {
                        return false;
                    }
                    if (filterOptions.className && !filterOptions.className.test(v.className)) {
                        return false;
                    }
                    if (filterOptions.tagName && !filterOptions.tagName.test(v.tagName)) {
                        return false;
                    }
                    if (filterOptions.classConstructor) {
                        if ("classConstructor" in v) {
                            let component = v;
                            if (filterOptions.classConstructor !== component.classConstructor) {
                                return false;
                            }
                        }
                        else {
                            return false;
                        }
                    }
                    return true;
                };
                return Array.from(this._components.values()).filter(filterHandler);
            }
        }
    }
    Builder._classes = new Map();
    Builder._components = new Map();
    Juice.Builder = Builder;
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class BindableObject {
        constructor() {
            this.events = new Juice.EventsManager(this);
            this.onPropertyChanged = new Juice.EventSet(this.events, "onPropertyChanged", this);
        }
    }
    Juice.BindableObject = BindableObject;
    Juice.Builder.defineClass({
        baseClass: Object,
        classConstructor: BindableObject,
        className: "Juice.BindableObject"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class UIElement extends Juice.BindableObject {
        constructor(template) {
            super();
            this._applyTemplateListeners = [];
            this._htmlElement = document.createElement("div");
            this.uid = Juice.Internals.getFreeUid();
            this.resources = new Map();
            this.init(template);
        }
        init(template) {
            if (template) {
                this._template = Juice.TemplateManager.createTemplate(template);
                this._templatedElement = this._template.importTemplate();
                this.initializeTemplate(this._templatedElement);
            }
            else {
                Juice.TemplateManager
                    .getTemplate(this.constructor.className)
                    .then(result => {
                    this.template = result;
                })
                    .catch(err => { throw new Error(err); });
            }
        }
        initializeTemplate(templatedElement) {
            let templateHtmlElement = templatedElement.rootElement;
            if (templateHtmlElement != this.htmlElement) {
                templateHtmlElement.setAttribute("uid", this.uid.toString());
                if (this._htmlElement) {
                    if (this._htmlElement.parentElement && templateHtmlElement != this._htmlElement) {
                        this._htmlElement.parentElement.insertBefore(templateHtmlElement, this._htmlElement);
                        this._htmlElement.parentElement.removeChild(this._htmlElement);
                    }
                }
                if (this._htmlElement.parentElement) {
                    this._htmlElement.parentElement.insertBefore(templateHtmlElement, this._htmlElement);
                    this._htmlElement.remove();
                }
                this._htmlElement = templateHtmlElement;
                Juice.Internals.registerElement(this.uid, this, this._htmlElement);
            }
        }
        _onApplyTemplate(templatedElement) { }
        registerApplyTemplateListener(handler) {
            handler = handler.bind(this);
            this._applyTemplateListeners.push(handler);
        }
        get data() {
            return this._data;
        }
        set data(v) {
            this._data = v;
            this.onPropertyChanged.trigger({ propertyName: "data", propertyValue: v });
        }
        get template() {
            return this._template;
        }
        set template(v) {
            this.init(v);
            this._onApplyTemplate(this._templatedElement);
            for (let handler of this._applyTemplateListeners)
                handler(this._templatedElement);
            this.onPropertyChanged.trigger({ propertyName: "template", propertyValue: v });
        }
        get htmlElement() {
            return this._htmlElement;
        }
        appendToHtmlElement(parentElement) {
            if (parentElement == null) {
                parentElement = document.body;
            }
            else if (typeof parentElement === "string") {
                parentElement = document.querySelector(parentElement);
            }
            if (parentElement instanceof HTMLElement) {
                parentElement.appendChild(this._htmlElement);
                return true;
            }
            return false;
        }
        getApplicationId() {
            if (this._htmlElement.parentElement) {
                let element = this._htmlElement;
                while (element != null) {
                    if (element.hasAttribute("app-id")) {
                        return element.getAttribute("app-id");
                    }
                    element = element.parentElement;
                }
            }
            return null;
        }
        getApplication() {
            let appId = this.getApplicationId();
            if (appId) {
                return Juice.getApplication(appId);
            }
            return null;
        }
    }
    Juice.UIElement = UIElement;
    Juice.Builder.defineComponent({
        baseClass: Juice.BindableObject,
        className: "Juice.UIElement",
        classConstructor: UIElement
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class UIElementBehaviour extends Juice.BindableObject {
        static applyTo(type, behaviourTypes) {
            behaviourTypes.forEach(baseCtor => {
                Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
                    Object.defineProperty(type.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
                });
            });
        }
        static initialize(behaviourType, instance) {
            var initializeName = "initialize" + behaviourType.name;
            var initializeMethod = instance[initializeName];
            if (typeof initializeMethod === "function") {
                initializeMethod.bind(instance)();
            }
            else {
                console.warn("missing initialize method: " + initializeName);
            }
        }
    }
    Juice.UIElementBehaviour = UIElementBehaviour;
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class HeaderedControlBehaviour extends Juice.UIElementBehaviour {
        constructor() {
            super(...arguments);
            this._headerValue = null;
            this._headerElement = null;
            this._headerElementSelector = null;
        }
        initializeHeaderedControlBehaviour() {
            this.registerApplyTemplateListener(() => {
                this.onHeaderPropertyChanged();
            });
        }
        onHeaderPropertyChanged() {
            var headerElement = this.getHeaderElement();
            if (headerElement)
                Juice.Internals.setContent(headerElement, this._headerValue);
            this._onHeaderChanged(headerElement, this._headerValue);
        }
        getHeaderElement() {
            if (this._headerElementSelector) {
                this._headerElement = this._headerElementSelector.query();
            }
            return this._headerElement;
        }
        _onHeaderChanged(headerElement, content) { }
        _setHeaderElement(headerElement) {
            if (headerElement instanceof HTMLElement) {
                this._headerElement = headerElement;
                this._headerElementSelector = null;
            }
            else {
                this._headerElementSelector = headerElement;
            }
        }
        get header() {
            return this._headerValue;
        }
        set header(v) {
            if (this._headerValue != v) {
                this._headerValue = v;
                this.onHeaderPropertyChanged();
                this.events.trigger("onPropertyChanged", { propertyName: "header", propertyValue: v });
            }
        }
    }
    Juice.HeaderedControlBehaviour = HeaderedControlBehaviour;
    class HeaderedControl extends Juice.UIElement {
        constructor(template) {
            super(template);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            Juice.UIElementBehaviour.initialize(HeaderedControlBehaviour, this);
            this._setHeaderElement(templatedElement.getPart("header").element);
        }
        _onApplyTemplate(templatedElement) {
            super._onApplyTemplate(templatedElement);
            this.initializeTemplate(templatedElement);
        }
    }
    Juice.HeaderedControl = HeaderedControl;
    Juice.Builder.applyBehaviours(HeaderedControl, [HeaderedControlBehaviour]);
    Juice.Builder.defineComponent({
        baseClass: Juice.UIElement,
        classConstructor: HeaderedControl,
        className: "Juice.HeaderedControl",
        tagName: "jui-headered-control"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class Control extends Juice.UIElement {
        constructor(template) {
            super(template);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
        }
        get isEnabled() {
            return !this.htmlElement.hasAttribute("disabled");
        }
        set isEnabled(v) {
            if (!!v) {
                this.htmlElement.removeAttribute("disabled");
            }
            else {
                this.htmlElement.setAttribute("disabled", "disabled");
            }
        }
    }
    Juice.Control = Control;
    Juice.Builder.defineComponent({
        baseClass: Juice.UIElement,
        classConstructor: Control,
        className: "Juice.Control",
        tagName: "jui-control"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class ContentControlBehaviour extends Juice.UIElementBehaviour {
        constructor() {
            super(...arguments);
            this._contentValue = null;
            this._contentElement = null;
            this._contentElementSelector = null;
        }
        initializeContentControlBehaviour() {
            this.registerApplyTemplateListener(() => {
                this.onContentPropertyChanged();
            });
        }
        onContentPropertyChanged() {
            var contentElement = this.getContentElement();
            if (contentElement) {
                Juice.Internals.setContent(contentElement, this._contentValue);
            }
            this._onContentChanged(contentElement, this._contentValue);
        }
        getContentElement() {
            if (this._contentElementSelector) {
                this._contentElement = this._contentElementSelector.query();
            }
            return this._contentElement;
        }
        _onContentChanged(contentElement, content) { }
        _setContentElement(contentElement) {
            if (contentElement instanceof HTMLElement) {
                this._contentElement = contentElement;
                this._contentElementSelector = null;
            }
            else {
                this._contentElementSelector = contentElement;
            }
            this.onContentPropertyChanged();
        }
        get content() {
            return this._contentValue;
        }
        set content(v) {
            if (this._contentValue != v) {
                this._contentValue = v;
                this.onContentPropertyChanged();
                this.events.trigger("onPropertyChanged", { propertyName: "content", propertyValue: v });
            }
        }
    }
    Juice.ContentControlBehaviour = ContentControlBehaviour;
    class ContentControl extends Juice.Control {
        constructor(template) {
            super(template);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            Juice.UIElementBehaviour.initialize(ContentControlBehaviour, this);
            this._setContentElement(templatedElement.getPart("content").element);
        }
        _onApplyTemplate(templatedElement) {
            super._onApplyTemplate(templatedElement);
            this.initializeTemplate(templatedElement);
        }
    }
    ContentControl.DefaultContentControlTemplate = `
<template template-class="Juice.ContentControl">
    <div template-part="frame" class="content-control-frame">
        <div template-part="content" class="content-control-content"></div>
    </div>
</template>`;
    Juice.ContentControl = ContentControl;
    Juice.Builder.applyBehaviours(ContentControl, [ContentControlBehaviour]);
    Juice.Builder.defineComponent({
        baseClass: Juice.UIElement,
        classConstructor: ContentControl,
        className: "Juice.ContentControl",
        tagName: "jui-content-control"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class HeaderedContentControl extends Juice.UIElement {
        constructor(template) {
            super(template);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            Juice.UIElementBehaviour.initialize(Juice.HeaderedControlBehaviour, this);
            Juice.UIElementBehaviour.initialize(Juice.ContentControlBehaviour, this);
            this._setHeaderElement(templatedElement.getPart("header").element);
            this._setContentElement(templatedElement.getPart("content").element);
        }
    }
    Juice.HeaderedContentControl = HeaderedContentControl;
    Juice.Builder.applyBehaviours(HeaderedContentControl, [Juice.HeaderedControlBehaviour, Juice.ContentControlBehaviour]);
    Juice.Builder.defineComponent({
        baseClass: Juice.UIElement,
        classConstructor: HeaderedContentControl,
        className: "Juice.HeaderedContentControl",
        tagName: "jui-headered-content-control"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class Accordion extends Juice.HeaderedContentControl {
        constructor(template) {
            super(template || Accordion.DefaultAccordionTemplate);
            this._isExpanded = false;
            this._neverExpanded = true;
            this.onStateChanged = new Juice.EventSet(this.events, "onStateChanged", this);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_accordionHeader = templatedElement.withPartElement("accordionHeader", (element) => {
                element.addEventListener("click", this.onHeaderClick.bind(this));
            });
            this._part_accordionHead = templatedElement.getPart("accordionHead").element;
            this._part_accordionSymbol = templatedElement.getPart("accordionSymbol").element;
            this._part_accordionContainer = templatedElement.getPart("accordionContainer").element;
            this.header = "Accordion";
            this.onIsExpandedChanged();
        }
        onHeaderClick(e) {
            this.isExpanded = !this._isExpanded;
        }
        onIsExpandedChanged() {
            var firstExpansion = false;
            if (this._isExpanded) {
                if (this._neverExpanded)
                    firstExpansion = true;
                this._neverExpanded = false;
                this._part_accordionContainer.style.display = "block";
                this._part_accordionSymbol.classList.add("expanded");
            }
            else {
                this._part_accordionContainer.style.display = "none";
                this._part_accordionSymbol.classList.remove("expanded");
            }
            this.events.trigger("onPropertyChanged", { propertyName: "isExpanded", propertyValue: this._isExpanded });
            this.events.trigger("onStateChanged", { isExpanded: this._isExpanded, isFirstExpansion: firstExpansion });
        }
        get isExpanded() {
            return this._isExpanded;
        }
        set isExpanded(v) {
            if (this._isExpanded != v) {
                this._isExpanded = v;
                this.onIsExpandedChanged();
                this.events.trigger("onPropertyChanged", { propertyName: "isExpanded", propertyValue: v });
            }
        }
    }
    Accordion.DefaultAccordionStyles = `
    .jui-accordion {
    
    }
    
    .jui-accordion-header {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        /*border-top-left-radius: 3px;
        border-top-right-radius: 3px;
        border: 1px solid #ccc;
        background: #eee;
        padding-top: 4px;
        padding-left: 6px;
        padding-right: 3ch;
        padding-bottom: 5px;*/
        position: relative;
        user-select: none;
        cursor: pointer;
    }
    
    .jui-accordion-symbol {
        position: absolute;
        right: 1ch;
        top: 50%;
        transform: translateY(-50%);
        /*color: #777;*/
    }

    .jui-accordion-symbol > .expanded {
        display: none;
    }

    .jui-accordion-symbol > .collapsed {
        display: inline;
    }
    
    .jui-accordion-symbol.expanded > .expanded {
        display: inline;
    }
    
    .jui-accordion-symbol.expanded > .collapsed {
        display: none;
    }
    
    .jui-accordion-container {
        display: none;
        /*padding: 6px;
        border-top: 0;
        border-left: 1px solid #ccc;
        border-right: 1px solid #ccc;
        border-bottom: 1px solid #ccc;*/
        content: ' ';
    }`;
    Accordion.DefaultAccordionHtmlTemplate = `
    <template template-class="Juice.Accordion">
        <div class="jui-accordion">
            <div template-part="accordionHeader" class="jui-accordion-header">
                <div template-part="accordionHead" class="jui-accordion-head"><span template-part="header"></span></div>
                <div template-part="accordionSymbol" class="jui-accordion-symbol"><i class="fa fa-chevron-down collapsed"></i><i class="fa fa-chevron-up expanded"></i></div>
            </div>
            <div template-part="accordionContainer" class="jui-accordion-container">
                <div>text from template</div>
                <div template-part="content"></div>
            </div>
        </div>
    </template>`;
    Accordion.DefaultAccordionTemplate = `<style>\n${Accordion.DefaultAccordionStyles}\n</style>\n${Accordion.DefaultAccordionHtmlTemplate}`;
    Juice.Accordion = Accordion;
    Juice.Builder.defineComponent({
        baseClass: Juice.HeaderedContentControl,
        classConstructor: Accordion,
        className: "Juice.Accordion",
        tagName: "jui-accordion"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    ;
    class EventSet {
        constructor(eventGroup, eventName, bindTarget) {
            this._bindTarget = bindTarget;
            this._eventsManager = eventGroup;
            this._eventName = eventName;
        }
        add(handler, bindTarget) {
            this._eventsManager.attach(this._eventName, handler, { once: false }, bindTarget || this._bindTarget);
        }
        once(handler) {
            this._eventsManager.attach(this._eventName, handler, { once: true }, this._bindTarget);
        }
        remove(handler) {
            this._eventsManager.detach(this._eventName, handler);
        }
        has(handler) {
            return this._eventsManager.hasHandler(this._eventName, handler);
        }
        trigger(args) {
            this._eventsManager.trigger(this._eventName, args);
        }
        stop() {
            this._eventsManager.stop(this._eventName);
        }
        resume() {
            this._eventsManager.resume(this._eventName);
        }
    }
    Juice.EventSet = EventSet;
    Juice.Builder.defineClass({
        baseClass: Object,
        classConstructor: EventSet,
        className: "Juice.EventSet"
    });
    class EventsManager {
        constructor(owner) {
            this._validEventOptions = ["once"];
            this._disabledEventsNames = [];
            this._owner = owner;
            this._events = new Map();
        }
        getHandlerEntryIndex(evntGroup, eventHandler) {
            var positions = evntGroup.entries.map((v, i) => v.handler === eventHandler ? i : -1).filter(v => v >= 0);
            if (positions.length == 0) {
                return -1;
            }
            return positions[0];
        }
        attach(eventName, eventHandler, eventOptions, bindTarget) {
            if (typeof eventHandler !== "function") {
                return;
            }
            let lowerEventName = eventName.toLowerCase();
            let eventEntry = {
                handler: eventHandler,
                options: eventOptions,
                bindTarget: bindTarget
            };
            if (this._events.has(lowerEventName)) {
                let eventGroupEntry = this._events.get(lowerEventName);
                eventGroupEntry.entries.push(eventEntry);
            }
            else {
                let eventGroupEntry = {
                    eventName: eventName,
                    entries: [eventEntry]
                };
                this._events.set(lowerEventName, eventGroupEntry);
            }
        }
        detach(eventName, eventHandler) {
            if (typeof eventHandler !== "function") {
                return;
            }
            let lowerEventName = eventName.toLowerCase();
            if (!this._events.has(lowerEventName)) {
                return;
            }
            let eventGroupEntry = this._events.get(lowerEventName);
            let entryIndex = this.getHandlerEntryIndex(eventGroupEntry, eventHandler);
            if (entryIndex >= 0) {
                eventGroupEntry.entries.splice(entryIndex, 1);
            }
        }
        trigger(eventName, args) {
            var lowerEventName = eventName.toLowerCase();
            if (!this._events.has(lowerEventName)) {
                return;
            }
            let eventGroupEntry = this._events.get(lowerEventName);
            var disabledEventIndex = this._disabledEventsNames.indexOf(lowerEventName);
            if (disabledEventIndex !== -1 || this._disabledEventsNames.indexOf("*") !== -1)
                return;
            let handlersToDetach = [];
            for (let eventEntry of eventGroupEntry.entries) {
                let handler = eventEntry.handler;
                if (eventEntry.bindTarget) {
                    handler = eventEntry.handler.bind(eventEntry.bindTarget);
                }
                let removeAfter = false;
                if (eventEntry.options && "once" in eventEntry.options) {
                    removeAfter = !!eventEntry.options.once;
                }
                handler(this._owner, args);
                if (removeAfter) {
                    handlersToDetach.push(handler);
                }
            }
            for (let detachableHandler of handlersToDetach) {
                this.detach(eventName, detachableHandler);
            }
        }
        getHandlersCount(eventName) {
            let lowerEventName = eventName.toLowerCase();
            if (!this._events.has(lowerEventName)) {
                return 0;
            }
            return this._events.get(lowerEventName).entries.length;
        }
        hasHandler(eventName, eventHandler) {
            if (typeof eventHandler !== "function") {
                return false;
            }
            let lowerEventName = eventName.toLowerCase();
            if (!this._events.has(lowerEventName)) {
                return false;
            }
            let eventGroupEntry = this._events.get(lowerEventName);
            return this.getHandlerEntryIndex(eventGroupEntry, eventHandler) >= 0;
        }
        stop(eventName) {
            if (typeof eventName === "undefined") {
                this._disabledEventsNames = ["*"];
            }
            else if (typeof eventName === "string") {
                var eventIndex = this._disabledEventsNames.indexOf(eventName.toLowerCase());
                if (eventIndex != -1)
                    return;
                this._disabledEventsNames.push(eventName.toLowerCase());
            }
        }
        resume(eventName) {
            if (typeof eventName === "undefined") {
                this._disabledEventsNames = [];
            }
            else if (typeof eventName === "string") {
                var eventIndex = this._disabledEventsNames.indexOf(eventName.toLowerCase());
                if (eventIndex == -1)
                    return;
                this._disabledEventsNames.splice(eventIndex, 1);
            }
        }
        create(eventName) {
            var eventGroupObj = new EventSet(this, eventName);
            var descriptor = {
                enumerable: true,
                value: eventGroupObj
            };
            if (!(eventName in this._owner)) {
                Object.defineProperty(this._owner, eventName, descriptor);
            }
            return eventGroupObj;
        }
        createEventArgs(data) {
            var result = {};
            if (typeof data === "object") {
                for (let k in Object.keys(data)) {
                    result[k] = data[k];
                }
            }
            return result;
        }
    }
    Juice.EventsManager = EventsManager;
    Juice.Builder.defineClass({
        baseClass: Object,
        classConstructor: EventsManager,
        className: "Juice.EventsManager"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class Template {
        constructor(className, element, styles, script) {
            this.templateClass = className;
            this._element = element;
            this._styles = styles;
            this._script = script;
        }
        static loadTemplateDocument(templateDocument) {
            let styleNode = templateDocument.querySelector("style");
            let templateNode = templateDocument.querySelector("template");
            let scriptNode = templateDocument.querySelector("script");
            let className = "";
            if (templateNode.hasAttribute("template-class")) {
                className = templateNode.getAttribute("template-class");
            }
            return new Template(className, templateNode, styleNode, scriptNode);
        }
        static loadManyTemplatesFromDocument(templateDocument) {
            let result = Array();
            let templateNodes = templateDocument.querySelectorAll("template");
            for (const tplNode of templateNodes) {
                let className = "";
                if (tplNode.hasAttribute("template-class")) {
                    className = tplNode.getAttribute("template-class");
                }
                result.push(new Template(className, tplNode, null, null));
            }
            return result;
        }
        static from(html) {
            let doc;
            if (typeof html === "string") {
                var parser = new DOMParser();
                doc = parser.parseFromString(html, 'text/html');
            }
            else {
                doc = html;
            }
            return Template.loadTemplateDocument(doc);
        }
        static manyFrom(html) {
            let doc;
            if (typeof html === "string") {
                var parser = new DOMParser();
                doc = parser.parseFromString(html, 'text/html');
            }
            else {
                doc = html;
            }
            return Template.loadManyTemplatesFromDocument(doc);
        }
        importTemplate() {
            if (this._element.content.children.length > 1) {
                let rootElement = document.createElement("div");
                let children = Array.from(this._element.content.childNodes);
                for (let element of children) {
                    rootElement.appendChild(element);
                }
                this._element.content.append(rootElement);
            }
            if (this._element.content.children.length == 0) {
                throw new Error("missing template content");
            }
            let importedElement = document.importNode(this._element.content, true);
            return new TemplatedElement(this, importedElement);
        }
        importStyles() {
            if (this._styles) {
                return document.importNode(this._styles, true);
            }
            return null;
        }
    }
    Juice.Template = Template;
    Juice.Builder.defineClass({
        baseClass: Object,
        classConstructor: Template,
        className: "Juice.Template"
    });
    class TemplatedElement {
        constructor(template, templateNode) {
            this._template = template;
            this._templateNode = templateNode;
            this._rootElement = this._templateNode.children.item(0);
            this._parts = new Map();
            this.findParts();
        }
        findParts() {
            let allParts = this._templateNode.querySelectorAll('*[template-part]');
            for (let part of allParts) {
                let partName = part.getAttribute("template-part");
                this._parts.set(partName, part);
            }
        }
        get rootElement() {
            return this._rootElement;
        }
        get templateDefinition() {
            return this._template;
        }
        getPart(name, throwIfNotExists) {
            if (this._parts.has(name)) {
                let part = this._parts.get(name);
                let element = part;
                return new TemplatePart(name, element);
            }
            else {
                if (throwIfNotExists) {
                    throw new Error(`part whit name ${name} not exists`);
                }
                return null;
            }
        }
        withPartElement(name, action, throwIfNotExists) {
            if (this._parts.has(name)) {
                let part = this._parts.get(name);
                let element = part;
                action(element);
                return element;
            }
            else {
                if (throwIfNotExists) {
                    throw new Error(`part whit name ${name} not exists`);
                }
                else {
                    console.warn(`part whit name ${name} not exists`);
                }
                return null;
            }
        }
    }
    Juice.TemplatedElement = TemplatedElement;
    Juice.Builder.defineClass({
        baseClass: Object,
        classConstructor: TemplatedElement,
        className: "Juice.TemplatedElement"
    });
    class TemplatePart {
        constructor(name, element) {
            this.name = name;
            this.element = element;
        }
    }
    Juice.TemplatePart = TemplatePart;
    Juice.Builder.defineClass({
        baseClass: Object,
        classConstructor: TemplatePart,
        className: "Juice.TemplatePart"
    });
    class TemplateManager {
        static createTemplate(templateSource) {
            if (templateSource instanceof Template) {
                return templateSource;
            }
            let result = null;
            if (typeof templateSource === "string") {
                if (templateSource.charAt(0) === "@") {
                    throw new Error("not implemented");
                }
                else {
                    result = Template.from(templateSource);
                    if (!result) {
                        throw new Error("unresolved template resource, invalid html code");
                    }
                }
            }
            this.addTemplate(result);
            return result;
        }
        static addTemplate(template) {
            if (!this._importedClassesStyles.has(template.templateClass)) {
                let classStyles = template.importStyles();
                if (classStyles) {
                    document.head.appendChild(classStyles);
                    this._importedClassesStyles.add(template.templateClass);
                }
            }
            this._templateDefinitions.push(template);
        }
        static getTemplate(className) {
            let templateDefs = this._templateDefinitions.filter((v, i, a) => v.templateClass === className);
            if (templateDefs.length > 0) {
                return new Promise(resolve => resolve(templateDefs[0]));
            }
            else {
                return new Promise((resolve, reject) => {
                    this
                        .loadExternal(className)
                        .then(result => {
                        this.addTemplate(result);
                        resolve(result);
                    })
                        .catch(err => {
                        reject(err);
                    });
                });
            }
        }
        static loadExternal(className) {
            let templatePath = className.split(".").join("/") + ".template.html";
            return new Promise((resolve, reject) => {
                Juice.Internals.getTemplateFile(templatePath)
                    .then(result => {
                    let template = Template.from(result);
                    if (template.templateClass !== className) {
                        throw new Error("invalid template class name");
                    }
                    resolve(template);
                })
                    .catch(err => {
                    reject(err);
                });
            });
        }
    }
    TemplateManager._templateDefinitions = [];
    TemplateManager._importedClassesStyles = new Set();
    Juice.TemplateManager = TemplateManager;
    Juice.Builder.defineClass({
        baseClass: Object,
        classConstructor: TemplateManager,
        className: "Juice.TemplateManager"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class ApplicationFrame extends Juice.ContentControl {
        constructor(applicationService, template) {
            super(template || ApplicationFrame.DefaultApplicationFrameTemplate);
            this._applicationService = applicationService;
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_appRoot = templatedElement.getPart("appRoot").element;
        }
        get application() { return this._applicationService.application; }
    }
    ApplicationFrame.DefaultApplicationFrameStyles = `
    .jui-app {
        height: 100%;
    }

    .jui-app-content {
        height: 100%;
    }`;
    ApplicationFrame.DefaultApplicationFrameHtmlTemplate = `
    <template template-class="Juice.Application">
        <div class="jui-app" template-part="appRoot">
            <div class="jui-app-content" template-part="content"></div>
        </div>
    </template>`;
    ApplicationFrame.DefaultApplicationFrameTemplate = `<style>\n${ApplicationFrame.DefaultApplicationFrameStyles}\n</style>\n${ApplicationFrame.DefaultApplicationFrameHtmlTemplate}`;
    class ApplicationOptionsReader {
        constructor(options) {
            this._options = options;
        }
        rootNode() {
            return this.getValue("rootNode", null);
        }
        mainElement() {
            return this.getValue("mainElement", null);
        }
        appId() {
            return this.getValue("appId", null);
        }
        currentTheme() {
            return this.getValue("currentTheme", null);
        }
        templateRoot() {
            return this.getValue("templateRoot", null);
        }
        templateUrls() {
            return this.getValue("templateUrls", new Array());
        }
        getValue(name, defaultValue = null) {
            if (typeof this._options[name] === "function") {
                return this._options[name]();
            }
            return defaultValue;
        }
    }
    class ApplicationService {
        constructor(application, setCurrentPageHandler, setCurrentThemeHandler) {
            this.application = application;
            this.setCurrentPage = setCurrentPageHandler.bind(application);
            this.setCurrentTheme = setCurrentThemeHandler.bind(application);
        }
    }
    Juice.ApplicationService = ApplicationService;
    class Application {
        constructor() {
            this._isRunning = false;
            this.applicationService = new ApplicationService(this, this.setCurrentPage, this.setCurrentTheme);
            this.events = new Juice.EventsManager(this);
            this.onApplicationReady = new Juice.EventSet(this.events, "onApplicationReady", this);
            this.onThemeChanged = new Juice.EventSet(this.events, "onThemeChanged", this);
            this._defaultOptions = {
                mainElement: null,
                rootNode: null
            };
        }
        initialize() {
            var optionsReader = new ApplicationOptionsReader(this._options);
            this._appId = optionsReader.appId() || Juice.Internals.getFreeUid();
            this._root = optionsReader.rootNode();
            this._appFrame = new ApplicationFrame(this.applicationService);
            this._appFrame.htmlElement.setAttribute("app-id", this._appId);
            this._appFrame.content = optionsReader.mainElement();
            this._root.appendChild(this._appFrame.htmlElement);
            Juice.registerApplication(this, this._appFrame.htmlElement);
            this.setCurrentTheme(optionsReader.currentTheme());
        }
        setCurrentPage(page) {
            if (this._currentPage) {
                this.currentPage.htmlElement.remove();
            }
            this._currentPage = page;
            this._root.appendChild(this._currentPage.htmlElement);
        }
        setCurrentTheme(theme) {
            if (this._currentTheme !== theme) {
                if (this._currentTheme) {
                    this.rootElement.classList.remove(this._currentTheme);
                }
                this._currentTheme = theme;
                if (this._currentTheme) {
                    this.rootElement.classList.add(this._currentTheme);
                }
                this.onThemeChanged.trigger({ name: theme });
            }
        }
        readOptions(options) {
            this._options = {
                mainElement: this.getOptionsValueOrDefault(options, "mainElement", this._defaultOptions.mainElement),
                rootNode: this.getOptionsValueOrDefault(options, "rootNode", this._defaultOptions.rootNode),
                currentTheme: this.getOptionsValueOrDefault(options, "currentTheme", this._defaultOptions.currentTheme),
                templateRoot: this.getOptionsValueOrDefault(options, "templateRoot", this._defaultOptions.templateRoot),
                templateUrls: this.getOptionsValueOrDefault(options, "templateUrls", this._defaultOptions.templateUrls)
            };
            if (this._options.templateRoot) {
                Juice.Internals.templateDirPath = this._options.templateRoot();
            }
        }
        getOptionsValueOrDefault(options, name, defaultValue) {
            if (name in options) {
                return options[name];
            }
            return defaultValue;
        }
        assertIsRunning() {
            if (!this._isRunning) {
                throw new Error("application not running");
            }
        }
        configure(configure) {
            if (this._isRunning) {
                throw new Error("application is running");
            }
            if (typeof configure !== "function") {
                throw new Error("invalid configure function");
            }
            this._configure = configure;
        }
        run() {
            if (this._isRunning) {
                return;
            }
            this._isRunning = true;
            if (this._configure) {
                let options = this._configure();
                this.readOptions(options);
            }
            let resolver = new ApplicationStartResolver(() => {
                this.initialize();
                this.onApplicationReady.trigger();
                _applicationStaticEvents.trigger("onApplicationLoaded", { appId: this.appId });
            }, this._options.templateUrls());
            resolver.resolve();
        }
        get appId() { return this._appId; }
        get rootElement() { return this._appFrame.htmlElement; }
        get currentPage() { return this._currentPage; }
        get currentTheme() { return this._currentTheme; }
    }
    Juice.Application = Application;
    const _applicationStaticEvents = new Juice.EventsManager(Application);
    Object.defineProperty(Application, "onApplicationLoaded", {
        value: new Juice.EventSet(_applicationStaticEvents, "onApplicationLoaded", Application)
    });
    Juice.Builder.defineClass({
        baseClass: Object,
        classConstructor: Application,
        className: "Juice.Application"
    });
    class ApplicationStartResolver {
        constructor(startCallback, templateUrls) {
            this._startCallback = startCallback;
            this._map = new Map();
            this._templateUrls = templateUrls || [];
        }
        _onStepCompleted(stepName) {
            this._map.set(stepName, true);
            if (Array.from(this._map).every(x => x[1])) {
                this._startCallback();
            }
        }
        _resolveTemplatesRecursive(urls, currentIndex, callback) {
            if (currentIndex >= urls.length) {
                callback();
                return;
            }
            let url = urls[currentIndex];
            let isAbsolute = url.startsWith("~/") || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
            if (url.startsWith("~/")) {
                url = url.substr(2);
            }
            Juice.Internals.getTemplateFile(url, isAbsolute)
                .then(res => {
                let tpls = Juice.Template.manyFrom(res);
                for (let t of tpls) {
                    Juice.TemplateManager.addTemplate(t);
                }
            })
                .catch(err => { })
                .then(() => {
                this._resolveTemplatesRecursive(urls, ++currentIndex, callback);
            });
        }
        resolve() {
            this._map.set("DOM", false);
            if (this._templateUrls) {
                this._map.set("templates", false);
                this._resolveTemplatesRecursive(this._templateUrls, 0, () => {
                    this._onStepCompleted("templates");
                });
            }
            window.addEventListener("DOMContentLoaded", () => {
                this._onStepCompleted("DOM");
            });
        }
    }
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class ButtonBase extends Juice.ContentControl {
        constructor(template) {
            super(template);
            this._isSelected = false;
            this._isToggle = false;
            this.onClick = new Juice.EventSet(this.events, "onClick", this);
            this.onClick = new Juice.EventSet(this.events, "onDoubleClick", this);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            templatedElement.rootElement.addEventListener("click", this.onButtonClick.bind(this));
            templatedElement.rootElement.addEventListener("dblclick", this.onButtonDoubleClick.bind(this));
        }
        onButtonClick(e) {
            this.isSelected = !this.isSelected;
            this.events.trigger("onClick", {});
        }
        onButtonDoubleClick(e) {
            this.isSelected = !this.isSelected;
            this.events.trigger("onDoubleClick", {});
        }
        onIsSelectedPropertyChanged() {
            if (this._isToggle) {
                if (this._isSelected) {
                    this.htmlElement.classList.add("active");
                }
                else {
                    this.htmlElement.classList.remove("active");
                }
            }
            else {
                this.htmlElement.classList.remove("active");
            }
        }
        get isSelected() {
            return this._isSelected;
        }
        set isSelected(v) {
            if (this._isSelected !== v) {
                this._isSelected = v;
                this.onIsSelectedPropertyChanged();
            }
        }
        get isToggle() {
            return this._isToggle;
        }
        set isToggle(v) {
            this._isToggle = v;
            if (!this._isToggle) {
                this.isSelected = false;
            }
        }
        focus() {
            if (this.htmlElement instanceof HTMLButtonElement) {
                this.htmlElement.focus();
            }
        }
    }
    Juice.ButtonBase = ButtonBase;
    Juice.Builder.defineComponent({
        baseClass: Object,
        classConstructor: Juice.BindableObject,
        className: "Juice.BindableObject",
        isAbstract: true
    });
    class Button extends ButtonBase {
        constructor(template) {
            super(template || Button.DefaultButtonTemplate);
            this.onClick = new Juice.EventSet(this.events, "onClick", this);
        }
    }
    Button.DefaultButtonStyles = `
    .jui-button {
        display: inline-block;
        /*padding: 4px 12px;
        border-radius: 4px;
        border: 1px solid #006ab6;
        border-bottom: 1px solid #004475;
        background-color: #006ab6;
        color: #f0f0f0;*/
        cursor: default;
        user-select: none;
    }

    /*.jui-button:hover {
        border-color: #0094ff;
        border-bottom-color: #006ab6;
        background-color: #0094ff;
        color: #fff;
        box-shadow: 0px 0px 2px 2px rgba(45, 165, 252, 0.2);
    }*/`;
    Button.DefaultButtonHtmlTemplate = `
<template template-class="Juice.Button">
    <button template-part="button" class="jui-button">
        <div template-part="content" class="jui-button-content"></div>
    </button>
</template>`;
    Button.DefaultButtonTemplate = `<style>\n${Button.DefaultButtonStyles}\n</style>\n${Button.DefaultButtonHtmlTemplate}`;
    Juice.Button = Button;
    Juice.Builder.defineComponent({
        baseClass: ButtonBase,
        classConstructor: Button,
        className: "Juice.Button",
        tagName: "jui-button"
    });
    let FileReadType;
    (function (FileReadType) {
        FileReadType["ArrayBuffer"] = "arrayBuffer";
        FileReadType["BinaryString"] = "binaryString";
        FileReadType["DataURL"] = "dataURL";
        FileReadType["Text"] = "text";
    })(FileReadType = Juice.FileReadType || (Juice.FileReadType = {}));
    class FileButton extends Button {
        constructor(template) {
            super(template || FileButton.DefaultFileButtonTemplate);
            this.readType = FileReadType.Text;
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_inputFile = templatedElement.withPartElement("inputFile", (element) => {
                element.addEventListener("change", this.onHiddenFileDataChanged.bind(this));
            });
        }
        onHiddenFileDataChanged(e) {
            if (typeof this._readerHandler === "function") {
                let file = this._part_inputFile.files[0];
                let reader = new FileReader();
                reader.addEventListener("load", () => {
                    this._readerHandler(reader, file);
                });
                switch (this.readType) {
                    case FileReadType.ArrayBuffer: {
                        reader.readAsArrayBuffer(file);
                        break;
                    }
                    case FileReadType.BinaryString: {
                        reader.readAsBinaryString(file);
                        break;
                    }
                    case FileReadType.DataURL: {
                        reader.readAsDataURL(file);
                        break;
                    }
                    case FileReadType.Text: {
                        reader.readAsText(file);
                        break;
                    }
                    default: {
                        throw new Error("invalid read type");
                    }
                }
            }
        }
        onButtonClick(e) {
            this._part_inputFile.click();
            super.onButtonClick(e);
        }
        readerHandler(handler) {
            this._readerHandler = handler;
        }
        get accept() {
            return this._part_inputFile.accept;
        }
        set accept(v) {
            this._part_inputFile.accept = v;
        }
    }
    FileButton.DefaultFileButtonHtmlTemplate = `
<template template-class="Juice.FileButton">
    <button template-part="button" class="jui-button">
        <input template-part="inputFile" type="file" style="display: none" />
        <div template-part="content" class="jui-button-content"></div>
    </button>
</template>`;
    FileButton.DefaultFileButtonTemplate = `<style>\n${Button.DefaultButtonStyles}\n</style>\n${FileButton.DefaultFileButtonHtmlTemplate}`;
    Juice.FileButton = FileButton;
    Juice.Builder.defineComponent({
        baseClass: Button,
        classConstructor: FileButton,
        className: "Juice.FileButton",
        tagName: "jui-file-button"
    });
    class LinkButton extends ButtonBase {
        constructor(template) {
            super(template);
            this.onClick = new Juice.EventSet(this.events, "onClick", this);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_linkButton = templatedElement.getPart("content").element;
            this._part_linkButton.href = "#";
        }
        get href() {
            return this._part_linkButton.href;
        }
        set href(v) {
            this._part_linkButton.href = v;
        }
        get title() {
            return this._part_linkButton.title;
        }
        set title(v) {
            this._part_linkButton.title = v;
        }
    }
    LinkButton.DefaultLinkButtonStyles = `
    .jui-link-button {
        padding-left: 2px;
        padding-right: 2px;
        border-radius: 3px;
        display: inline-block;
        color: #006ab6;
        user-select: none;
    }

    .jui-link-button:hover {
        background-color: #0094ff;
        color: #fff;
        text-decoration: none;
    }`;
    LinkButton.DefaultLinkButtonHtmlTemplate = `
    <template template-class="Juice.LinkButton">
        <a template-part="content" class="jui-link-button"></a>
    </template>`;
    LinkButton.DefaultLinkButtonTemplate = `<style>\n${LinkButton.DefaultLinkButtonStyles}\n</style>\n${LinkButton.DefaultLinkButtonHtmlTemplate}`;
    Juice.LinkButton = LinkButton;
    Juice.Builder.defineComponent({
        baseClass: ButtonBase,
        classConstructor: LinkButton,
        className: "Juice.LinkButton",
        tagName: "jui-link-button"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    let CollectionChangedAction;
    (function (CollectionChangedAction) {
        CollectionChangedAction[CollectionChangedAction["Added"] = 0] = "Added";
        CollectionChangedAction[CollectionChangedAction["Removed"] = 1] = "Removed";
        CollectionChangedAction[CollectionChangedAction["Cleared"] = 2] = "Cleared";
    })(CollectionChangedAction = Juice.CollectionChangedAction || (Juice.CollectionChangedAction = {}));
    class CollectionChangedEventArgs {
        constructor(action, index, items) {
            this.action = action;
            this.index = index;
            this.items = items || [];
        }
    }
    Juice.CollectionChangedEventArgs = CollectionChangedEventArgs;
    class Collection {
        constructor(initialItems) {
            if (initialItems) {
                this._items = initialItems;
            }
            else {
                this._items = [];
            }
            this._events = new Juice.EventsManager(this);
            this.onItemsAdded = new Juice.EventSet(this._events, "onItemsAdded");
            this.onItemsRemoved = new Juice.EventSet(this._events, "onItemsRemoved");
            this.onCollectionCleared = new Juice.EventSet(this._events, "onCollectionCleared");
        }
        triggerCollectionChanged(action, index, items) {
            var args = new CollectionChangedEventArgs(action, index, items);
            switch (action) {
                case CollectionChangedAction.Added: {
                    this._events.trigger("onItemsAdded", args);
                    break;
                }
                case CollectionChangedAction.Removed: {
                    this._events.trigger("onItemsRemoved", args);
                    break;
                }
                case CollectionChangedAction.Cleared: {
                    this._events.trigger("onCollectionCleared", args);
                    break;
                }
            }
        }
        insert(index, item) {
            if (index < 0)
                index = 0;
            if (index >= this._items.length)
                index = this._items.length;
            if (index === this._items.length) {
                this._items.push(item);
            }
            else {
                this._items.splice(index, 0, item);
            }
            index = this._items.length - 1;
            this.triggerCollectionChanged(CollectionChangedAction.Added, index, [item]);
            return index;
        }
        insertRange(index, items) {
            var i;
            if (index < 0)
                index = 0;
            if (index >= this._items.length)
                index = this._items.length;
            if (index === this._items.length) {
                for (i = 0; i < items.length; i++) {
                    this._items.push(items[i]);
                }
            }
            else {
                this._items.splice(index, 0, ...items);
            }
            if (this._items.length > index) {
                this.triggerCollectionChanged(CollectionChangedAction.Added, index, items);
            }
            return index;
        }
        get length() {
            return this._items.length;
        }
        forEach(callback) {
            for (var i = 0; i < this._items.length; i++) {
                callback(this._items[i], i, this);
            }
        }
        mapToArray(callback) {
            var result = [];
            for (var i = 0; i < this._items.length; i++) {
                let resultItem = callback(this._items[i], i, this);
                result.push(resultItem);
            }
            return result;
        }
        add(item) {
            return this.insert(this._items.length, item);
        }
        addRange(items) {
            return this.insertRange(this._items.length, items);
        }
        at(index) {
            return this._items[index];
        }
        clear() {
            var items = this._items;
            this._items = [];
            this.triggerCollectionChanged(CollectionChangedAction.Cleared, 0, items);
        }
        contains(item, selector) {
            if (typeof selector === "function") {
                for (var i = 0; i < this._items.length; i++) {
                    if (selector(this._items[i]) === item) {
                        return true;
                    }
                }
                return false;
            }
            else {
                return this._items.indexOf(item) >= 0;
            }
        }
        indexOf(item, selector) {
            if (typeof selector === "function") {
                var result = -1;
                for (var i = 0; i < this._items.length; i++) {
                    if (selector(this._items[i]) === item) {
                        result = i;
                        break;
                    }
                }
                return result;
            }
            else {
                return this._items.indexOf(item);
            }
        }
        remove(item, selector) {
            var itemIndex = this.indexOf(item, selector);
            if (itemIndex === -1)
                return false;
            this._items.splice(itemIndex, 1);
            this.triggerCollectionChanged(CollectionChangedAction.Removed, itemIndex, [item]);
            return true;
        }
        removeAt(index) {
            if (index < 0 || index >= this._items.length)
                return null;
            var item = this._items[index];
            this._items.splice(index, 1);
            this.triggerCollectionChanged(CollectionChangedAction.Removed, index, [item]);
            return item;
        }
        removeItems(items) {
            var itemIndex = -1;
            var removedItems = [];
            for (var i = 0; i < items.length; i++) {
                itemIndex = this.indexOf(items[i]);
                if (itemIndex === -1)
                    continue;
                var removed = this._items.splice(itemIndex, 1);
                removedItems.push(...removed);
            }
            this.triggerCollectionChanged(CollectionChangedAction.Removed, itemIndex, removedItems);
            return removedItems;
        }
        removeRange(index, length) {
            if (typeof index !== "number" || index < 0)
                index = 0;
            if (!length) {
                length = this._items.length - index;
            }
            var removedItems = this._items.splice(index, length);
            this.triggerCollectionChanged(CollectionChangedAction.Removed, index, removedItems);
            return removedItems;
        }
        removeAll(predicate) {
            let index = null;
            let removedItems = [];
            if (typeof predicate === "function") {
                let newItems = [];
                this._items.forEach((v, i, a) => {
                    if (predicate(v, i)) {
                        if (index == null)
                            index = i;
                        removedItems.push(v);
                    }
                    else {
                        newItems.push(v);
                    }
                });
                this._items = newItems;
            }
            else {
                index = 0;
                removedItems = this._items.splice(index, this._items.length);
            }
            if (removedItems.length > 0)
                this.triggerCollectionChanged(CollectionChangedAction.Removed, index, removedItems);
            return removedItems;
        }
        toArray() {
            return this._items.slice(0);
        }
    }
    Juice.Collection = Collection;
    Juice.Builder.defineClass({
        baseClass: Object,
        classConstructor: Collection,
        className: "Juice.Collection"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class Dialog extends Juice.UIElement {
        constructor(title, template) {
            super(template || Dialog.DefaultDialogTemplate);
            this._part_header.innerText = title;
            this.onClosing = new Juice.EventSet(this.events, "onClosing", this);
            this.onClosed = new Juice.EventSet(this.events, "onClosed", this);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_dialog = templatedElement.getPart("dialog").element;
            this._part_header = templatedElement.getPart("header").element;
            this._part_content = templatedElement.getPart("content").element;
            this._part_buttons = templatedElement.getPart("buttons").element;
        }
        setContent(content) {
            if (this._content !== content) {
                Juice.Internals.setContent(this._part_content, content);
            }
        }
        getButtonsContainer() {
            return this._part_buttons;
        }
        onDialogClosing(args) {
            this.onClosing.trigger(args);
        }
        onDialogClosed(args) {
            this.onClosed.trigger(args);
        }
        show(parent) {
            if (parent) {
                parent.appendChild(this.htmlElement);
            }
            else {
                let application = this.getApplication();
                if (application) {
                    application.rootElement.appendChild(this.htmlElement);
                }
                else {
                    document.body.appendChild(this.htmlElement);
                }
            }
        }
        close() {
            let closingArgs = {
                cancel: false
            };
            this.onDialogClosing(closingArgs);
            if (closingArgs.cancel) {
                return;
            }
            this.htmlElement.remove();
            this.onDialogClosed({
                result: this.dialogResult
            });
        }
    }
    Dialog.DefaultDialogStyles = `
    .jui-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        /*min-width: 240px;
        min-height: 100px;
        border-radius: 4px 4px 2px 2px;
        background-color: #fff;
        box-shadow: 0px 0px 5px 5px rgba(0, 0, 0, 0.07);
        border: 1px solid #c0c0c0;*/
        display: flex;
        flex-direction: column;
    }
    
    .jui-dialog-header {
        height: auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        /*padding: 5px 20px;
        font-weight: 600;
        border-radius: 4px 4px 0 0;
        border-bottom: 2px solid #fff;
        background-color: #f0f0f0;*/
    }
    
    .jui-dialog-content {
        height: auto;
        flex-grow: 1;
        /*border-radius: 0 0 2px 2px;
        padding: 10px 20px;*/
    }
    
    .jui-dialog-buttons {
        height: auto;
        /*text-align: center;
        padding-top: 10px;
        padding-bottom: 20px;*/
    }`;
    Dialog.DefaultDialogHtmlTemplate = `
    <template template-class="Juice.Dialog">
        <div template-part="dialog" class="jui-dialog">
            <div template-part="header" class="jui-dialog-header"></div>
            <div template-part="content" class="jui-dialog-content"></div>
            <div template-part="buttons" class="jui-dialog-buttons"></div>
        </div>
    </template>`;
    Dialog.DefaultDialogTemplate = `<style>\n${Dialog.DefaultDialogStyles}\n</style>\n${Dialog.DefaultDialogHtmlTemplate}`;
    Juice.Dialog = Dialog;
    Juice.Builder.defineComponent({
        baseClass: Juice.UIElement,
        classConstructor: Dialog,
        className: "Juice.Dialog"
    });
    class ModalDialog extends Dialog {
        constructor(title, template) {
            super(title, template || ModalDialog.DefaultModalDialogTemplate);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_dialogMask = templatedElement.getPart("dialogMask").element;
            templatedElement.getPart("dialog").element.classList.add("modal");
        }
    }
    ModalDialog.DefaultModalDialogStyles = `${Dialog.DefaultDialogStyles}\n

    .jui-dialog-mask {
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        /*background-color: rgba(255, 255, 255, 0.5);*/
        z-index: 9000;
    }

    .jui-dialog.modal {
        position: absolute;
        z-index: 1;
    }
    
    /*.jui-dialog.modal .jui-dialog-buttons > .jui-button {
        margin: 0 2px;
    }*/`;
    ModalDialog.DefaultModalDialogHtmlTemplate = `
    <template template-class="Juice.ModalDialog">
        <div template-part="dialogMask" class="jui-dialog-mask">
            <div template-part="dialog" class="jui-dialog">
                <div template-part="header" class="jui-dialog-header"></div>
                <div template-part="content" class="jui-dialog-content"></div>
                <div template-part="buttons" class="jui-dialog-buttons"></div>
            </div>
        </div>
    </template>`;
    ModalDialog.DefaultModalDialogTemplate = `<style>\n${ModalDialog.DefaultModalDialogStyles}\n</style>\n${ModalDialog.DefaultModalDialogHtmlTemplate}`;
    Juice.ModalDialog = ModalDialog;
    Juice.Builder.defineComponent({
        baseClass: Dialog,
        classConstructor: ModalDialog,
        className: "Juice.ModalDialog"
    });
    class MessageDialog extends ModalDialog {
        static showMessage(title, message, parent) {
            let dialog = new MessageDialog(title, message);
            dialog.show(parent);
        }
        constructor(title, message, template) {
            super(title, template);
            this.setContent(message);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_dialogMask = templatedElement.getPart("dialogMask").element;
            let buttonsContainer = this.getButtonsContainer();
            let okButton = new Juice.Button();
            okButton.content = "OK";
            okButton.onClick.add((s, e) => this.close(), this);
            okButton.appendToHtmlElement(buttonsContainer);
            okButton.focus();
        }
    }
    Juice.MessageDialog = MessageDialog;
    Juice.Builder.defineComponent({
        baseClass: ModalDialog,
        classConstructor: MessageDialog,
        className: "Juice.MessageDialog"
    });
    let QuestionDialogButtons;
    (function (QuestionDialogButtons) {
        QuestionDialogButtons[QuestionDialogButtons["OkCancel"] = 0] = "OkCancel";
        QuestionDialogButtons[QuestionDialogButtons["YesNo"] = 1] = "YesNo";
    })(QuestionDialogButtons = Juice.QuestionDialogButtons || (Juice.QuestionDialogButtons = {}));
    class QuestionDialog extends ModalDialog {
        constructor(title, message, buttons, onCompleted) {
            super(title);
            this.setContent(message);
            this._onCompleted = onCompleted;
            let buttonsContainer = this.getButtonsContainer();
            let button1 = new Juice.Button();
            button1.content = buttons === QuestionDialogButtons.OkCancel ? "OK" : "Yes";
            button1.onClick.add((s, e) => this.closeDialog(true), this);
            button1.appendToHtmlElement(buttonsContainer);
            let button2 = new Juice.Button();
            button2.content = buttons === QuestionDialogButtons.OkCancel ? "Cancel" : "No";
            button2.onClick.add((s, e) => this.closeDialog(false), this);
            button2.appendToHtmlElement(buttonsContainer);
            button1.focus();
        }
        closeDialog(result) {
            this._result = result;
            this.close();
            if (typeof this._onCompleted === "function")
                this._onCompleted(this._result);
        }
        get result() {
            return this._result;
        }
    }
    Juice.QuestionDialog = QuestionDialog;
    Juice.Builder.defineComponent({
        baseClass: ModalDialog,
        classConstructor: QuestionDialog,
        className: "Juice.QuestionDialog"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class ItemsControlBehaviour extends Juice.UIElementBehaviour {
        initializeItemsControlBehaviour() {
            this._items = new Juice.Collection();
            this._items.onItemsAdded.add(this.onItemsCollectionChanged, this);
            this._items.onItemsRemoved.add(this.onItemsCollectionChanged, this);
            this._items.onCollectionCleared.add(this.onItemsCollectionChanged, this);
        }
        onItemsCollectionChanged(s, e) {
            this._onItemsCollectionChanged(e);
        }
        _onItemsCollectionChanged(args) { }
        get items() {
            return this._items;
        }
    }
    Juice.ItemsControlBehaviour = ItemsControlBehaviour;
    class ItemsControl extends Juice.UIElement {
        constructor(template) {
            super(template);
            Juice.UIElementBehaviour.initialize(ItemsControlBehaviour, this);
        }
    }
    Juice.ItemsControl = ItemsControl;
    Juice.Builder.applyBehaviours(ItemsControl, [ItemsControlBehaviour]);
    Juice.Builder.defineComponent({
        baseClass: Juice.UIElement,
        classConstructor: ItemsControl,
        className: "Juice.ItemsControl",
        tagName: "jui-items-control"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class Grid extends Juice.ItemsControl {
        constructor(template) {
            super(template || Grid.DefaultGridTemplate);
            this._onUpdateLayout = false;
            this._layoutUpdated = false;
        }
        static getColumn(uiElement) {
            if (uiElement.htmlElement.hasAttribute("grid-column")) {
                let str = uiElement.htmlElement.getAttribute("grid-column");
                return parseInt(str);
            }
            else {
                return 0;
            }
        }
        static getRow(uiElement) {
            if (uiElement.htmlElement.hasAttribute("grid-row")) {
                let str = uiElement.htmlElement.getAttribute("grid-row");
                return parseInt(str);
            }
            else {
                return 0;
            }
        }
        static getColumnAndRow(uiElement) {
            return {
                column: Grid.getColumn(uiElement),
                row: Grid.getRow(uiElement)
            };
        }
        static setColumn(uiElement, column) {
            if (column <= 0) {
                uiElement.htmlElement.removeAttribute("grid-column");
            }
            else {
                uiElement.htmlElement.setAttribute("grid-column", column.toString());
            }
        }
        static setRow(uiElement, row) {
            if (row <= 0) {
                uiElement.htmlElement.removeAttribute("grid-row");
            }
            else {
                uiElement.htmlElement.setAttribute("grid-row", row.toString());
            }
        }
        static setColumnAndRow(uiElement, column, row) {
            Grid.setColumn(uiElement, column);
            Grid.setRow(uiElement, row);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._columnDefinitions = new Juice.Collection();
            this._columnDefinitions.onCollectionCleared.add(this.onGridColumnCollectionChanged, this);
            this._columnDefinitions.onItemsAdded.add(this.onGridColumnCollectionChanged, this);
            this._columnDefinitions.onItemsRemoved.add(this.onGridColumnCollectionChanged, this);
            this._rowDefinitions = new Juice.Collection();
            this._rowDefinitions.onCollectionCleared.add(this.onGridRowCollectionChanged, this);
            this._rowDefinitions.onItemsAdded.add(this.onGridRowCollectionChanged, this);
            this._rowDefinitions.onItemsRemoved.add(this.onGridRowCollectionChanged, this);
            this._part_gridContainer = templatedElement.getPart("gridContainer").element;
            this.prepareGrid();
        }
        prepareGrid() {
            let defaultCell = this.createCellWrapper(0, 0);
            let firstRowCellArray = new Array();
            firstRowCellArray.push(defaultCell);
            this._part_gridContainer.appendChild(defaultCell.htmlElement);
            this._cells = [firstRowCellArray];
            for (let r = 0; r < this._rowDefinitions.length; r++) {
                let rowCellArray = firstRowCellArray;
                if (r > 0) {
                    rowCellArray = new Array();
                    this._cells.push(rowCellArray);
                }
                for (let c = 0; c < this._columnDefinitions.length; c++) {
                    if (r === 0 && c === 0) {
                        continue;
                    }
                    let cell = this.createCellWrapper(c, r);
                    rowCellArray.push(cell);
                    this._part_gridContainer.appendChild(cell.htmlElement);
                }
            }
        }
        arrangeCells() {
            this._cells.forEach((rowCells, row) => {
                let rowDefinition = this._rowDefinitions.at(row);
                rowCells.forEach((cell, column) => {
                    if (rowDefinition.height === "auto") {
                    }
                });
            });
        }
        updateGridLayout() {
            if (this._onUpdateLayout) {
                return;
            }
            this._onUpdateLayout = true;
            setTimeout(() => {
                this.prepareGrid();
                this._onUpdateLayout = false;
            }, 100);
        }
        createCellWrapper(column, row) {
            var htmlElement = document.createElement("div");
            htmlElement.classList.add("grid-item");
            return {
                column,
                row,
                htmlElement
            };
        }
        getCellWrapper(column, row) {
            if (row < 0) {
                row = 0;
            }
            else if (row >= this._cells.length) {
                row = this._cells.length - 1;
            }
            if (column < 0) {
                column = 0;
            }
            else if (column >= this._cells[row].length) {
                column = this._cells[row].length - 1;
            }
            return this._cells[row][column];
        }
        onGridColumnCollectionChanged(s, e) {
            this.updateGridLayout();
        }
        onGridRowCollectionChanged(s, e) {
            this.updateGridLayout();
        }
        onItemsAdded(e) {
            var refElement;
            for (let i = 0; i < e.items.length; i++) {
                let child = e.items[i];
                let { column, row } = Grid.getColumnAndRow(child);
                let childElement = e.items[i].htmlElement;
                let cellWrapper = this.getCellWrapper(row, column);
                cellWrapper.htmlElement.appendChild(childElement);
            }
        }
        onItemsRemoved(e) {
            console.warn("Grid.onItemsRemoved not implemented");
        }
        onCollectionCleared(e) {
            this._cells = [];
            while (this._part_gridContainer.firstChild)
                this._part_gridContainer.firstChild.remove();
        }
        _onItemsCollectionChanged(args) {
            switch (args.action) {
                case Juice.CollectionChangedAction.Added:
                    this.onItemsAdded(args);
                    break;
                case Juice.CollectionChangedAction.Removed:
                    this.onItemsRemoved(args);
                    break;
                case Juice.CollectionChangedAction.Cleared:
                    this.onCollectionCleared(args);
                    break;
            }
        }
        get columnDefinitions() {
            return this._columnDefinitions;
        }
        get rowDefinitions() {
            return this._rowDefinitions;
        }
    }
    Grid.DefaultGridTemplate = `
    <template template-class="Juice.Grid">
        <div class="jui-grid" template-part="gridContainer">
        </div>
    </template>`;
    Juice.Grid = Grid;
    Juice.Builder.defineComponent({
        baseClass: Juice.ItemsControl,
        classConstructor: Grid,
        className: "Juice.Grid",
        tagName: "jui-grid"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class HeaderedItemsControl extends Juice.UIElement {
        constructor(template) {
            super(template);
            Juice.UIElementBehaviour.initialize(Juice.HeaderedControlBehaviour, this);
            Juice.UIElementBehaviour.initialize(Juice.ItemsControlBehaviour, this);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._setHeaderElement(templatedElement.getPart("header").element);
        }
    }
    Juice.HeaderedItemsControl = HeaderedItemsControl;
    Juice.Builder.applyBehaviours(HeaderedItemsControl, [Juice.HeaderedControlBehaviour, Juice.ItemsControlBehaviour]);
    Juice.Builder.defineComponent({
        baseClass: Juice.UIElement,
        classConstructor: HeaderedItemsControl,
        className: "Juice.HeaderedItemsControl",
        tagName: "jui-headered-items-control"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    let DefaultHtmlContainerTemplate = `
<template template-class="HtmlContainer">
    <div template-part="container"></div>
</template>`;
    class HtmlContainer extends Juice.UIElement {
        constructor(template) {
            super(template || DefaultHtmlContainerTemplate);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_container = templatedElement.getPart("container").element;
        }
        get html() {
            return this._part_container.innerHTML;
        }
        set html(v) {
            this._part_container.innerHTML = v;
        }
        addContent(...content) {
            for (let element of content) {
                this._part_container.appendChild(element);
            }
        }
        setContent(...content) {
            this.html = "";
            this.addContent(...content);
        }
    }
    Juice.HtmlContainer = HtmlContainer;
    Juice.Builder.defineComponent({
        baseClass: Juice.UIElement,
        classConstructor: HtmlContainer,
        className: "Juice.HtmlContainer",
        tagName: "jui-html-container"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    let _applications = new Map();
    function getApplication(appId) {
        if (_applications.has(appId)) {
            let appInfo = _applications.get(appId);
            return appInfo.appInstance;
        }
        return null;
    }
    Juice.getApplication = getApplication;
    function registerApplication(appInstance, appHtmlElement) {
        if (_applications.has(appInstance.appId)) {
            throw new Error(`application ${appInstance.appId} already registered`);
        }
        else {
            _applications.set(appInstance.appId, {
                appId: appInstance.appId,
                appInstance,
                appHtmlElement
            });
        }
    }
    Juice.registerApplication = registerApplication;
    function unregisterApplication(appInstance) {
        if (!_applications.has(appInstance.appId)) {
            _applications.delete(appInstance.appId);
            return true;
        }
        return false;
    }
    Juice.unregisterApplication = unregisterApplication;
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class Page extends Juice.UIElement {
        constructor(template) {
            super(template);
        }
    }
    Juice.Page = Page;
    Juice.Builder.defineComponent({
        baseClass: Juice.UIElement,
        classConstructor: Page,
        className: "Juice.Page",
        tagName: "jui-page"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class PopUp extends Juice.ContentControl {
        constructor(templateSource) {
            super(templateSource || PopUp.DefaultPopUpTemplate);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_popup = templatedElement.getPart("popup").element;
        }
        _onPopUpOpenPropertyChanged(newValue) {
            this._part_popup.style.display = newValue ? "block" : "none";
        }
        get owner() {
            return this._owner;
        }
        get isPopUpOpen() {
            return this._isPopUpOpen;
        }
        set isPopUpOpen(v) {
            if (this._isPopUpOpen !== v) {
                this._isPopUpOpen = v;
                this._onPopUpOpenPropertyChanged(v);
            }
        }
    }
    PopUp.DefaultPopUpTemplate = `
		<template template-class="Juice.TableView">
			<style>
				.jui-popup-container {
					position: relative;
					height: 0 !important;
				}
				.jui-popup {
					position: absolute;
					left: 0;
					top: 0;
				}
			</style>
			<div template-part="popup-container" class="jui-popup-container">
				<div template-part="popup" class="jui-popup" style="display: none;">
					<div template-part="content" class="jui-button-content"></div>
				</div>
			</div>
		</template>
		`;
    Juice.PopUp = PopUp;
    Juice.Builder.defineComponent({
        baseClass: Juice.ContentControl,
        classConstructor: PopUp,
        className: "Juice.PopUp",
        tagName: "jui-pop-up"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class ReactiveObjectBase {
        constructor() {
            this._internalValueChangedHandler = (name, oldValue, newValue) => {
                this._events.trigger("onPropertyChanged", { name, oldValue, newValue });
            };
            this._map = new Map();
            this._events = new Juice.EventsManager(this);
            this.onPropertyChanged = this._events.create("onPropertyChanged");
        }
        _internalSetValue(name, value) {
            let originalValue = null;
            if (this._map.has(name)) {
                originalValue = this._map.get(name);
                if (originalValue === value) {
                    return;
                }
            }
            this._map.set(name, value);
            if (typeof this._internalValueChangedHandler === "function") {
                this._internalValueChangedHandler(name, originalValue, value);
            }
        }
        _internalGetValue(name) {
            return this._map.get(name);
        }
        _internalHas(name) {
            return this._map.has(name);
        }
    }
    class ReactiveObject extends ReactiveObjectBase {
        constructor() {
            super();
        }
        setValue(name, value) {
            this._internalSetValue(name, value);
            return this;
        }
        getValue(name) {
            return this._internalGetValue(name);
        }
        has(name) {
            return this._internalHas(name);
        }
    }
    Juice.Builder.defineClass({
        baseClass: Object,
        classConstructor: ReactiveObject,
        className: "Juice.ReactiveObject"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class Selector {
        constructor(selector, context) {
            this.selector = selector;
            this.context = context;
        }
        getCurrentContext() {
            if (typeof this.context === "function") {
                return this.context();
            }
            else {
                return this.context;
            }
        }
        query() {
            if (this.context) {
                return this.getCurrentContext().querySelector(this.selector);
            }
            return document.querySelector(this.selector);
        }
        queryAll() {
            if (this.context) {
                return this.getCurrentContext().querySelectorAll(this.selector);
            }
            return document.querySelectorAll(this.selector);
        }
    }
    Juice.Selector = Selector;
    Juice.Builder.defineClass({
        baseClass: Object,
        classConstructor: Selector,
        className: "Juice.Selector"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    let Orientation;
    (function (Orientation) {
        Orientation["Horizontal"] = "horizontal";
        Orientation["Vertical"] = "vertical";
    })(Orientation = Juice.Orientation || (Juice.Orientation = {}));
    class StackLayout extends Juice.ItemsControl {
        constructor(template) {
            super(template || StackLayout.DefaultStackLayoutTemplate);
            this._orientation = Orientation.Vertical;
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_layoutItems = templatedElement.getPart("layoutItems").element;
        }
        _onItemsCollectionChanged(args) {
            switch (args.action) {
                case Juice.CollectionChangedAction.Added: {
                    this.onItemsAdded(args);
                    break;
                }
                case Juice.CollectionChangedAction.Removed: {
                    this.onItemsRemoved(args);
                    break;
                }
                case Juice.CollectionChangedAction.Cleared: {
                    this.onCollectionCleared(args);
                    break;
                }
            }
        }
        onItemsAdded(e) {
            var refElement = this._part_layoutItems.children[e.index];
            if (!refElement) {
                for (let i = 0; i < e.items.length; i++) {
                    let item = e.items[i];
                    this._part_layoutItems.appendChild(e.items[i].htmlElement);
                }
            }
            else {
                for (let i = 0; i < e.items.length; i++) {
                    var child = e.items[i].htmlElement;
                    this._part_layoutItems.insertBefore(child, refElement);
                    refElement = child;
                }
            }
        }
        onItemsRemoved(e) {
            console.warn("StackPanel.onItemsRemoved not implemented");
        }
        onCollectionCleared(e) {
            while (this._part_layoutItems.firstChild)
                this._part_layoutItems.firstChild.remove();
        }
        onOrientationChanged() {
            if (this._orientation === Orientation.Vertical) {
                this._part_layoutItems.classList.add("vertical");
                this._part_layoutItems.classList.remove("horizontal");
            }
            else {
                this._part_layoutItems.classList.add("horizontal");
                this._part_layoutItems.classList.remove("vertical");
            }
        }
        get orientation() { return this._orientation; }
        set orientation(v) {
            if (this._orientation !== v) {
                this._orientation = v;
                this.onOrientationChanged();
            }
        }
    }
    StackLayout.DefaultStackLayoutStyle = `
        .jui-stack-layout-items {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
        }
        
        .jui-stack-layout-items.vertical {
            flex-direction: column;
        }
        
        .jui-stack-layout-items.horizontal {
            flex-direction: row;
        }`;
    StackLayout.DefaultStackLayoutHtmlTemplate = `
<template template-class="Juice.StackLayout">
    <div class="jui-stack-layout">
        <div template-part="layoutItems" class="jui-stack-layout-items vertical"></div>
    </div>
</template>`;
    StackLayout.DefaultStackLayoutTemplate = `<style>\n${StackLayout.DefaultStackLayoutStyle}\n</style>\n${StackLayout.DefaultStackLayoutHtmlTemplate}`;
    Juice.StackLayout = StackLayout;
    Juice.Builder.defineComponent({
        baseClass: Juice.ItemsControl,
        classConstructor: StackLayout,
        className: "Juice.StackLayout",
        tagName: "jui-stack-layout"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class TableView extends Juice.UIElement {
        constructor(template) {
            super(template || TableView.DefaultTableViewTemplate);
            this.onPropertyChanged.add((s, e) => {
                if (e.propertyName === "data") {
                    this.onDataPropertyChanged(e.propertyValue);
                }
            });
        }
        initializeTemplate(templatedElemnt) {
            super.initializeTemplate(templatedElemnt);
            this._part_table = templatedElemnt.getPart("table").element;
        }
        onDataPropertyChanged(data) {
            this.clearTable();
            if (data === null) {
                return;
            }
            if (data instanceof Array) {
                this.loadIterable(data);
            }
            else if (data instanceof Date) {
                this.loadPrimitive(data);
            }
            else if (typeof data === "object") {
                this.loadObject(data);
            }
            else {
                this.loadPrimitive(data);
            }
        }
        loadIterable(data) {
            let thead = document.createElement("thead");
            let tbody = document.createElement("tbody");
            if (data !== null) {
                for (let record of data) {
                    let firstEntry = true;
                    let entryType = null;
                    let firstItem = record;
                    if (firstItem instanceof Array) {
                        entryType = "array";
                    }
                    else {
                        entryType = typeof firstItem;
                    }
                    if (entryType === "object") {
                        let tdIndexHead = document.createElement("th");
                        tdIndexHead.innerText = "#";
                        tdIndexHead.classList.add("index");
                        thead.appendChild(tdIndexHead);
                        for (let k of Object.keys(firstItem)) {
                            let td = document.createElement("th");
                            td.innerText = k;
                            thead.appendChild(td);
                        }
                        let index = 0;
                        for (let record of data) {
                            let tr = document.createElement("tr");
                            let tdIndex = document.createElement("td");
                            tdIndex.classList.add("index");
                            tdIndex.innerText = index.toString();
                            tr.appendChild(tdIndex);
                            for (let k of Object.keys(record)) {
                                let v = record[k];
                                let td = document.createElement("td");
                                td.innerText = v;
                                tr.appendChild(td);
                            }
                            tbody.appendChild(tr);
                            index++;
                        }
                    }
                    else if (entryType === "array") {
                        let index = 0;
                        for (let record of data) {
                            let tr = document.createElement("tr");
                            let tdIndex = document.createElement("td");
                            tdIndex.classList.add("index");
                            tdIndex.innerText = index.toString();
                            tr.appendChild(tdIndex);
                            let tdValue = document.createElement("td");
                            tdValue.innerText = record.toString();
                            tr.appendChild(tdValue);
                            tbody.appendChild(tr);
                            index++;
                        }
                    }
                    else {
                        let index = 0;
                        for (let record of data) {
                            let tr = document.createElement("tr");
                            let tdIndex = document.createElement("td");
                            tdIndex.classList.add("index");
                            tdIndex.innerHTML = `<b>${index}</b>`;
                            tr.appendChild(tdIndex);
                            let tdValue = document.createElement("td");
                            tdValue.innerText = record.toString();
                            tr.appendChild(tdValue);
                            tbody.appendChild(tr);
                            index++;
                        }
                    }
                    break;
                }
            }
            this._part_table.appendChild(thead);
            this._part_table.appendChild(tbody);
        }
        loadPrimitive(primitive) {
            let tr = document.createElement("tr");
            let td = document.createElement("td");
            td.innerText = primitive.toString();
            tr.appendChild(td);
            this._part_table.appendChild(tr);
        }
        loadObject(obj) {
            let tbody = document.createElement("tbody");
            if (obj !== null) {
                for (let k of Object.keys(obj)) {
                    let tr = document.createElement("tr");
                    let value = obj[k];
                    if (typeof value === "function")
                        continue;
                    let tdName = document.createElement("td");
                    tdName.innerHTML = `<b>${k}</b>`;
                    tr.appendChild(tdName);
                    let tdValue = document.createElement("td");
                    if (Juice.Internals.isPrimitive(value) || value instanceof Date) {
                        tdValue.innerText = `${value}`;
                    }
                    else {
                        let treeItem = this.createValueTreeNode(value);
                        tdValue.appendChild(treeItem.htmlElement);
                    }
                    tr.appendChild(tdValue);
                    tbody.appendChild(tr);
                }
            }
            this._part_table.appendChild(tbody);
        }
        createValueTreeNode(value) {
            if (typeof value === "function")
                return null;
            let node = new Juice.TreeViewItem();
            if (typeof value !== "string" && typeof value[Symbol.iterator] === 'function') {
                let iterable = value;
                node.header = "(iterable)";
                this.buildIterableTree(node, iterable);
            }
            else if (value instanceof Date) {
                node.header = value.toISOString();
            }
            else if (typeof value === "object") {
                node.header = "(object)";
                this.buildObjectTree(node, value);
            }
            else {
                node.header = `${value}`;
            }
            return node;
        }
        buildObjectTree(owner, obj) {
            if (obj !== null) {
                for (let k of Object.keys(obj)) {
                    let child = new Juice.TreeViewItem();
                    child.header = k;
                    let value = obj[k];
                    if (typeof value !== "string" && typeof value[Symbol.iterator] === 'function') {
                        this.buildIterableTree(child, value);
                    }
                    else if (value instanceof Date) {
                        child.header += `: ${value.toISOString()}`;
                    }
                    else if (typeof value === "object") {
                        this.buildObjectTree(child, value);
                    }
                    else {
                        child.header += `: ${value}`;
                    }
                    owner.items.add(child);
                }
            }
        }
        buildIterableTree(owner, iterable) {
            if (iterable !== null) {
                owner.onStateChanged.add((s, e) => {
                    const valueToLoad = iterable;
                    if (e.isFirstExpansion) {
                        owner.items.clear();
                        for (const value of valueToLoad) {
                            let child = this.createValueTreeNode(value);
                            owner.items.add(child);
                        }
                    }
                }, this);
                owner.addChildTreeViewItem("");
            }
        }
        clearTable() {
            while (this._part_table.firstChild)
                this._part_table.firstChild.remove();
        }
        clear() {
            this.data = null;
        }
    }
    TableView.DefaultTableViewStyles = `
    .jui-table-view {
        width: auto;
        white-space: nowrap;
    }

    .jui-table-view thead {
    }

    .jui-table-view th {
        white-space: nowrap;
        /*padding: 0 4px;
        font-size: 0.9em;*/
    }

    .jui-table-view td {
        white-space: nowrap;
        /*padding-left: 4px;
        padding-right: 4px;*/
    }`;
    TableView.DefaultTableViewHtmlTemplate = `
    <template template-class="Juice.TableView">
        <table template-part="table" class="jui-table-view">
        </table>
    </template>`;
    TableView.DefaultTableViewTemplate = `<style>\n${TableView.DefaultTableViewStyles}\n</style>\n${TableView.DefaultTableViewHtmlTemplate}`;
    Juice.TableView = TableView;
    Juice.Builder.defineComponent({
        baseClass: Juice.UIElement,
        classConstructor: TableView,
        className: "Juice.TableView",
        tagName: "jui-table-view"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class Toolbar extends Juice.HeaderedItemsControl {
        constructor(template) {
            super(template || Toolbar.DefaultToolbarTemplate);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_toolbarItems = templatedElement.getPart("toolbarItems").element;
        }
        onItemsAdded(e) {
            var refElement = this._part_toolbarItems.children[e.index];
            if (!refElement) {
                for (let i = 0; i < e.items.length; i++) {
                    let item = e.items[i];
                    if (item instanceof Juice.Button) {
                        item.htmlElement.classList.remove("jui-button");
                        item.htmlElement.classList.add("jui-toolbar-button");
                    }
                    this._part_toolbarItems.appendChild(e.items[i].htmlElement);
                }
            }
            else {
                for (let i = 0; i < e.items.length; i++) {
                    var child = e.items[i].htmlElement;
                    this._part_toolbarItems.insertBefore(child, refElement);
                    refElement = child;
                }
            }
        }
        onItemsRemoved(e) {
            console.warn("Toolbar.onItemsRemoved not implemented");
        }
        onCollectionCleared(e) {
            while (this._part_toolbarItems.firstChild)
                this._part_toolbarItems.removeChild(this._part_toolbarItems.firstChild);
        }
        _onItemsCollectionChanged(args) {
            switch (args.action) {
                case Juice.CollectionChangedAction.Added:
                    this.onItemsAdded(args);
                    break;
                case Juice.CollectionChangedAction.Removed:
                    this.onItemsRemoved(args);
                    break;
                case Juice.CollectionChangedAction.Cleared:
                    this.onCollectionCleared(args);
                    break;
            }
        }
        _onApplyTemplate(templatedElement) {
            super._onApplyTemplate(templatedElement);
            this.initializeTemplate(templatedElement);
        }
        addButton(content) {
            let btn = new Juice.Button();
            if (typeof content !== "undefined") {
                btn.content = content;
            }
            this.items.add(btn);
            return btn;
        }
        addLabel(text) {
            if (typeof text !== "undefined" && text.length > 0) {
                let span = document.createElement("span");
                span.classList.add("jui-toolbar-label");
                span.innerText = text;
                let label = new Juice.HtmlContainer();
                label.addContent(span);
                this.items.add(label);
                return label;
            }
            return null;
        }
        addSeparator() {
            let sep = new Juice.HtmlContainer();
            sep.htmlElement.classList.add("jui-toolbar-item-separator");
            this.items.add(sep);
            return sep;
        }
    }
    Toolbar.DefaultToolbarStyles = `
    .jui-toolbar {
        display: flex;
        flex-flow: row;
        align-items: center;
    }

    .jui-toolbar-label {
        width: auto;
        /*padding: 0 10px;*/
        white-space: nowrap;
    }

    .jui-toolbar-items {
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        align-items: center;
        display: flex;
    }

    .jui-toolbar-items > * {
        display: inline-block;
        vertical-align: middle;
    }

	.jui-toolbar-label {
		font-size: 0.85em;
	}

    .jui-toolbar-button {
        display: inline-block;
        height: 100%;
        /*min-width: 32px;
        min-height: 32px;
        color: #222;
        background-color: transparent;
        outline: 0;
        border: 0;
        border-radius: 0;
        padding: 4px 4px;*/
        background-position: center center;
        background-repeat: no-repeat;
        background-size: auto;
        position: relative;
        cursor: default;
        user-select: none;
    }

    .jui-toolbar-menu-button > svg {
        display: block;
        /*position: relative;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);*/
    }`;
    Toolbar.DefaultToolbarHtmlTemplate = `
<template template-class="Juice.Toolbar">
    <div class="jui-toolbar">
        <div template-part="header" class="jui-toolbar-label"></div>
        <div template-part="toolbarItems" class="jui-toolbar-items"></div>
        <button disabled template-part="toolbarMenuButton" class="jui-toolbar-button jui-toolbar-menu-button">
            <svg class="jui-toolbar-icon-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="5.5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="18.5" r="1.5" />
            </svg>
        </button>
    </div>
</template>`;
    Toolbar.DefaultToolbarTemplate = `<style>\n${Toolbar.DefaultToolbarStyles}\n</style>\n${Toolbar.DefaultToolbarHtmlTemplate}`;
    Juice.Toolbar = Toolbar;
    Juice.Builder.defineComponent({
        baseClass: Juice.ItemsControl,
        classConstructor: Toolbar,
        className: "Juice.Toolbar",
        tagName: "jui-toolbar"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class TreeItem extends Juice.HeaderedItemsControl {
        constructor(template) {
            super(template);
            this._isExpanded = false;
            this._neverExpanded = true;
            this.onStateChanged = new Juice.EventSet(this.events, "onStateChanged", this);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_icon = templatedElement.getPart("icon").element;
            this._part_children = templatedElement.getPart("children").element;
            this.onIsExpandedChanged();
        }
        _onApplyTemplate(templatedElement) {
            super._onApplyTemplate(templatedElement);
            this.initializeTemplate(templatedElement);
            if (this.items.length > 0) {
                this.internalAddItems(0, this.items.toArray());
            }
        }
        _onItemsCollectionChanged(args) {
            switch (args.action) {
                case Juice.CollectionChangedAction.Added:
                    this.onItemsAdded(args);
                    break;
                case Juice.CollectionChangedAction.Removed:
                    this.onItemsRemoved(args);
                    break;
                case Juice.CollectionChangedAction.Cleared:
                    this.onCollectionCleared(args);
                    break;
                default:
                    break;
            }
            this.onCollectionChanged(args);
        }
        internalAddItems(index, items) {
            if (this._part_children) {
                var refElement = this._part_children.children[index];
                if (!refElement) {
                    for (let i = 0; i < items.length; i++) {
                        this._part_children.appendChild(items[i].htmlElement);
                    }
                }
                else {
                    for (let i = 0; i < items.length; i++) {
                        var child = items[i].htmlElement;
                        this._part_children.insertBefore(child, refElement);
                        refElement = child;
                    }
                }
            }
        }
        onItemsAdded(e) {
            this.internalAddItems(e.index, e.items);
        }
        onItemsRemoved(e) {
            console.warn("TreeItem.onItemsRemoved not implemented");
        }
        onCollectionCleared(e) {
            if (this._part_children) {
                while (this._part_children.lastChild)
                    this._part_children.removeChild(this._part_children.lastChild);
            }
        }
        onCollectionChanged(e) {
        }
        onIsExpandedChanged() {
            var firstExpansion = false;
            if (this._isExpanded) {
                if (this._neverExpanded)
                    firstExpansion = true;
                this._neverExpanded = false;
                this.htmlElement.classList.add(":expanded");
            }
            else {
                this.htmlElement.classList.remove(":expanded");
            }
            this.events.trigger("onPropertyChanged", { propertyName: "isExpanded", propertyValue: this._isExpanded });
            this.events.trigger("onStateChanged", { isExpanded: this._isExpanded, isFirstExpansion: firstExpansion });
        }
        get isExpanded() {
            return this._isExpanded;
        }
        set isExpanded(v) {
            if (this._isExpanded != v) {
                this._isExpanded = v;
                this.onIsExpandedChanged();
                this.events.trigger("onPropertyChanged", { propertyName: "isExpanded", propertyValue: v });
            }
        }
        get icon() {
            return this._part_icon.firstChild;
        }
        set icon(v) {
            this._part_icon.innerHTML = "";
            if (!v) {
                this._part_icon.style.display = "none";
            }
            else if (v instanceof HTMLElement) {
                this._part_icon.appendChild(v);
                this._part_icon.style.display = "inline-block";
            }
            else if (typeof v === "string") {
                let img = new Image();
                this._part_icon.appendChild(img);
                img.src = v;
                this._part_icon.style.display = "inline-block";
            }
        }
        get hasChildren() {
            return this.items.length > 0;
        }
    }
    Juice.TreeItem = TreeItem;
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class TreeView extends Juice.ItemsControl {
        constructor(template) {
            super(template || TreeView.DefaultTreeViewTemplate);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_children = templatedElement.getPart("children").element;
        }
        _onApplyTemplate(templatedElement) {
            super._onApplyTemplate(templatedElement);
            this.initializeTemplate(templatedElement);
        }
        onItemsAdded(e) {
            var refElement = this._part_children.children[e.index];
            if (!refElement) {
                for (let i = 0; i < e.items.length; i++) {
                    this._part_children.appendChild(e.items[i].htmlElement);
                }
            }
            else {
                for (let i = 0; i < e.items.length; i++) {
                    var child = e.items[i].htmlElement;
                    this._part_children.insertBefore(child, refElement);
                    refElement = child;
                }
            }
        }
        onItemsRemoved(e) {
            console.warn("TreeView.onItemsRemoved not implemented");
        }
        onCollectionCleared(e) {
            while (this._part_children.lastChild)
                this._part_children.removeChild(this._part_children.lastChild);
        }
        _onItemsCollectionChanged(args) {
            switch (args.action) {
                case Juice.CollectionChangedAction.Added:
                    this.onItemsAdded(args);
                    break;
                case Juice.CollectionChangedAction.Removed:
                    this.onItemsRemoved(args);
                    break;
                case Juice.CollectionChangedAction.Cleared:
                    this.onCollectionCleared(args);
                    break;
            }
        }
        addChildTreeViewItem(header) {
            let child = new Juice.TreeViewItem();
            child.header = header;
            this.items.add(child);
            return child;
        }
    }
    TreeView.DefaultTreeViewStyles = `
        .jui-tree-view {
        }

        .jui-tree-view > .\\\#content {
            overflow: auto;
        }

        .jui-tree-view > .\\\#content > .\\\#children {
        }
        `;
    TreeView.DefaultTreeViewHtmlTemplate = `
        <template template-class="TreeView">
            <div class="jui-tree-view">
                <div template-part="content" class="#content">
                    <div template-part="children" class="#children"></div>
                </div>
            </div>
        </template>`;
    TreeView.DefaultTreeViewTemplate = `<style>\n${TreeView.DefaultTreeViewStyles}\n</style>\n${TreeView.DefaultTreeViewHtmlTemplate}`;
    Juice.TreeView = TreeView;
    Juice.Builder.defineComponent({
        baseClass: Juice.ItemsControl,
        classConstructor: TreeView,
        className: "Juice.TreeView",
        tagName: "jui-tree-view"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    class TreeViewItem extends Juice.TreeItem {
        constructor(template) {
            super(template || TreeViewItem.DefaultTreeViewItemTemplate);
        }
        initializeTemplate(templatedElement) {
            super.initializeTemplate(templatedElement);
            this._part_expander = templatedElement.withPartElement("expander", (element) => {
                element.addEventListener("click", this.onExpanderClick.bind(this));
            });
            this.header = "TreeViewItem";
        }
        onCollectionChanged(e) {
            if (this._part_expander != null) {
                this._part_expander.style.opacity = this.items.length > 0 ? "1.0" : "0.0";
            }
        }
        onExpanderClick(e) {
            this.isExpanded = !this.isExpanded;
        }
        addChildTreeViewItem(header) {
            let child = new TreeViewItem();
            child.header = header;
            this.items.add(child);
            return child;
        }
    }
    TreeViewItem.DefaultTreeViewItemStyles = `
        .jui-tree-view-item {
            display: flex;
            flex-direction: column;
            align-items: stretch;
        }
    
        .jui-tree-view-item > .\\\#header-frame {
            display: flex;
            flex-direction: row;
            align-items: baseline;
        }
    
        .jui-tree-view-item > .\\\#header-frame > .\\\#expander {
            margin-right: 8px;
			opacity: 0;
        }
    
        .jui-tree-view-item > .\\\#header-frame > .\\\#expander > i.-expanded {
            display: none;
        }
        .jui-tree-view-item > .\\\#header-frame > .\\\#expander > i.-collapsed {
            display: inline-block;
        }
    
        .jui-tree-view-item.\\:expanded > .\\\#header-frame > .\\\#expander > i.-expanded {
            display: inline-block;
        }
        .jui-tree-view-item.\\:expanded > .\\\#header-frame > .\\\#expander > i.-collapsed {
            display: none;
        }
    
        .jui-tree-view-item > .\\\#header-frame > .\\\#icon {
            display: none;
            margin-right: 8px;
        }
    
        .jui-tree-view-item > .\\\#header-frame > .\\\#icon > img {
            max-width: 20px;
            max-height: 20px;
        }
    
        .jui-tree-view-item > .\\\#header-frame > .\\\#header {
            flex-grow: 1;
        }
    
        .jui-tree-view-item > .\\\#header-frame > .\\\#extra {
        }
    
        .jui-tree-view-item > .\\\#content {
            display: none;
            padding-left: 16px;
        }
    
        .jui-tree-view-item.\\:expanded > .\\\#content {
            display: block;
        }
    
        .jui-tree-view-item > .\\\#content > .\\\#children {
        }
        `;
    TreeViewItem.DefaultTreeViewItemHtmlTemplate = `
        <template template-class="TreeViewItem">
            <div class="jui-tree-view-item">
                <div class="#header-frame">
                    <div template-part="expander"class="#expander"><i class="-expanded fas fa-angle-down"></i><i class="-collapsed fas fa-angle-right"></i></div>
                    <div template-part="icon"class="#icon"><img /></div>
                    <div template-part="header"class="#header"></div>
                    <div template-part="extra"class="#extra"></div>
                </div>
                <div template-part="content" class="#content">
                    <div template-part="children" class="#children"></div>
                </div>
            </div>
        </template>`;
    TreeViewItem.DefaultTreeViewItemTemplate = `<style>\n${TreeViewItem.DefaultTreeViewItemStyles}\n</style>\n${TreeViewItem.DefaultTreeViewItemHtmlTemplate}`;
    Juice.TreeViewItem = TreeViewItem;
    Juice.Builder.defineComponent({
        baseClass: Juice.HeaderedItemsControl,
        classConstructor: TreeViewItem,
        className: "Juice.TreeViewItem",
        tagName: "jui-tree-view-item"
    });
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    let Internals;
    (function (Internals) {
        function isPrimitive(value) {
            if (value === null)
                return false;
            var type = typeof value;
            switch (type) {
                case "string":
                case "number":
                case "boolean":
                    return true;
                default:
                    return false;
            }
        }
        Internals.isPrimitive = isPrimitive;
    })(Internals = Juice.Internals || (Juice.Internals = {}));
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    let Internals;
    (function (Internals) {
        Internals.templateDirPath = "/assets/templates/";
        function getTemplateFile(path, isAbsolute = false) {
            let url = path;
            if (!isAbsolute) {
                url = Internals.templateDirPath + path;
            }
            return new Promise((resolve, reject) => {
                fetch(url)
                    .then((response) => {
                    return response.text();
                })
                    .then((content) => {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(content, 'text/html');
                    resolve(doc);
                })
                    .catch(err => {
                    reject(err);
                });
            });
        }
        Internals.getTemplateFile = getTemplateFile;
    })(Internals = Juice.Internals || (Juice.Internals = {}));
})(Juice || (Juice = {}));
var Juice;
(function (Juice) {
    let Internals;
    (function (Internals) {
        const _uids = [];
        const _uidsInstances = new Map();
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        function getFreeUid() {
            var uid;
            do {
                uid = s4() + s4();
            } while (_uids.indexOf(uid) >= 0);
            return uid;
        }
        Internals.getFreeUid = getFreeUid;
        function registerElement(uid, instance, element) {
            _uidsInstances.set(uid, { instance, element });
        }
        Internals.registerElement = registerElement;
        function setContent(element, content) {
            element.innerHTML = "";
            if (typeof content === "undefined" || content == null) {
                return;
            }
            if (Internals.isPrimitive(content)) {
                if (typeof content === "string" && /^\s*<\w+/.test(content)) {
                    element.innerHTML = content;
                }
                else {
                    element.innerText = content.toString();
                }
            }
            else if (content instanceof Juice.UIElement) {
                element.appendChild(content.htmlElement);
            }
            else {
                if (content instanceof HTMLElement) {
                    element.appendChild(content);
                }
                else if (content instanceof NodeList) {
                    for (let child of content) {
                        element.appendChild(child);
                    }
                }
                else {
                    element.innerText = content.toString();
                }
            }
        }
        Internals.setContent = setContent;
    })(Internals = Juice.Internals || (Juice.Internals = {}));
})(Juice || (Juice = {}));
//# sourceMappingURL=juice-lite.js.map