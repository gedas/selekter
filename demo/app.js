(function () {

  function createCard() {
    var div = document.createElement('div');
    div.classList.add('selekter-selectable');
    div.innerHTML = '<button class="selekter-tick"></button>';
    return div;
  }

  var root = document.querySelector('.area');

  for (var i = 0; i < 9; ++i) {
    root.appendChild(createCard());
  }

  new selekter.Area(root, {}, [
    ...selekter.defaultSelectors,
    new selekter.RectSelector({ appendTo: root })
  ]);

})();