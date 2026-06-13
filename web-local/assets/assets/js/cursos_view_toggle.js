// cursos_view_toggle.js
// Toggle de modo de selección entre:
// - cursos_etiquetas.html (Botones / nube)
// - cursos_graph.html (Gráfica / burbujas)
//
// Requisito: cada cambio resetea el filtrado -> navegación limpia a la otra página.
// Extra: transición visual (overlay) para dar un toque premium.

(function(){
  const btnButtons = document.getElementById('viewBtnButtons');
  const btnGraph = document.getElementById('viewBtnGraph');
  if(!btnButtons || !btnGraph) return;

  const here = (location.pathname.split('/').pop() || '').toLowerCase();
  const isGraph = here.includes('cursos_graph');

  // Sincroniza estado visual (por si el HTML se reutiliza)
  function setState(graph){
    btnButtons.classList.toggle('is-on', !graph);
    btnButtons.setAttribute('aria-pressed', String(!graph));
    btnGraph.classList.toggle('is-on', graph);
    btnGraph.setAttribute('aria-pressed', String(graph));
  }
  setState(isGraph);

  // Overlay FX
  function ensureFx(){
    let fx = document.querySelector('.viewSwitchFx');
    if(fx) return fx;
    fx = document.createElement('div');
    fx.className = 'viewSwitchFx';
    fx.innerHTML = '<div class="veil" aria-hidden="true"></div><div class="scan" aria-hidden="true"></div>';
    document.body.appendChild(fx);
    return fx;
  }

  function go(url){
    const fx = ensureFx();
    // Reinicia la animación scan cada vez
    const scan = fx.querySelector('.scan');
    if(scan){
      scan.style.animation = 'none';
      // force reflow
      void scan.offsetWidth;
      scan.style.animation = '';
    }

    fx.classList.add('is-on');

    // Pequeña pausa para que se vea el “wipe” antes de cambiar
    setTimeout(()=>{
      // Navegación limpia => reset automático
      window.location.href = url;
    }, 220);
  }

  btnButtons.addEventListener('click', ()=>{
    if(!isGraph) return; // ya estamos en botones
    setState(false);
    go('cursos_etiquetas.html');
  });

  btnGraph.addEventListener('click', ()=>{
    if(isGraph) return; // ya estamos en gráfico
    setState(true);
    go('cursos_graph.html');
  });
})();
