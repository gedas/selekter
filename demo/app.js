(function () {

  function createCard() {
    var div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML =
      '<div class="card-content">' +
      '  <button class="selekter-tick"></button>' +
      '</div>';
    return div;
  }

  var root = document.querySelector('.area');
  var rootContainer = root.querySelector('.area-container');

  for (var i = 0; i < 9; ++i) {
    rootContainer.appendChild(createCard());
  }

  new selekter.Area(root, { selectable: '.card' });

})();