var designWidth = window.designWidth;
function setRootSize (width) {
  designWidth = width;
  width = designWidth || 375;
  var clientWidth = document.documentElement.clientWidth;
  if (clientWidth > 640) {
    clientWidth = 640
  } else {
    if (clientWidth < 320) {
      clientWidth = 320
    }
  }
  document.documentElement.style.fontSize = (clientWidth / width) * 100 + "px";
}
setRootSize();
window.addEventListener("resize", function(){
  setRootSize();
}, false);
window.designWidth = undefined;
