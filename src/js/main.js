// import "../scss/styles.scss";
// Import only the Bootstrap components we need
// import { Alert } from "./bootstrap.bundle.min";
// import './bootstrap.min.js';
import { Toast } from 'bootstrap';

console.log(process.env.API_HOST);
// const PROXY_BASE = 'https://proxy.im-victor.workers.dev';
// const BACKEND = 'https://toolkit.lte.ink:8000';
console.log("PROXY_BASE", process.env.PROXY_BASE);
const PROXY_BASE =
  process.env.PROXY_BASE || "https://proxy.im-victor.workers.dev";
const BACKEND = process.env.BACKEND || "https://toolkit.lte.ink:8000";
let corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

const XHRStatus = {
  UNSENT: 0, // 初始状态
  OPENED: 1, // open 被调用
  HEADERS_RECEIVED: 2, // 接收到 response header
  LOADING: 3, // 响应正在被加载（接收到一个数据包）
  DONE: 4, // 请求完成
};
// 平台dropdown 添加点击事件
// 获取下拉按钮和下拉菜单项
var dropdownButton = document.getElementById("platformButton");
var dropdownItems = document.querySelectorAll(".dropdown-item");

// 为每个下拉菜单项添加点击事件监听器
dropdownItems.forEach(function (item) {
  item.addEventListener("click", function () {
    // 更新按钮文字为当前点击的下拉菜单项的文字
    dropdownButton.textContent = this.textContent;
    // 如果你希望保留按钮的 'dropdown-toggle' 类的样式，可以添加以下代码
    dropdownButton.classList.add("dropdown-toggle");
    // 修改button文字
    dropdownButton.innerText = this.textContent;
  });
});

// GO按钮绑定点击事件
const goButton = document.getElementById("goButton");

goButton.addEventListener("click", function (event) {
  // 阻止表单默认提交行为
  event.preventDefault();
  // 获取按钮和内容div的DOM元素
  // const contentDiv = document.getElementById("contentDiv");
  const inputGroup = document.getElementById("searchGroup");
  const parseForm = document.getElementById("parseForm");
  const urlInput = document.getElementById("searchStr");
  const urlParsed = urlInput.value;
  if (!urlParsed) {
    // url必填
    parseForm.reportValidity();
  }
  // 发送请求的示例，这里需要替换为实际的请求逻辑
  const params = {
    url: document.getElementById("searchStr").value,
    minimal: true,
  };
  const query = new URLSearchParams(params).toString();
  const target = `${BACKEND}/hyperparse?${query}`;
  const url = new URL(PROXY_BASE)
  const proxyQuery = new URLSearchParams({
    target: target,
  })
  url.search = proxyQuery.toString();
  console.log("url: ", url);
  console.log("target: ", target);
  fetch(target, {
    method: "GET",
    headers: corsHeaders,
    mode: "cors",
  })
    .then(async (response) => {
      if (!response.ok) {
        const errResp = await response.json();
        console.log("first then errResp: ", errResp);
        throw new Error(JSON.stringify(errResp));
      }
      return response.json();
    })
    .then((data) => {
      console.log("second then: ", data);
      displayResults(data);
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    });
});

function displayResults(data) {
  // 显示结果容器
  let resultContainer = document.getElementById("resultContainer");
  // 移动搜索框到左侧（如果需要）
  let searchContainer = document.querySelector(".search-container");
  resultContainer.style.display = "flex";
  // 将视频播放信息添加到video-container
  let resultCardBody = document.getElementById("resultCardBody");

  // 将视频标题添加到card-header
  let resultCardHeader = document.getElementById("resultCardHeader");
  resultCardHeader.innerHTML = `<span>${data.desc}</span>`;

  let videoEle = document.createElement("video");
  videoEle.innerHTML = "";
  videoEle.setAttribute("width", "100%");
  videoEle.setAttribute("height", "400px");
  videoEle.setAttribute("controls", "controls"); // 这将添加默认的控件
  videoEle.setAttribute("id", "videoElement"); // 这将添加默认的控件

  // 为video标签添加视频源
  let sourceEle = document.createElement("source");
  sourceEle.setAttribute("src", data.nwm_video_url);
  sourceEle.setAttribute("type", "video/mp4");
  videoEle.appendChild(sourceEle);

  // 将video标签添加到card-body
  resultCardBody.innerHTML = ""; // 清空容器内容
  resultCardBody.appendChild(videoEle);

  // 添加下载按钮
  const buttonDiv = document.createElement("div");
  buttonDiv.setAttribute("class", "d-grid d-md-flex justify-content-md-end");
  const downloadButton = document.createElement("button");
  downloadButton.setAttribute(
    "class",
    "d-grid gap-2 d-md-flex btn btn-primary justify-content-md-end"
  );
  downloadButton.setAttribute("id", "downloadButton");
  downloadButton.innerHTML = "Download";
  buttonDiv.appendChild(downloadButton);
  resultCardBody.appendChild(buttonDiv);

  downloadButton.addEventListener("click", function () {
    // 假设您已经有了一个视频URL
    // const videoUrl = `https://proxy.im-victor.workers.dev/?url=${data.nwm_video_url_HQ}`;
    const videoUrl = `${PROXY_BASE}/?${new URLSearchParams({
      target: data.nwm_video_url_HQ,
    }).toString()}`;
    // 设置下载的文件名
    const filename = `Orcas-${data.nickname}-${data.aweme_id}`;
    console.log(`start to download file: ${videoUrl}, ${filename}`);
    // 调用下载方法
    downloadFile(videoUrl, filename);
  });

  // 将结果信息添加到info-container
  let infoContainer = document.querySelector(".info-container");
  let table = document.getElementById("result-info");
  const tableRowsMap = new Map([
    ["description", ""],
    ["video with watermark"],
    ["video without watermark"],
  ]);
}

