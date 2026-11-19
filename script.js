
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