
const header= document.querySelector('header');
window.addEventListener('scroll', funscroll); /* metto l'evento a window perche deve funzionare quando l'utente scrolla la finestra */

function funscroll(){
    if(window.scrollY > 20){
        header.classList.add('scrolled'); /* con classList.add aggiungo una nuova classe che poi posso richiamare su ccs*/
    }else{
        header.classList.remove('scrolled'); 
    }
}


const menu = document.querySelector('.nav-btn'); /* dovrei mettere button ma metto direttamente la classe del bottone per evitare che ci siano altri bottoni e si possa confondere */
const modal = document.querySelector('.menu-modal');
menu.addEventListener('click',()=>{
    modal.showModal();    
});

modal.addEventListener('click', (e)=>{
    /* if(e.target===modal || e.target.tagName==='A'){
        modal.close();
    } */
   // ho scritto matches che sarebbe la stessa cosa di quello sopra 
   if(e.target.matches('.menu-modal , a')){
        modal.close();
   }
});

document.getElementById('documentation').addEventListener('click',(e)=>{
    // 1. Verifica se hai cliccato su uno dei bottoni (o su un'icona al suo interno)
    const btn = e.target.closest('.document-btn');
    if (!btn) return;

    // 2. Risali al contenitore della singola coppia (.dropdown-item)
    const item = btn.closest('.document-item');

    // 3. Trova la tendina appartenente SOLO a quel bottone
    const content = item.querySelector('.document-list');

    // 4. Apri/chiudi solo quella tendina
    content.classList.toggle('active');
});



document.addEventListener("DOMContentLoaded", () => {
    const waFloating = document.querySelector(".wa-link");
    const waTarget = document.getElementById("wa-footer-target");

    if (!waFloating || !waTarget) return;

    function handleWaScroll() {
        // Ottieni le coordinate attuali rispetto alla finestra (viewport)
        const targetRect = waTarget.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Punto di attivazione: quando l'icona bianca entra nello schermo
        // (es. 40px sopra il bordo inferiore)
        const triggerPoint = windowHeight + 20;

        if (targetRect.top <= triggerPoint) {
            // Posizione originale dell'icona nera (definita dal CSS: bottom 10px, right 20px)
            const initialLeft = window.innerWidth - 20 - waFloating.offsetWidth;
            const initialTop = windowHeight - 10 - waFloating.offsetHeight;

            // Calcola lo spostamento esatto (delta) per sovrapporla all'icona bianca
            const deltaX = targetRect.left - initialLeft;
            const deltaY = targetRect.top - initialTop;

            // Applica la traslazione e attiva la dissolvenza
            waFloating.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            waFloating.classList.add("landed");
        } else {
            // Torna alla posizione fissa originale se si risale la pagina
            waFloating.style.transform = "translate(0px, 0px)";
            waFloating.classList.remove("landed");
        }
    }

    // Ascolta sia lo scroll sia il ridimensionamento della finestra
    window.addEventListener("scroll", handleWaScroll, { passive: true });
    window.addEventListener("resize", handleWaScroll);
    
    // Controllo iniziale al caricamento
    handleWaScroll();
});