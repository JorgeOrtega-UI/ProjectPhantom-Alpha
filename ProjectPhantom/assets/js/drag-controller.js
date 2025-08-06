export function initDragController() {
    const moduleOptions = document.querySelector('[data-module="moduleOptions"]');
    if (!moduleOptions) {
        console.error("El módulo de opciones no fue encontrado para el controlador de arrastre.");
        return;
    }

    const dragHandle = moduleOptions.querySelector('.drag-handle');
    let menuContent; // Se asignará dinámicamente al menú activo

    if (!dragHandle) {
        console.error("El manejador de arrastre (drag handle) no fue encontrado.");
        return;
    }

    let isDragging = false;
    let startY;

    const startDrag = (e) => {
        if (window.innerWidth > 468 || moduleOptions.classList.contains('disabled')) return;
        
        menuContent = moduleOptions.querySelector('.menu-content.active');
        if (!menuContent) return;

        isDragging = true;
        startY = e.pageY || e.touches[0].pageY;
        
        e.preventDefault(); 

        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    };

    const drag = (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const currentY = e.pageY || e.touches[0].pageY;
        let deltaY = currentY - startY;
        
        deltaY = Math.max(0, deltaY); 

        menuContent.style.transform = `translateY(${deltaY}px)`;
        menuContent.style.transition = 'none';
    };

    const endDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;

        const currentY = e.pageY || e.changedTouches[0].pageY;
        const deltaY = Math.max(0, currentY - startY);
        const menuHeight = menuContent.offsetHeight;
        const dragPercentage = (deltaY / menuHeight) * 100;
        
        menuContent.style.transition = 'transform 0.3s ease-out';
        
        if (dragPercentage > 40) {
            // El menú debe cerrarse.
            
            // 1. Definimos una función que se ejecutará CUANDO la animación TERMINE.
            const onSlideOutEnd = () => {
                // 3. Ahora que la animación terminó, le pedimos al main-controller que oculte todo.
                document.dispatchEvent(new CustomEvent('closeModuleRequest'));
                
                // 4. Limpiamos nuestros propios rastros.
                menuContent.removeEventListener('transitionend', onSlideOutEnd);
            };
            
            // 2. Añadimos el listener y comenzamos la animación de salida.
            menuContent.addEventListener('transitionend', onSlideOutEnd, { once: true });
            menuContent.style.transform = 'translateY(100%)';

        } else {
            // El menú debe volver a su sitio.
            const onSnapBackEnd = () => {
                menuContent.removeAttribute('style'); // Limpiamos el estilo al terminar.
                menuContent.removeEventListener('transitionend', onSnapBackEnd);
            };
            menuContent.addEventListener('transitionend', onSnapBackEnd, { once: true });
            menuContent.style.transform = 'translateY(0px)';
        }

        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);
    };

    dragHandle.addEventListener('mousedown', startDrag);
    dragHandle.addEventListener('touchstart', startDrag, { passive: false });
}