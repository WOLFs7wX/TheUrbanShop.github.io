let items = document.querySelectorAll('.slider .list .item');
let next = document.getElementById('next');
let prev = document.getElementById('prev');
let thumbnails = document.querySelectorAll('.thumbnail .item');

// config param
let countItem = items.length;
let itemActive = 0;
// event next click
next.onclick = function(){
    itemActive = itemActive + 1;
    if(itemActive >= countItem){
        itemActive = 0;
    }
    showSlider();
}
//event prev click
prev.onclick = function(){
    itemActive = itemActive - 1;
    if(itemActive < 0){
        itemActive = countItem - 1;
    }
    showSlider();
}
// auto run slider
let refreshInterval = setInterval(() => {
    next.click();
}, 5000)
function showSlider(){
    // remove item active old
    let itemActiveOld = document.querySelector('.slider .list .item.active');
    let thumbnailActiveOld = document.querySelector('.thumbnail .item.active');
    itemActiveOld.classList.remove('active');
    thumbnailActiveOld.classList.remove('active');

    // active new item
    items[itemActive].classList.add('active');
    thumbnails[itemActive].classList.add('active');
    setPositionThumbnail();

    // clear auto time run slider
    clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
        next.click();
    }, 5000)
}
function setPositionThumbnail () {
    let thumbnailActive = document.querySelector('.thumbnail .item.active');
    let rect = thumbnailActive.getBoundingClientRect();
    if (rect.left < 0 || rect.right > window.innerWidth) {
        thumbnailActive.scrollIntoView({ behavior: 'smooth', inline: 'nearest' });
    }
}

    // click thumbnail
    thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', () => {
        itemActive = index;
        showSlider();
    })
})
document.querySelectorAll('.product-card').forEach(card => {

card.addEventListener('mousemove',(e)=>{

const rect = card.getBoundingClientRect();

const x = e.clientX - rect.left;
const y = e.clientY - rect.top;

   const rotateY = (x / rect.width - .5) * 15;
   const rotateX = -(y / rect.height - .5) * 15;

card.style.transform =
`perspective(1000px)
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)`;

});

card.addEventListener('mouseleave',()=>{
card.style.transform =
'perspective(1000px) rotateX(0) rotateY(0)';
});
});

//input
(function terminalBuscador(){
  const frases = [
    "Buscar audífonos...",
    "Buscar tecnología...",
    "Buscar belleza...",
    "Buscar para el hogar..."
  ];
  const textoEl = document.getElementById('search-terminal-text');
  const overlay = document.getElementById('search-terminal');
  const input = document.getElementById('search-input');
  if(!textoEl || !overlay || !input) return;

  let f = 0, c = 0, borrando = false;

  function tick(){
    const actual = frases[f];
    if(!borrando){
      textoEl.textContent = actual.slice(0, c + 1);
      c++;
      if(c === actual.length){
        borrando = true;
        setTimeout(tick, 1400);
        return;
      }
    } else {
      textoEl.textContent = actual.slice(0, c - 1);
      c--;
      if(c === 0){
        borrando = false;
        f = (f + 1) % frases.length;
      }
    }
    setTimeout(tick, borrando ? 35 : 70);
  }
  tick();

  function actualizarOverlay(){
    overlay.style.opacity = (document.activeElement === input || input.value.length) ? '0' : '1';
  }
  input.addEventListener('focus', actualizarOverlay);
  input.addEventListener('blur', actualizarOverlay);
  input.addEventListener('input', actualizarOverlay);
})();g
(function pulsoAlEscribir(){
    const input = document.getElementById('search-input');
    const barra = document.getElementById('search-pulse-bar');
    if(!input || !barra) return;
    let timeout;

    input.addEventListener('input', () => {
        barra.classList.add('activo');
        clearTimeout(timeout);
        timeout = setTimeout(() => barra.classList.remove('activo'), 900);
    });
})();