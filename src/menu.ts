import { app, Menu, MenuItemConstructorOptions } from 'electron';
import * as ElectronStore from 'electron-store';

const store = new ElectronStore();
const AUTO_HIDE_SETTING_KEY = "autoHideMenuBar";

export const shouldAutoHideMenu = () => !!store.get(AUTO_HIDE_SETTING_KEY);

export const getMenu = (browserWindows: Electron.BrowserWindow[]) => {
    const menuTemplate: MenuItemConstructorOptions[] = [
        {
            label: '&Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut', registerAccelerator: false },
                { role: 'copy', registerAccelerator: false },
                { role: 'paste', registerAccelerator: false },
                { role: 'pasteAndMatchStyle', registerAccelerator: false },
                { role: 'delete' },
                { role: 'selectAll' }
            ]
        },
        {
            label: '&View',
            submenu: [
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' },
                { type: 'separator' },
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' }
            ]
        },
        {
            label: '&Window',
            role: 'window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        },
        {
            label: '&Help',
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click () { require('electron').shell.openExternal('https://httptoolkit.tech') }
                }
            ]
        }
    ];

    if (process.platform === 'darwin') {
        const macMenu: MenuItemConstructorOptions = {
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        };
        menuTemplate.unshift(macMenu);

        // Add to Edit menu
        (menuTemplate[1].submenu as MenuItemConstructorOptions[]).push(
            { type: 'separator' },
            {
                label: 'Speech',
                submenu: [
                    { role: 'startSpeaking' },
                    { role: 'stopSpeaking' }
                ]
            }
        );

        // Window menu
        menuTemplate[3].submenu = [
            { role: 'close' },
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' }
        ];
    } else {
        menuTemplate.unshift({
            label: '&File',
            submenu: [
                {
                    // This should close the Window, but look like Quit. End behaviour is that every
                    // Window _acts_ like a separate process, but is really a separate window.
                    // (This lets us easily share a single server instance)
                    role: 'close',
                    label: 'Quit',
                    accelerator: 'CommandOrControl+Q'
                }
            ]
        });

        // On Windows & Linux, it's possible to autohide the menu bar:
        (menuTemplate[2].submenu as MenuItemConstructorOptions[]).push({
            type: 'checkbox',
            label: 'Autohide Menu Bar',
            checked: shouldAutoHideMenu(),
            click: (event) => {
                const shouldAutoHide = event.checked || false;
                browserWindows.forEach((window) => {
                    window.setAutoHideMenuBar(shouldAutoHide);
                    window.setMenuBarVisibility(!shouldAutoHide);
                });
                store.set({ [AUTO_HIDE_SETTING_KEY]: shouldAutoHide });
            }
        })
    }

    return Menu.buildFromTemplate(menuTemplate);
}