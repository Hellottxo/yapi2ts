export function historyInterceptor() {
  const rewriteHistory = function (type) {
    const orig = history[type];
    return function () {
      const rv = orig.apply(this, arguments);
      const e = new Event(type.toLowerCase());
      e.arguments = arguments;
      window.dispatchEvent(e);
      return rv;
    };
  };
  history.pushState = rewriteHistory('pushState');
  history.replaceState = rewriteHistory('replaceState');
}

export function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    // 没有则使用execCommand
    var textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.style.position = 'fixed';
    textarea.style.clip = 'rect(0 0 0 0)';
    textarea.style.top = '10px';
    textarea.value = text;
    textarea.select();
    document.execCommand('copy', true);
    document.body.removeChild(textarea);
  }
}

export function sendMessage(msg) {
  const dom = document.createElement('div');
  dom.innerHTML = msg;
  dom.className = 'yapi2ts-msg';
  document.body.appendChild(dom);
  setTimeout(() => {
    document.body.removeChild(dom)
  }, 1200);
}

export function isAPIPage() {
  const APIREG = /\/project\/\d*\/interface\/api\/\d*/g;
  return APIREG.test(location.pathname);
}

function getText(key) {
  let text = '';
  if (['yapi2ts-res', 'yapi2ts-req'].includes(key) && sessionStorage[key]) {
    // ts类型
    text = JSON.parse(sessionStorage[key]);
    const iscamel = true || localStorage.getItem('yapi2ts-camel');
    if (iscamel && JSON.parse(iscamel)) {
      text = toCamel(text);
    }
  }

  if (key === 'yapi2ts-api') {
    // api文档
    const nodeList = document.querySelectorAll('span.colValue');
    text = `
      {
        url: '${nodeList[1].innerHTML}',
        method: '${nodeList[0].innerHTML}'
      }
    `;
  };
  return text;
}

function createDom(parentDom, key, str) {
  const dom = document.createElement('div');
  dom.innerHTML = `一键获取${str}`;
  dom.className = 'yapi2ts-btn';

  dom.onclick = () => {
    const text = getText(key);
    if (!text) {
      sendMessage('暂无数据或数据无法解析！');
      return;
    }

    copyText(text);
    sendMessage(`${str}已复制至剪切板，粘贴即可使用`);
    console.log(
      `%c yapi2ts %c ${str}已复制至剪切板 %c`,
      'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
      'background:#e91e63 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
      'background:transparent'
    )
  };

  parentDom.appendChild(dom);
}

export function insertDOM() {
  if (document.querySelector('.yapi2ts-api')) return;
  const map = {
    '返回数据': {
      key: 'res',
      note: '返回数据ts类型'
    },
    '基本信息': {
      key: 'api',
      note: '接口代码'
    },
    '请求参数': {
      key: 'req',
      note: '请求参数ts类型'
    },
  };
  (document.querySelectorAll('.interface-title') || []).forEach((e) => {
    if (map[e.innerHTML]) {
      createDom(e, `yapi2ts-${map[e.innerHTML].key}`, map[e.innerHTML].note);
    }
  });
}

export function insertStyle() {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerText = `
    .interface-title {
      display: flex;
      align-items: center;
    }
    .yapi2ts-btn:hover {
      box-shadow: rgb(33 150 241 / 58%) 3px 4px 0px !important;
    }
    .yapi2ts-btn {
      margin-left: 10px;
      font-size: 14px;
      border: 1px solid #2196f1;
      padding: 2px 10px;
      cursor: pointer;
      box-shadow: 3px 4px 0px #2196f1;
      color: #2196f1;
    }
    .yapi2ts-msg {
      position: fixed;
      top: 50px;
      left: 50%;
      padding: 5px 20px;
      border: 1px solid rgb(33, 150, 241);
      box-shadow: rgb(33 150 241) 3px 4px 0px;
      color: rgb(33, 150, 241);
      transition: all 0.3s;
      background: white;
    }
  `
  document.head.appendChild(style);
}

export function toCamel(name) {
  return name.replace(/\_(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
}