// 注入interceptor.js到页面
var file = chrome.runtime.getURL('js/interceptor.js')
var s = document.createElement('script')
s.type = 'text/javascript'
s.src = file
document.documentElement.appendChild(s);