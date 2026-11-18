const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('piko',Object.freeze({
 getAiStatus:()=>ipcRenderer.invoke('piko:status'),
 setAccessCode:code=>ipcRenderer.invoke('piko:access-code',code),
 startAiSession:()=>ipcRenderer.invoke('piko:session'),
 sendLearnerTurn:request=>ipcRenderer.invoke('piko:turn',request),
 clearConversation:sceneId=>ipcRenderer.invoke('piko:clear-chat',sceneId)
}));
