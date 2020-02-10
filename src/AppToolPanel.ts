
namespace TryLinq {

    export class AppToolPanel extends Juice.UIElement {

        protected static readonly DefaultAppToolPanelStyles = `
    .app-tool-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .app-tool-panel-content {
        flex-grow: 1;
        overflow: auto;
    }`;

        protected static readonly DefaultAppToolPanelHtmlTemplate = `
    <template template-class="AppToolPanel">
        <div template-part="layoutRoot" class="app-tool-panel">
            <div template-part="toolbar" class="app-tool-panel-toolbar"></div>
            <div template-part="content" class="app-tool-panel-content"></div>
        </div>
    </template>`;

        private static readonly DefaultAppToolPanelTemplate = `<style>\n${AppToolPanel.DefaultAppToolPanelStyles}\n</style>\n${AppToolPanel.DefaultAppToolPanelHtmlTemplate}`;

        private _part_toolbar: HTMLElement;

        private _toolbar: Juice.Toolbar;

        constructor(template?: Juice.TemplateSource) {
            super(template || AppToolPanel.DefaultAppToolPanelTemplate);
        }

        protected initializeTemplate(templatedElement: Juice.TemplatedElement) {
            super.initializeTemplate(templatedElement);

            this._part_toolbar = templatedElement.getPart<HTMLElement>("toolbar").element;
            this._toolbar = new Juice.Toolbar();
            this._toolbar.appendToHtmlElement(this._part_toolbar);
        }

        public get toolbar(): Juice.Toolbar {
            return this._toolbar;
        }
    }

    Juice.Builder.defineComponent({
        baseClass: Juice.UIElement,
        classConstructor: AppToolPanel,
        className: "AppToolPanel",
        tagName: "app-tool-panel"
    });
}