// saveAsFile.js

window.downloadFileFromUrl = (url, fileName) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
}; 