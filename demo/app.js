(function () {

  function createCard() {
    var div = document.createElement('div');
    div.className = 'selekter-selectable';
    div.innerHTML = '<button class="selekter-tick"></button>';
    return div;
  }

  var cards = document.createDocumentFragment();
  for (var i = 0; i < 6; ++i) {
    cards.appendChild(createCard());
  }

  var root = document.querySelector('.area');
  root.appendChild(cards);
  
  new selekter.Area(root);

})();