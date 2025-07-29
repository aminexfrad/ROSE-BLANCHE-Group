const puppeteer = require('puppeteer');

async function measurePerformance() {
  console.log('📊 Measuring performance metrics...');
  
  try {
    // Check if puppeteer is installed
    try {
      require('puppeteer');
    } catch (error) {
      console.log('📦 Installing puppeteer for performance monitoring...');
      const { execSync } = require('child_process');
      execSync('npm install puppeteer', { stdio: 'inherit' });
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Enable performance monitoring
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Listen for performance metrics
    const metrics = {};
    
    page.on('metrics', data => {
      metrics.metrics = data.metrics;
    });

    // Navigate to the page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Wait for LCP
    await page.waitForTimeout(5000);

    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcpEntry = entries[entries.length - 1];
          
          resolve({
            lcp: lcpEntry ? lcpEntry.startTime : null,
            fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || null,
            ttfb: performance.getEntriesByType('navigation')[0]?.responseStart - performance.getEntriesByType('navigation')[0]?.requestStart || null
          });
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });

    console.log('📈 Performance Metrics:');
    console.log(`LCP: ${performanceMetrics.lcp ? Math.round(performanceMetrics.lcp) + 'ms' : 'N/A'}`);
    console.log(`FCP: ${performanceMetrics.fcp ? Math.round(performanceMetrics.fcp) + 'ms' : 'N/A'}`);
    console.log(`TTFB: ${performanceMetrics.ttfb ? Math.round(performanceMetrics.ttfb) + 'ms' : 'N/A'}`);

    // Performance assessment
    if (performanceMetrics.lcp) {
      const lcpStatus = performanceMetrics.lcp < 2500 ? '✅ Good' : 
                       performanceMetrics.lcp < 4000 ? '⚠️ Needs Improvement' : '❌ Poor';
      console.log(`LCP Status: ${lcpStatus}`);
    }

    await browser.close();
    
  } catch (error) {
    console.error('❌ Error measuring performance:', error.message);
  }
}

measurePerformance(); 