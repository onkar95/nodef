export default ({condition, wrapper, children}) =>
  condition ? wrapper(children) : children;
