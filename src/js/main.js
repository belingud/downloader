// import "../scss/styles.scss";
// Import only the Bootstrap components we need
// import { Alert } from "./bootstrap.bundle.min";
// import './bootstrap.min.js';
import { Toast } from "bootstrap";
import streamSaver from "streamsaver";

console.log(process.env.BACKEND);
console.log("PROXY_BASE", process.env.PROXY_BASE);
const PROXY_BASE = process.env.PROXY_BASE;
const BACKEND = process.env.BACKEND;
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

function setButtonLoading(button, isLoading) {
    if (!button) {
        return;
    }
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading...
      `;
    } else {
        button.disabled = false;
        button.innerHTML = "Download";
    }
}

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
        return;
    }
    // 发送请求的示例，这里需要替换为实际的请求逻辑
    const params = {
        url: document.getElementById("searchStr").value,
        minimal: true,
    };
    const query = new URLSearchParams(params).toString();
    const target = `${BACKEND}/hyperparse?${query}`;
    const url = new URL(PROXY_BASE);
    const proxyQuery = new URLSearchParams({
        target: target,
    });
    url.search = proxyQuery.toString();
    console.log("url: ", url);
    console.log("target: ", target);
    const goButton = document.getElementById("goButton");
    setButtonLoading(goButton, true);

    fetch(target, {
        method: "GET",
        headers: corsHeaders,
        mode: "cors",
    })
        .then(async (response) => {
            if (!response.ok) {
                const errResp = await response.text();
                console.log("first then errResp: ", errResp);
                setButtonLoading(false);
                throw new Error(errResp);
            }
            setButtonLoading(goButton, false);
            return response.json();
        })
        .then((data) => {
            console.log("second then: ", data);
            displayResults(data);
            setButtonLoading(goButton, false);
        })
        .catch((error) => {
            console.error(
                "There has been a problem with your fetch operation:",
                error
            );
            setButtonLoading(goButton, false);
        });
});

/**
 * 根据查询的响应展示返回的结果
 * @param {object} data
 */
function displayResults(data) {
    // 显示结果容器
    let resultContainer = document.getElementById("resultContainer");
    // 移动搜索框到左侧（如果需要）
    let searchContainer = document.querySelector(".search-container");
    resultContainer.style.display = "flex";

    // 将视频标题添加到card-header
    let resultCardHeader = document.getElementById("resultCardHeader");
    resultCardHeader.innerHTML = `<span>${data.desc}</span>`;
    let resultCardBody = document.getElementById("resultCardBody");
    resultCardBody.innerHTML = "";
    let videos = [];
    let imgs = [];
    if (data.type == "video") {
        for (let url of (data.nwm_video_url_HQ_list || [])) {
            videos.push({ type: "video", url: url });
        }
    } else if (data.type == "image") {
        for (let url of (data.no_watermark_image_list || [])) {
            imgs.push({ type: "image", url: url });
        }
    } else if (data.type == "hybrid") {
        for (let url of (data.nwm_video_url_HQ_list || [])) {
            videos.push({ type: "video", url: url });
        }
        for (let url of (data.no_watermark_image_list || [])) {
            imgs.push({ type: "image", url: url });
        }
    }
    for (let i = 0; i < videos.length; i++) {
        if (videos[i].type == "video") {
            displatViedeoResult(videos[i], i);
        }
    }
    displayImageResult(imgs);
}

/**
 * 展示类型是视频的结果
 * @param {object} data
 */
function displatViedeoResult(data, index = 0) {
    // 将视频播放信息添加到video-container
    let resultCardBody = document.getElementById("resultCardBody");

    let videoEle = document.createElement("video");
    videoEle.innerHTML = "";
    videoEle.setAttribute("width", "100%");
    videoEle.setAttribute("height", "400px");
    // videoEle.setAttribute("crossorigin", "anonymous");
    videoEle.setAttribute("controls", "controls"); // 这将添加默认的控件
    // videoEle.setAttribute("id", "videoElement");

    // 为video标签添加视频源
    let sourceEle = document.createElement("source");
    sourceEle.setAttribute("src", data.url);
    sourceEle.setAttribute("type", "video/mp4");
    videoEle.appendChild(sourceEle);

    // 将video标签添加到card-body
    // resultCardBody.innerHTML = ""; // 清空容器内容
    resultCardBody.appendChild(videoEle);

    // 添加下载按钮
    const buttonDiv = document.createElement("div");
    buttonDiv.setAttribute(
        "class",
        "d-grid d-md-flex justify-content-md-end mt-3"
    );
    const downloadButton = document.createElement("button");
    downloadButton.setAttribute(
        "class",
        "d-grid gap-2 d-md-flex btn btn-primary justify-content-md-end"
    );
    // downloadButton.setAttribute("id", `downloadButton${index}`);
    downloadButton.innerHTML = "Download";
    buttonDiv.appendChild(downloadButton);
    resultCardBody.appendChild(buttonDiv);
    downloadButton.addEventListener("click", function () {
        const query = new URLSearchParams({
            target: data.url,
        }).toString();
        const videoUrl = `${PROXY_BASE}/?${query}`;
        const filenameWithSuffix = `Orcas-${data.nickname}-${data.aweme_id}-${index}`;
        // 发起请求获取大文件流
        downloadByStream(videoUrl, filenameWithSuffix, downloadButton);
    });

    // downloadButton.addEventListener("click", function () {
    //   // 假设您已经有了一个视频URL
    //   // const videoUrl = `https://proxy.im-victor.workers.dev/?url=${data.nwm_video_url_HQ}`;
    //   const query = new URLSearchParams({
    //     target: data.nwm_video_url_HQ
    //   }).toString();
    //   const videoUrl = `${PROXY_BASE}/?${query}`;
    //   // 设置下载的文件名
    //   const filename = `Orcas-${data.nickname}-${data.aweme_id}`;
    //   console.log(`start to download file: ${videoUrl}, ${filename}`);
    //   // 调用下载方法
    //   downloadFile(videoUrl, filename);
    // });
}

