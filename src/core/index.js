import {
  historyInterceptor,
  isAPIPage,
  insertDOM,
  insertStyle,
} from './utils'
import CustomXhr from './interceptor';


const xhr = new CustomXhr();
xhr.unset();
let lastIsAPIPage = false;
init();


function onURLChg() {
  const currentIsAPIPage = isAPIPage();
  if (currentIsAPIPage && !lastIsAPIPage) {
    xhr.reset();
    lastIsAPIPage = currentIsAPIPage;
    window.requestAnimationFrame(onURLChg);
    return;
  }
  if (lastIsAPIPage && !currentIsAPIPage) {
    xhr.unset();
  }
  lastIsAPIPage = currentIsAPIPage;

  if (currentIsAPIPage) {
    insertStyle();
    const firstDom = document.querySelector('.interface-title');
    if (firstDom && firstDom.innerHTML === '基本信息') {
      insertDOM();
      return;
    }
    window.requestAnimationFrame(onURLChg);
    return;
  }
}

function init() {
  onURLChg(this);
  historyInterceptor();
  window.addEventListener('pushstate', onURLChg);
  window.addEventListener('replacestate', onURLChg);
  window.addEventListener('popstate', onURLChg);
}