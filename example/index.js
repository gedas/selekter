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

  var element = document.body; //document.querySelector('.area');
  element.appendChild(cards);
  
  new selekter.Area({ element });

})();