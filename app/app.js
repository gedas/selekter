let root = document.querySelector('.area');
let options = { selectable: '.card' };
let area = new selekter.Area(root, options, [...selekter.defaultSelectors, new selekter.MouseSelector({
  tick: 'button'
})]);

root.addEventListener('selection', function (event) {
  event.target.classList.toggle('selected', event.detail.selected);
});