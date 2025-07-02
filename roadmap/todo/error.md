   ✅ Result: Retrieved optimized content: 166 tokens (saved 29)
🔘 Click Login using text strategy
(node:96244) MaxListenersExceededWarning: Possible EventTarget memory leak detected. 11 abort listeners added to [AbortSignal]. MaxListeners is 10. Use events.setMaxListeners() to increase limit
(Use `node --trace-warnings ...` to show where the warning was created)
📸 Screenshot: After clicking Login -> step-2-2025-07-02T04-21-52-085Z.png
🔥 Click Login using text strategy
   🔧 Tool: click
   📊 Params: {
  "selector": "Login",
  "strategy": "text",
  "timeout": 10000,
  "force": false
}
   ✅ Result: Successfully clicked Login using text strategy
⏱️ Wait for 2000ms
🔥 Wait for 2000ms
   🔧 Tool: wait
   📊 Params: {
  "milliseconds": 2000,
  "state": "visible"
}
   ✅ Result: Waited for 2000ms
❌ Test HEALTH-001 failed: Aborted
📝 Test execution failed
   ✅ Result: Aborted


   also 

   04:25:39 WARN     [FRAMEWORK.BrowserManager] HTTP error response {url=https://qafromla.herokuapp.com/api/users/login status=404 statusText=Not Found}
04:25:39 WARN     [FRAMEWORK.BrowserManager] Browser console error: Failed to load resource: the server responded with a status of 404 (Not Found)
❌ Test UI-DEMO-001 failed: Aborted
📝 Test execution failed
   ✅ Result: Aborted
💾 Session data saved to: /Users/papapin777/Documents/CODE/AI/endorphin-ai/tmp/test-results/UI-DEMO-001_2025-07-02T04-25-30-132Z
📊 Test session completed: FAILED
📁 Results saved to: /Users/papapin777/Documents/CODE/AI/endorphin-ai/tmp/test-results/UI-DEMO-001_2025-07-02T04-25-30-132Z
🤖 No AI calls made yet
🧹 Page snapshots cleared
04:25:40 INFO     [FRAMEWORK.BrowserManager] Cleaning up browser resources
04:25:40 INFO     [FRAMEWORK.BrowserManager] Browser closed
04:25:40 INFO     [FRAMEWORK.BrowserManager] Browser cleanup completed
     ✗ UI-DEMO-001: Custom Tools Demo (11126ms)
       Aborted


       also 


       node node_modules/endorphin-ai/dist/bin/endorphin.js generate report
📊 Generating HTML test report...
❌ Error: __dirname is not defined


also double browser problem still exist

also test recorder create 
 "testData": {
    "email": "papapin777@gmail.com"
  } 

  but should create   data: async () => {
    return {
    "email": "papapin777@gmail.com"
  } 
  }
