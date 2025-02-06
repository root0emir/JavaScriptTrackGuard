// Tracker Blocker Author root0emir
(function() {
  // list 
    const trackerList = [
        "google-analytics.com",
        "doubleclick.net",
        "ads.yahoo.com",
        "adservice.google.com"
    ];
    
   
    function isTracker(url) {
        return trackerList.some(tracker => url.includes(tracker));
    }

    // override fetch api
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        if (isTracker(args[0])) {
            console.warn("Blocked tracker:", args[0]);
            logBlockedTracker(args[0]);
            return Promise.reject("Blocked tracker");
        }
        return originalFetch.apply(this, args);
    };

  
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        if (isTracker(url)) {
            console.warn("Blocked tracker:", url);
            logBlockedTracker(url);
            return;
        }
        return originalXHROpen.apply(this, [method, url, ...args]);
    };

   
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME' || node.tagName === 'IMG') {
                    if (isTracker(node.src)) {
                        console.warn("Blocked tracker:", node.src);
                        logBlockedTracker(node.src);
                        node.remove();
                    }
                }
            });
        });
    });
    observer.observe(document, { childList: true, subtree: true });

  
    const uiContainer = document.createElement('div');
    uiContainer.style.position = 'fixed';
    uiContainer.style.bottom = '10px';
    uiContainer.style.right = '10px';
    uiContainer.style.background = 'rgba(0, 0, 0, 0.7)';
    uiContainer.style.color = 'white';
    uiContainer.style.padding = '10px';
    uiContainer.style.borderRadius = '5px';
    uiContainer.style.fontFamily = 'Arial, sans-serif';
    uiContainer.style.fontSize = '12px';
    uiContainer.style.maxHeight = '200px';
    uiContainer.style.overflowY = 'auto';
    uiContainer.innerHTML = '<strong>Blocked Trackers:</strong><ul id="tracker-list" style="margin: 5px 0; padding-left: 15px;"></ul>';
    document.body.appendChild(uiContainer);

    function logBlockedTracker(url) {
        const trackerListElement = document.getElementById("tracker-list");
        const listItem = document.createElement("li");
        listItem.textContent = url;
        trackerListElement.appendChild(listItem);
    }
})();