function showDownloadSuccessToast() {
  let successTElement = document.getElementById("successToast");
  let successToast = new Toast(successTElement);
  // let successToastBody = document.getElementById("successToastBody");
  // successToastBody.innerHTML = "Download success.";
  successToast.show()
}

function showDownloadFailedToast() {
  let errorTElement = document.getElementById("failedToast");
  // errorTElement.innerText = `Download error.`;
  let errorToast = new Toast(errorTElement);
  errorToast.show()
}

// xhr下载状态监听的几个函数
function buttonTransferStartListener(button) {
  return function transferStart(event) {
    console.log("The transfer is start.");
    button.disabled = true;
    button.innerText = "Downloading...";
  }
}

function updateProgress(event) {
  if (event.lengthComputable) {
    const percentComplete = (event.loaded / event.total) * 100;
    console.log("progress: ", percentComplete);
  } else {
    // Unable to compute progress information since the total size is unknown
  }
}

function buttonTransferLoadendListener(button) {
  let originalValue = button.innerText;
  return function transferComplete(event) {
    console.log("The transfer is loadend.");
    button.disabled = false;
    button.innerText = originalValue;
  }
}

function buttonTransferErrorListener(button) {
  let originalValue = button.innerText;
  return function transferError(event) {
    console.log("The transfer is error.");
    button.disabled = false;
    button.innerText = originalValue;
    showDownloadFailedToast();
  }
}


function downloadFile(url, filename) {
  // 创建一个隐藏的<a>元素，用于模拟下载点击
  const anchorElement = document.createElement("a");
  anchorElement.style.display = "none";
  let xhr = new XMLHttpRequest();
  xhr.timeout = 10000 * 1000;
  let downloadButton = document.getElementById("downloadButton");
  // xhr.addEventListener("open", buttonTransferStartListener(downloadButton));
  xhr.addEventListener("progress", updateProgress);
  xhr.addEventListener("loaded", buttonTransferLoadendListener(downloadButton));
  xhr.addEventListener("error", buttonTransferErrorListener(downloadButton));
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XHRStatus.UNSENT) {
      // 请求未发送
      console.log("xhr UNSENT");
    }
    if (xhr.readyState == XHRStatus.OPENED) {
      // 请求已打开
      console.log("xhr OPENED");
      
      downloadButton.disabled = true;
      downloadButton.innerText = "Downloading...";
    }
    if (xhr.readyState == XHRStatus.HEADERS_RECEIVED) {
      // 请求头已接收
      console.log("xhr HEADERS_RECEIVED");
      console.log(`Content-Length: ${xhr.getResponseHeader('content-length')}`);
    }
    if (xhr.readyState == XHRStatus.LOADING) {
      // 加载中
      console.log("xhr LOADING");
    }
    if (xhr.readyState == XHRStatus.DONE) {
      // 请求完成
      console.log("xhr DONE");
      downloadButton.disabled = false;
      downloadButton.innerText = "Download";
    }
  };
  xhr.onload = function () {
    console.log("onload");
    if (xhr.status >= 400) {
      console.log("Download Failed");
      showDownloadFailedToast();
      return
    }
    let blob = xhr.response;
    const fileType = xhr.getResponseHeader('content-type').split("/")[1];
    anchorElement.href = URL.createObjectURL(blob);
    anchorElement.download = filename + fileType;
    document.body.appendChild(anchorElement);

    // 模拟点击<a>元素以启动下载
    anchorElement.click();

    // 清理DOM，移除<a>元素
    document.body.removeChild(anchorElement);

    // 释放blob URL
    URL.revokeObjectURL(anchorElement.href);
    showDownloadSuccessToast();
  }
  xhr.open("GET", url);
  console.log("OPENED", xhr.readyState);
  xhr.responseType = "blob";
  xhr.send();
}
