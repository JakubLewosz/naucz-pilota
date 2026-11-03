const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('piko',Object.freeze({getAiStatus:()=>ipcRenderer.invoke('piko:status'),startAiSession:()=>ipcRenderer.invoke('piko:session'),sendLearnerTurn:request=>ipcRenderer.invoke('piko:turn',request)}));
