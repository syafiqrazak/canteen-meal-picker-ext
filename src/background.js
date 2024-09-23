chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received data from content script:", message);
    // You can send the data to the popup or handle it here
    sendResponse({ status: 'Data received' });
  });
  
  chrome.runtime.onInstalled.addListener(() => {
    console.log("Background script running");
  });