let activeDownloads = 0;
function downloadByStream(url, filenameWithSuffix, button) {
    setButtonLoading(button, true);
    fetch(url).then((response) => {
        if (!response.ok) {
            setButtonLoading(downloadButton, false);
            throw new Error("Network response was not ok");
        }
        activeDownloads++;
        try {
            const suffix = response.headers
                .get("content-type")
                .split("/")
                .pop();
            const filename = `${filenameWithSuffix}.${suffix}`;
            const fileStream = streamSaver.createWriteStream(filename);
            const readableStream = response.body;

            // 通过管道连接可读流和可写流
            if (window.WritableStream && readableStream.pipeTo) {
                console.log("Using WritableStream API");
                return readableStream
                    .pipeTo(fileStream)
                    .then(
                        () => {
                            activeDownloads--;
                            console.log("Downloaded", filename);
                            setButtonLoading(button, false);
                        },
                        (err) => {
                            console.error("Download error:", err);
                            activeDownloads--;
                            setButtonLoading(button, false);
                        }
                    )
                    .catch((err) => {
                        console.error("Download error:", err);
                        activeDownloads--;
                        setButtonLoading(button, false);
                    });
            }
            const writer = fileStream.getWriter();
            const reader = readableStream.getReader();
            const pump = () => {
                try {
                    reader
                        .read()
                        .then(({ done, value }) => {
                            console.log("Read operation done:", done);

                            if (done) {
                                console.log("Stream complete");
                                writer.close();
                                activeDownloads--;
                            } else {
                                writer.write(value).then(pump);
                            }
                        })
                        .catch((err) => {
                            console.error("Pump error:", err);
                            writer.abort(err);
                            activeDownloads--;
                        });
                } catch (err) {
                    console.error("Pump error:", err);
                    writer.abort(err);
                    activeDownloads--;
                }
            };
            pump();
            setButtonLoading(button, false);
        } catch (err) {
            console.error("Download error:", err);
            activeDownloads--;
            setButtonLoading(button, false);
        }
    });
}

