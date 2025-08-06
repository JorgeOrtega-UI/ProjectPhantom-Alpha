import { initMainController } from './main-controller.js';
// INICIO DE LA MODIFICACIÓN
import { initDragController } from './drag-controller.js';
// FIN DE LA MODIFICACIÓN

document.addEventListener('DOMContentLoaded', () => {
    initMainController();
    // INICIO DE LA MODIFICACIÓN
    initDragController();
    // FIN DE LA MODIFICACIÓN
});