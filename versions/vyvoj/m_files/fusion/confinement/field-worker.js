/* Standalone worker entry; the app also supports a self-contained Blob for file://. */
importScripts('model.js');
ConfinementModel.installBendWorker(self);