/**
 * 展示类型是图片的结果
 * @param {object} imageList no_watermark_image_list
 */
function displayImageResult(imageList) {
    console.log(imageList);
    if (!imageList) return;
    let resultCardBody = document.getElementById("resultCardBody");
    // resultCardBody.innerHTML = ""; // 清空容器内容
    resultCardBody.classList.add("d-flex", "align-items-center", "m-3");
    for (let i = 0; i < imageList.length; i++) {
        // div包裹img
        let imageDiv = document.createElement("div");
        imageDiv.classList.add("col-md-12", "col-lg-6", "px-2", "mb-3");
        const imageEle = document.createElement("img");
        imageEle.setAttribute("src", imageList[i].url);
        imageEle.setAttribute("width", "100%");
        imageDiv.appendChild(imageEle);
        // card body包裹多个img的div
        resultCardBody.appendChild(imageDiv);
    }
}

function showDownloadSuccessToast() {
    let successTElement = document.getElementById("successToast");
    let successToast = new Toast(successTElement);
    // let successToastBody = document.getElementById("successToastBody");
    // successToastBody.innerHTML = "Download success.";
    successToast.show();
}

function showDownloadFailedToast() {
    let errorTElement = document.getElementById("failedToast");
    // errorTElement.innerText = `Download error.`;
    let errorToast = new Toast(errorTElement);
    errorToast.show();
}

// xhr下载状态监听的几个函数
function buttonTransferStartListener(button) {
    return function transferStart(event) {
        console.log("The transfer is start.");
        button.disabled = true;
        button.innerText = "Downloading...";
    };
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
    };
}

function buttonTransferErrorListener(button) {
    let originalValue = button.innerText;
    return function transferError(event) {
        console.log("The transfer is error.");
        button.disabled = false;
        button.innerText = originalValue;
        showDownloadFailedToast();
    };
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
    xhr.addEventListener(
        "loaded",
        buttonTransferLoadendListener(downloadButton)
    );
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
            console.log(
                `Content-Length: ${xhr.getResponseHeader("content-length")}`
            );
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
            return;
        }
        let blob = xhr.response;
        const fileType = xhr.getResponseHeader("content-type").split("/")[1];
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
    };
    xhr.open("GET", url);
    console.log("OPENED", xhr.readyState);
    xhr.responseType = "blob";
    xhr.send();
}

const appendAlert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<div class="alert alert-${type} d-flex align-items-center alert-float" role="alert" id="leaveAlert">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Danger:">
      <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
    </svg>
    <div>
      ${message}
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
    document.body.appendChild(wrapper);
};

window.addEventListener("beforeunload", (event) => {
    const message =
        "You have unfinished downloads. Are you sure you want to leave?";
    console.log(`in beforeunload action, activeDownloads: ${activeDownloads}`);
    // log2localStorage(`in beforeunload action, activeDownloads: ${activeDownloads}、`)
    if (activeDownloads > 0) {
        event.preventDefault();
        event.returnValue = message;
        appendAlert(message, "danger");
        // const leaveAlertEle = document.getElementById("leaveAlert");
        // const leaveAlert = new Alert.getOrCreateInstance(leaveAlertEle);
        // console.log(leaveAlert);
        // leaveAlertEle.style.display = "flex";
        // if (leaveAlertEle) {
        // }
        return message;
    }
});

function log2localStorage(message) {
    const logKey = "runtimeLogs";

    // 构造日志内容
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;

    // 从 localStorage 中获取已有的日志数据（如果有）
    let existingLogs = localStorage.getItem(logKey);
    existingLogs = existingLogs ? existingLogs + logMessage : logMessage;

    // 将新的日志数据保存到 localStorage 中
    localStorage.setItem(logKey, existingLogs);
}
