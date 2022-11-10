// // Wrap in an onInstalled callback in order to avoid unnecessary work
// // every time the background script is run
// chrome.runtime.onInstalled.addListener(() => {
//   // Page actions are disabled by default and enabled on select tabs
//   chrome.action.disable();

//   // Clear all rules to ensure only our expected rules are set
//   chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
//     const rules = [{
//       conditions: [
//         new chrome.declarativeContent.PageStateMatcher({
//           pageUrl: {
//             hostEquals: 'mock.i.woa.com',
//             schemes: ['http']
//           },
//         })
//       ],
//       actions: [new chrome.declarativeContent.ShowPageAction()],
//     }];
//     chrome.declarativeContent.onPageChanged.addRules(rules);
//   });
// });