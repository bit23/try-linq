/// <reference path="../libs/juice-lite/juice-lite.d.ts" />
/// <reference path="../libs/linq-g/linq-g.d.ts" />

namespace TryLinq {

    import Application = Juice.Application;

    export class TryLinqApp extends Application {

        private _appPage: AppPage;

        constructor() {
            super();
        }

        protected initialize() {
            super.initialize();
            // TODO initialization

            // this._appPage = new AppPage();
            // this.onApplicationReady.add((s, e) => {
            //     this.showPage(this._appPage);
            // });
        }

        public run() {
            super.configure(() => {
                return {
                    mainElement: () => new AppPage(this.applicationService),
                    rootNode: () => document.body,
                    currentTheme: () => "dark-theme"
                };
            });
            super.run();
        }
    }
}