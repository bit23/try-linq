
namespace TryLinq {

    export enum PanelsLayoutType {
        Layout1,
        Layout2,
        Layout3
    }

    export class AppPanelsLayout extends Juice.UIElement {

        protected static readonly DefaultAppPanelsLayoutStyles = `
    .app-panels-layout {
        height: 100%;
        position: relative;
    }`;

        protected static readonly DefaultAppPanelsLayoutHtmlTemplate = `
    <template template-class="AppFramesLayout">
        <div template-part="layoutRoot" class="app-panels-layout">
            <div template-part="panel1" class="layout-panel panel1"></div>
            <div template-part="panel2" class="layout-panel panel2"></div>
            <div template-part="panel3" class="layout-panel panel3"></div>
        </div>
    </template>`;

        private static readonly DefaultAppPanelsLayoutTemplate = `<style>\n${AppPanelsLayout.DefaultAppPanelsLayoutStyles}\n</style>\n${AppPanelsLayout.DefaultAppPanelsLayoutHtmlTemplate}`;

        private _panel1: AppToolPanel;
        private _panel2: AppToolPanel;
        private _panel3: AppToolPanel;
        private _layoutType: PanelsLayoutType;
        private _part_layoutRoot: HTMLElement;

        private _part_panel1: HTMLElement;
        private _part_panel2: HTMLElement;
        private _part_panel3: HTMLElement;

        constructor(template?: Juice.TemplateSource) {
            super(template || AppPanelsLayout.DefaultAppPanelsLayoutTemplate);
        }

        protected initializeTemplate(templatedElement: Juice.TemplatedElement) {
            super.initializeTemplate(templatedElement);

            this._part_layoutRoot = templatedElement.getPart<HTMLElement>("layoutRoot").element;
            this._part_panel1 = templatedElement.getPart<HTMLElement>("panel1").element;
            this._part_panel2 = templatedElement.getPart<HTMLElement>("panel2").element;
            this._part_panel3 = templatedElement.getPart<HTMLElement>("panel3").element;

            this.layoutType = PanelsLayoutType.Layout1
        }

        private onLayoutTypeChanged() {
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

        public get panel1(): AppToolPanel {
            return this._panel1;
        }
        public set panel1(v: AppToolPanel) {
            if (this._panel1 !== v) {
                this._panel1 = v;
                this._part_panel1.innerHTML = "";
                this._part_panel1.appendChild(this._panel1.htmlElement);
            }
        }

        public get panel2(): AppToolPanel {
            return this._panel2;
        }
        public set panel2(v: AppToolPanel) {
            if (this._panel2 !== v) {
                this._panel2 = v;
                this._part_panel2.innerHTML = "";
                this._part_panel2.appendChild(this._panel2.htmlElement);
            }
        }

        public get panel3(): AppToolPanel {
            return this._panel3;
        }
        public set panel3(v: AppToolPanel) {
            if (this._panel3 !== v) {
                this._panel3 = v;
                this._part_panel3.innerHTML = "";
                this._part_panel3.appendChild(this._panel3.htmlElement);
            }
        }

        public get layoutType(): PanelsLayoutType {
            return this._layoutType;
        }
        public set layoutType(v: PanelsLayoutType) {
            this._layoutType = v;
            this.onLayoutTypeChanged();
        }
    }


    Juice.Builder.defineComponent({
        baseClass: Juice.UIElement,
        classConstructor: AppPanelsLayout,
        className: "AppPanelsLayout",
        tagName: "app-panels-layout"
    });
}