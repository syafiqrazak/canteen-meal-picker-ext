// Extracting elements and data from the page using native DOM methods
const pageTitle = document.title;
const allParagraphs = Array.from(document.querySelectorAll('p')).map(p => p.innerText);
console.log(document)

// Send the data to the background script
chrome.runtime.sendMessage({ title: pageTitle, paragraphs: allParagraphs, html: document });
