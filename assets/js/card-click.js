/* OneToolBox - whole tool card is clickable */
document.addEventListener('DOMContentLoaded', function () {
  const selectors = [
    '.category-card',
    '.tool-card',
    '[class$="-tool-card"]'
  ];

  document.querySelectorAll(selectors.join(',')).forEach(function(card){
    card.setAttribute('role','link');
    card.setAttribute('tabindex','0');

    function openCard(e){
      if (e.target.closest('a,button,input,select,textarea,label')) return;
      const link = card.querySelector('a[href]');
      if (link && link.getAttribute('href') && link.getAttribute('href') !== '#') {
        window.location.href = link.href;
      }
    }

    card.addEventListener('click', openCard);
    card.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCard(e);
      }
    });
  });
});
