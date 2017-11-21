let root = document.querySelector('.area');
let options = { selectable: '.card' };
let area = new selekter.Area(root, options, [...selekter.defaultSelectors, new selekter.MouseSelector({
  tick: 'button'
})]);