export function initDragController() {
    const moduleOptions = document.querySelector('[data-module="moduleOptions"]');
    if (!moduleOptions) {
        console.error("El módulo de opciones no fue encontrado para el controlador de arrastre.");
        return;
    }

    // Seleccionamos TODOS los drag handles
    const dragHandles = moduleOptions.querySelectorAll('.drag-handle');
    let menuContent; // El menú activo que se está arrastrando

    if (!dragHandles.length) {
        console.error("No se encontraron manejadores de arrastre (drag handles).");
        return;
    }

    let isDragging = false;
    let startY;

    const startDrag = (e) => {
        if (window.innerWidth > 468 || moduleOptions.classList.contains('disabled')) return;
        
        // Obtenemos el menú activo en el momento del arrastre
        menuContent = moduleOptions.querySelector('.menu-content.active');
        if (!menuContent) return;

        isDragging = true;
        startY = e.pageY || e.touches[0].pageY;
        // La animación se controla manualmente, quitamos la transición de CSS
        menuContent.style.transition = 'none';
        
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
        
        // Solo permitir arrastrar hacia abajo
        deltaY = Math.max(0, deltaY); 

        // Aplicamos el estilo en línea para mover el menú
        menuContent.style.transform = `translateY(${deltaY}px)`;
    };

    const endDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;

        const currentY = e.pageY || e.changedTouches[0].pageY;
        const deltaY = Math.max(0, currentY - startY);
        const menuHeight = menuContent.offsetHeight;
        const dragPercentage = (deltaY / menuHeight) * 100;
        
        // Restauramos la transición de CSS para la animación final
        menuContent.style.transition = 'transform 0.3s ease-out';
        
        if (dragPercentage > 40) {
            // El menú debe cerrarse. Lo animamos hacia abajo.
            menuContent.style.transform = 'translateY(100%)';
            
            // Cuando la transición termine, le pedimos al main-controller que limpie todo.
            menuContent.addEventListener('transitionend', () => {
                document.dispatchEvent(new CustomEvent('closeModuleRequest'));
            }, { once: true });

        } else {
            // El menú debe volver a su sitio (snap-back).
            menuContent.style.transform = 'translateY(0px)';

            // Cuando vuelva a su sitio, limpiamos los estilos en línea para no interferir después.
            menuContent.addEventListener('transitionend', () => {
                menuContent.removeAttribute('style');
            }, { once: true });
        }

        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);
    };
    
    // Aplicamos la lógica a TODOS los drag handles
    dragHandles.forEach(handle => {
        handle.addEventListener('mousedown', startDrag);
        handle.addEventListener('touchstart', startDrag, { passive: false });
    });
}