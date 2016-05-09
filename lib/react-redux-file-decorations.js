'use babel';

import {CompositeDisposable} from 'atom';
import path from 'path';

export default {
    subscriptions: null,

    activate(state) {
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        const renameTabs = (event) => setTimeout(() => this.renameTabs(event), 0);

        atom.workspace.observeTextEditors((editor) => {
            this.subscriptions.add(editor.onDidDestroy(renameTabs));
            this.subscriptions.add(editor.onDidChangePath(renameTabs));
            this.subscriptions.add(editor.onDidChangeTitle(renameTabs));
        });

        atom.workspace.observePanes((pane) => {
            this.subscriptions.add(pane.onDidMoveItem(renameTabs));
            this.subscriptions.add(pane.onDidAddItem(renameTabs));
            this.subscriptions.add(pane.onDidRemoveItem(renameTabs));
        });

        setTimeout(renameTabs, 1000);
    },

    deactivate() {
        this.subscriptions.dispose();
    },

    renameTabs(event) {
        const elements = Array.from(document.querySelectorAll('li.tab .title'));

        elements.forEach((el) => {
            const name = el.getAttribute('data-name');

            if (!name) {
                return;
            }

            if (name === 'component.js' ||
                name === 'actions.js' ||
                name === 'reducer.js' ||
                name === 'selectors.js' ||
                name.match(/^index.*/)
            ) {
                el.innerText = `/${this.getDirectoryName(el)}`;
            }
            else {
                el.innerText = name;
            }
        })
    },

    getDirectoryName(el) {
        const dir = path.dirname(el.getAttribute('data-path'));
        const dirs = dir.split(path.sep);

        return dirs[dirs.length - 1];
    }
};
