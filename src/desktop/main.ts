require('dotenv').config()
import { app, BrowserWindow } from "electron";
//import * as path from "path";
//import * as url from "url";

const isDev = true
const WWW_INDEX_HTML = 'www/index.html'


let mainWindow: Electron.BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      webSecurity: false
    },
    height: 600,
    width: 800
  });

mainWindow.loadFile(WWW_INDEX_HTML)

  mainWindow.webContents.openDevTools();


  if (isDev) {
    const {default: installExtension,REDUX_DEVTOOLS} = require("electron-devtools-installer");
    installExtension(REDUX_DEVTOOLS);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}


app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});


/*
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:1234");
  } else {
    mainWindow.loadURL("file:///" + path.join(__dirname, "www/index.html"));
  }
*/
/*
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, '..', 'app', "index.html"),
      protocol: "file:",
      slashes: true
    })
  );
*/