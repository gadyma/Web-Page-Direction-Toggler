const States = {
  NOT_TOUCHED: 1,
  LTR: 0,
  RTL: 2
};

let tabStates = {};

function getNextState(currentState) {
  switch (currentState) {
    case States.NOT_TOUCHED:
      return States.RTL;
    case States.RTL:
      return States.NOT_TOUCHED;
    default:
      return States.NOT_TOUCHED;
  }
}

function updateIcon(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    const state = tabStates[tabId] || States.NOT_TOUCHED;
    let iconPath;
    switch (state) {
      case States.RTL:
        iconPath = 'icon_rtl.png';
        break;
      //case States.LTR:
      //  iconPath = 'icon_ltr.png';
      //  break;
      default:
        iconPath = 'icon.png';
    }
    chrome.action.setIcon({ path: iconPath, tabId: tabId });
  });
}

function toggleTextDirection(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.error(`Error getting tab: ${chrome.runtime.lastError.message}`);
      return;
    }

    // Check for chrome:// URLs
    if (tab.url.startsWith('chrome://')) {
      if (tab.url.startsWith('chrome://extensions')) {
        console.log('Cannot inject CSS into the extensions gallery.');
      } else {
        console.log('Cannot modify chrome:// pages');
      }
      return;
    }

    const currentState = tabStates[tabId] || States.NOT_TOUCHED;
    const newState = getNextState(currentState);
    tabStates[tabId] = newState;

    let cssCode;
    if (tab.url.includes('https://app.smartsuite.com')) {
      cssCode = getCSSForSmartSuite(newState);
    } else if (tab.url.includes('https://app.slack.com/')) {
      cssCode = getCSSForSlack(newState);
    } else if (tab.url.includes('monday.com')) {
      cssCode = getCSSForMonday(newState);
    } else {
      cssCode = getCSSForGeneral(newState);
    }

    if (newState === States.NOT_TOUCHED) {
      chrome.scripting.removeCSS({
        target: { tabId: tabId },
        css: cssCode
      }, () => {
        if (chrome.runtime.lastError) {
          console.error(`Error removing CSS: ${chrome.runtime.lastError.message}`);
        } else {
          updateIcon(tabId);
        }
      });
    } else {
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        css: cssCode
      }, () => {
        if (chrome.runtime.lastError) {
          console.error(`Error inserting CSS: ${chrome.runtime.lastError.message}`);
        } else {
          updateIcon(tabId);
        }
      });
    }
  });
}

function getCSSForSmartSuite(state) {
      return '.ProseMirror, .edit-record-field, .text-field-control, single-select-control, .grid-view-cell, .record-modal-title__title, .record-list__scrollbar-body, .record-field-section .select-list-items__in, .record-layout-item, .r-textarea, .text--ellipsis, rct-sidebar-row {direction: rtl;} .align-left , .rct-sidebar-row {text-align: Right}'; //.field-type-option-list__options {direction: ltr;}
}

function getCSSForSmartSuiteOLD(state) {
  switch (state) {
    case States.RTL:
      return '.ProseMirror, .edit-record-field, .text-field-control, single-select-control, .grid-view-cell, .record-modal-title__title, .record-list__scrollbar-body, .record-field-section .select-list-items__in, .record-layout-item, .r-textarea, .text--ellipsis {direction: rtl;} .align-left {text-align: Right}'; //.field-type-option-list__options {direction: ltr;}
      
    case States.LTR:
      return '.ProseMirror, .edit-record-field, .text-field-control, single-select-control, .grid-view-cell, .record-modal-title__title, .record-list__scrollbar-body, .record-field-section, select-list-items__in, .record-layout-item, .r-textarea, .text--ellipsis {direction: ltr;} .align-left {text-align: left}'; // not .input-field 
    default:
      return '';
  }
}

function getCSSForSlack(state) {
      return '.p-rich_text_block, .c-message_kit__indent {direction: rtl;}';
}

function getCSSForMonday(state) {
      return '.ds-text-component, ds-text-component, .nameCellContainer--Ko8f5, .name-cell-text, .longTextField--2GUam, .clickable_b19a9b7640, .headingComponent---BEf8.multiLineEllipsis--6SsD1  {direction: rtl; text-align: justify;} #tooltips-container {direction: rtl;}';
}


function getCSSForGeneral(state) {
      return 'html, h1, h2, h3, h4, h5, h6, div {direction: rtl; TEXT-ALIGN: RIGHT;}';
}

chrome.action.onClicked.addListener((tab) => {
  toggleTextDirection(tab.id);
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateIcon(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateIcon(tabId);
  }
});