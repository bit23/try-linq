
namespace TryLinq {

    export class AppToolbar extends Juice.Toolbar {

        protected static readonly DefaultAppToolbarStyles = `
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

        protected static readonly DefaultAppToolbarHtmlTemplate = `
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

        private static readonly DefaultAppToolbarTemplate = `<style>\n${AppToolbar.DefaultAppToolbarStyles}\n</style>\n${AppToolbar.DefaultAppToolbarHtmlTemplate}`;

        constructor(template?: Juice.TemplateSource) {
            super(template || AppToolbar.DefaultAppToolbarTemplate);
        }

        protected initializeTemplate(templatedElement: Juice.TemplatedElement) {
            super.initializeTemplate(templatedElement);
        }
    }

    Juice.Builder.defineComponent({
        baseClass: Juice.Toolbar,
        classConstructor: AppToolbar,
        className: "AppToolbar",
        tagName: "app-toolbar"
    });
}