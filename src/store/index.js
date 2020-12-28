/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2020 - https://www.igorski.nl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import LZString from "lz-string";
import KeyboardService from "@/services/keyboard-service";
import DocumentFactory from "@/factories/document-factory";
import { LAYER_IMAGE } from "@/definitions/layer-types";
import { runSpriteFn } from "@/factories/sprite-factory";
import canvasModule    from "./modules/canvas-module";
import documentModule  from "./modules/document-module";
import imageModule     from "./modules/image-module";
import toolModule      from "./modules/tool-module";
import { copySelection } from "@/utils/canvas-util";
import { saveBlobAsFile, selectFile, readFile } from "@/utils/file-util";
import { truncate } from "@/utils/string-util";

export const PROJECT_FILE_EXTENSION = ".bpy";

// cheat a little by exposing the vue-i18n translations directly to the
// store so we can commit translated error/success messages from actions

let i18n;
const translate = ( key, optArgs ) => i18n?.t( key, optArgs ) ?? key;

export default {
    modules: {
        canvasModule,
        documentModule,
        imageModule,
        toolModule,
    },
    state: {
        menuOpened: false,
        toolboxOpened: false,
        optionsPanelOpened: true,
        selectionContent: null, // clipboard content of copied images ({ image, size })
        blindActive: false,
        dragMode: false,    // whether drag interactions with the document will pan its viewport
        dialog: null,       // currently opened dialog
        modal: null,        // currently opened modal
        notifications: [],  // notification message queue
        windowSize: {
            width: window.innerWidth,
            height: window.innerHeight
        },
    },
    getters: {
        // eslint-disable-next-line no-unused-vars
        t: state => ( key, optArgs ) => translate( key, optArgs ),
    },
    mutations: {
        setMenuOpened( state, value ) {
            state.menuOpened = !!value;
        },
        setToolboxOpened( state, value ) {
            state.toolboxOpened = !!value;
        },
        setOptionsPanelOpened( state, value ) {
            state.optionsPanelOpened = !!value;
        },
        setSelectionContent( state, image ) {
            state.selectionContent = image;
        },
        setBlindActive( state, active ) {
            state.blindActive = !!active;
        },
        setDragMode( state, value ) {
            state.dragMode = value;
        },
        /**
         * open a dialog window showing given title and message.
         * types can be info, error or confirm. When type is confirm, optional
         * confirmation and cancellation handler can be passed.
         */
        openDialog( state, { type = "info", title = "", message = "", confirm = null, cancel = null }) {
            state.dialog = { type, title , message, confirm, cancel };
        },
        closeDialog( state ) {
            state.dialog = null;
        },
        openModal( state, modalName ) {
            state.blindActive = !!modalName;
            state.modal = modalName;
            KeyboardService.setSuspended( !!state.modal );
        },
        closeModal( state ) {
            state.blindActive = false;
            state.modal = null;
            KeyboardService.setSuspended( false );
        },
        /**
         * shows a notification containing given title and message.
         * multiple notifications can be stacked.
         */
        showNotification( state, { message = "", title = null }) {
            state.notifications.push({ title: title || translate( "title.success" ), message });
        },
        clearNotifications( state ) {
            state.notifications = [];
        },
        /**
         * cache the resize in the store so components can react to these values
         * instead of maintaining multiple listeners at the expense of DOM trashing/performance hits
         */
        setWindowSize( state, { width, height }) {
            state.windowSize = { width, height };
        },
    },
    actions: {
        async loadDocument({ commit }) {
            const fileList = await selectFile( PROJECT_FILE_EXTENSION, false );
            if ( !fileList?.length ) {
                return;
            }
            const file = fileList[ 0 ];
            try {
                const fileData = await readFile( file );
                const data     = LZString.decompressFromUTF16( fileData );
                const document = await DocumentFactory.deserialize( JSON.parse( data ));
                commit( "addNewDocument", document );
                commit( "showNotification", {
                    message: translate( "loadedFileSuccessfully", { file: truncate( file.name, 35 ) })
                });
            } catch ( e ) {
                commit( "showNotification", {
                    title: translate( "title.error" ),
                    message: translate( "errorLoadingFile", { file: truncate( file.name, 35 ) })
                });
            }
        },
        saveDocument({ commit, getters }, name = null ) {
            if ( !name ) {
                name = getters.activeDocument.name;
            }
            const data   = DocumentFactory.serialize( getters.activeDocument );
            const binary = new Blob([
                LZString.compressToUTF16( JSON.stringify( data ))
            ], { type: "text/plain" });
            saveBlobAsFile( binary, `${name.split( "." )[ 0 ]}${PROJECT_FILE_EXTENSION}` );
            commit( "showNotification", {
                message: translate( "savedFileSuccessfully" , { file: truncate( name, 35 ) })
            });
        },
        async requestSelectionCopy({ commit, dispatch, getters }) {
            const selectionImage = await copySelection( getters.activeDocument, getters.activeLayer );
            commit( "setSelectionContent", selectionImage );
            commit( "setActiveTool", { tool: null, activeLayer: getters.activeLayer });
            commit( "showNotification", { message: translate( "selectionCopied" ) });
            dispatch( "clearSelection" );
        },
        clearSelection({ getters }) {
            runSpriteFn( sprite => sprite.resetSelection(), getters.activeDocument );
        },
        pasteSelection({ commit, dispatch, state }) {
            commit( "addLayer",
                { type: LAYER_IMAGE, bitmap: state.selectionContent.image, ...state.selectionContent.size }
            );
            dispatch( "clearSelection" );
        },
        /**
         * Install the services that will listen to global hardware events
         *
         * @param {Object} i18nReference vue-i18n Object instance so we can
         *                 access translations inside Vuex store modules
         */
        setupServices( store, i18nReference ) {
            i18n = i18nReference;
            const storeReference = this;
            return new Promise( resolve => {
                KeyboardService.init( storeReference );
                resolve();
            });
        },
    },
};
