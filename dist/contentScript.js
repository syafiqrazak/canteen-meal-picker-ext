const pageTitle=document.title,allParagraphs=Array.from(document.querySelectorAll("p")).map((e=>e.innerText));console.log(pageTitle),chrome.runtime.sendMessage({title:pageTitle,paragraphs:allParagraphs});