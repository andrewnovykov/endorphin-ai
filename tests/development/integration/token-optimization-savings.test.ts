/**
 * Token Optimization Savings Tests
 * Tests that demonstrate real token savings from the optimization implementation
 */

import { createContentOptimizationTool } from '../../../framework/tools/content-optimization';

describe('Token Optimization Savings', () => {
  let mockFramework: any;
  let mockPage: any;
  let optimizationTool: any;

  beforeEach(() => {
    // Mock complex page content
    const mockComplexPageContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Complex Test Page</title>
      </head>
      <body>
        <header>
          <nav>
            <ul>
              <li><a href="/home">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </nav>
        </header>
        
        <main>
          <section class="hero">
            <h1>Welcome to Our Amazing Platform</h1>
            <p>This is a comprehensive platform that offers various services and solutions for your business needs. Our platform has been designed with user experience in mind, providing intuitive interfaces and powerful features that help you achieve your goals efficiently.</p>
            <button data-testid="get-started">Get Started</button>
          </section>
          
          <section class="features">
            <h2>Our Features</h2>
            <div class="feature-grid">
              <div class="feature-card">
                <h3>Advanced Analytics</h3>
                <p>Get detailed insights into your business performance with our advanced analytics dashboard. Track key metrics, identify trends, and make data-driven decisions that drive growth.</p>
              </div>
              <div class="feature-card">
                <h3>Cloud Integration</h3>
                <p>Seamlessly integrate with popular cloud services and platforms. Our robust APIs and connectors make it easy to sync your data across different systems.</p>
              </div>
              <div class="feature-card">
                <h3>24/7 Support</h3>
                <p>Our dedicated support team is available around the clock to help you with any questions or issues you might encounter while using our platform.</p>
              </div>
            </div>
          </section>
          
          <section class="testimonials">
            <h2>What Our Customers Say</h2>
            <div class="testimonial">
              <p>"This platform has revolutionized the way we do business. The features are exactly what we needed, and the support team is incredible."</p>
              <cite>- John Smith, CEO of TechCorp</cite>
            </div>
            <div class="testimonial">
              <p>"Implementation was smooth, and we saw results immediately. Highly recommend to any business looking to scale."</p>
              <cite>- Sarah Johnson, Marketing Director</cite>
            </div>
          </section>
          
          <section class="pricing">
            <h2>Choose Your Plan</h2>
            <div class="pricing-grid">
              <div class="pricing-card">
                <h3>Starter</h3>
                <p class="price">$29/month</p>
                <ul>
                  <li>Up to 5 users</li>
                  <li>Basic analytics</li>
                  <li>Email support</li>
                </ul>
                <button class="btn btn-primary">Choose Starter</button>
              </div>
              <div class="pricing-card featured">
                <h3>Professional</h3>
                <p class="price">$79/month</p>
                <ul>
                  <li>Up to 25 users</li>
                  <li>Advanced analytics</li>
                  <li>Priority support</li>
                  <li>API access</li>
                </ul>
                <button class="btn btn-primary">Choose Professional</button>
              </div>
              <div class="pricing-card">
                <h3>Enterprise</h3>
                <p class="price">Contact us</p>
                <ul>
                  <li>Unlimited users</li>
                  <li>Custom analytics</li>
                  <li>Dedicated support</li>
                  <li>Custom integrations</li>
                </ul>
                <button class="btn btn-secondary">Contact Sales</button>
              </div>
            </div>
          </section>
          
          <section class="contact-form">
            <h2>Get In Touch</h2>
            <form>
              <div class="form-group">
                <label for="name">Full Name</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div class="form-group">
                <label for="company">Company</label>
                <input type="text" id="company" name="company" />
              </div>
              <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" rows="5" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Send Message</button>
            </form>
          </section>
        </main>
        
        <footer>
          <div class="footer-content">
            <div class="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="/about">About Us</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/press">Press</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="/help">Help Center</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/status">System Status</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Service</a></li>
                <li><a href="/cookies">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2025 Amazing Platform Inc. All rights reserved.</p>
          </div>
        </footer>
      </body>
      </html>
    `;

    // Mock page object with complex content
    mockPage = {
      url: jest.fn().mockReturnValue('https://example.com/dashboard'),
      title: jest.fn().mockResolvedValue('Complex Test Page'),
      content: jest.fn().mockResolvedValue(mockComplexPageContent),
      $$: jest.fn().mockImplementation((selector: string) => {
        if (selector === 'form') {
          return [{
            evaluate: jest.fn().mockResolvedValue('form[name="contact"] input[type="text"][name="name"] input[type="email"][name="email"] textarea[name="message"] button[type="submit"]')
          }];
        }
        if (selector.includes('button')) {
          return [
            { evaluate: jest.fn() },
            { evaluate: jest.fn() },
            { evaluate: jest.fn() }
          ];
        }
        return [];
      }),
      $$eval: jest.fn().mockImplementation((selector: string, fn: any) => {
        if (selector === '*') return 150; // Total elements
        if (selector.includes('button') || selector.includes('input')) return 8; // Interactive elements
        return 0;
      })
    };

    // Mock framework
    mockFramework = {
      page: mockPage,
      logTestStep: jest.fn(),
    };

    optimizationTool = createContentOptimizationTool(mockFramework);
  });

  describe('Token Savings Demonstration', () => {
    it('should dramatically reduce tokens compared to full page content', async () => {
      // Get full page content (baseline)
      const fullContent = await mockPage.content();
      const fullPageTokens = Math.ceil(fullContent.length / 3.5); // Estimation used in optimization
      
      // Get optimized content
      const result = await optimizationTool.invoke({ 
        instruction: 'click the get started button' 
      });
      
      expect(result).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.metadata).toBeDefined();
      
      const optimizedTokens = result.metadata.tokensUsed;
      const savings = result.metadata.estimatedSavings;
      
      // Verify significant token reduction
      expect(optimizedTokens).toBeLessThan(fullPageTokens);
      expect(savings).toBeGreaterThan(0);
      expect(optimizedTokens / fullPageTokens).toBeLessThan(0.5); // At least 50% reduction
      
      console.log('📊 Token Savings Results:');
      console.log(`   Full page tokens: ${fullPageTokens}`);
      console.log(`   Optimized tokens: ${optimizedTokens}`);
      console.log(`   Savings: ${savings} tokens (${result.metadata.optimization})`);
    });

    it('should prioritize interactive elements for action instructions', async () => {
      const result = await optimizationTool.invoke({ 
        instruction: 'fill out the contact form' 
      });
      
      expect(result.error).toBeUndefined();
      
      // Should include form-related content
      expect(result.content).toContain('form');
      expect(result.metadata.selectedChunks).toBeGreaterThan(0);
      
      // Should show optimization occurred
      expect(result.metadata.optimization).toContain('reduction');
    });

    it('should include navigation for orientation', async () => {
      const result = await optimizationTool.invoke({ 
        instruction: 'navigate to the about page' 
      });
      
      expect(result.error).toBeUndefined();
      expect(result.content).toMatch(/nav|header|navigation/i);
    });

    it('should maintain essential interactive elements', async () => {
      const result = await optimizationTool.invoke({ 
        instruction: 'click the professional plan button' 
      });
      
      expect(result.error).toBeUndefined();
      
      // Should include interactive elements
      expect(result.content).toMatch(/button|interactive/i);
      expect(result.metadata.selectedChunks).toBeGreaterThan(0);
    });

    it('should demonstrate cost savings potential', async () => {
      const fullContent = await mockPage.content();
      const fullPageTokens = Math.ceil(fullContent.length / 3.5);
      
      // GPT-4o pricing: $0.0025 per 1K input tokens
      const fullPageCost = (fullPageTokens / 1000) * 0.0025;
      
      const result = await optimizationTool.invoke({ 
        instruction: 'complete the user registration process' 
      });
      
      const optimizedTokens = result.metadata.tokensUsed;
      const optimizedCost = (optimizedTokens / 1000) * 0.0025;
      const costSavings = fullPageCost - optimizedCost;
      
      expect(costSavings).toBeGreaterThan(0);
      expect(optimizedCost).toBeLessThan(fullPageCost);
      
      console.log('💰 Cost Savings Analysis:');
      console.log(`   Full page cost: $${fullPageCost.toFixed(6)}`);
      console.log(`   Optimized cost: $${optimizedCost.toFixed(6)}`);
      console.log(`   Cost savings: $${costSavings.toFixed(6)} per request`);
    });

    it('should show cumulative savings for multiple interactions', async () => {
      const testScenarios = [
        'navigate to the login page',
        'fill in the username field',
        'fill in the password field',
        'click the login button',
        'verify dashboard is displayed'
      ];
      
      let totalOriginalTokens = 0;
      let totalOptimizedTokens = 0;
      
      const fullContent = await mockPage.content();
      const baseTokens = Math.ceil(fullContent.length / 3.5);
      
      for (const instruction of testScenarios) {
        const result = await optimizationTool.invoke({ instruction });
        
        totalOriginalTokens += baseTokens; // Each call would send full page
        totalOptimizedTokens += result.metadata.tokensUsed;
      }
      
      const totalSavings = totalOriginalTokens - totalOptimizedTokens;
      const savingsPercentage = (totalSavings / totalOriginalTokens) * 100;
      
      expect(totalSavings).toBeGreaterThan(0);
      expect(savingsPercentage).toBeGreaterThan(50); // At least 50% savings
      
      console.log('🔄 Cumulative Savings (5 interactions):');
      console.log(`   Total original tokens: ${totalOriginalTokens}`);
      console.log(`   Total optimized tokens: ${totalOptimizedTokens}`);
      console.log(`   Total savings: ${totalSavings} tokens (${savingsPercentage.toFixed(1)}%)`);
    });
  });

  describe('Optimization Quality', () => {
    it('should maintain relevant content for task completion', async () => {
      const result = await optimizationTool.invoke({ 
        instruction: 'subscribe to the professional plan' 
      });
      
      expect(result.error).toBeUndefined();
      expect(result.content.length).toBeGreaterThan(100); // Should have meaningful content
      expect(result.metadata.selectedChunks).toBeGreaterThan(0);
    });

    it('should handle various instruction types appropriately', async () => {
      const instructionTypes = [
        { instruction: 'click the login button', shouldContain: ['button', 'interactive'] },
        { instruction: 'fill out the contact form', shouldContain: ['form', 'input'] },
        { instruction: 'read the privacy policy', shouldContain: ['content', 'text'] },
        { instruction: 'navigate to pricing', shouldContain: ['nav', 'link'] }
      ];
      
      for (const { instruction, shouldContain } of instructionTypes) {
        const result = await optimizationTool.invoke({ instruction });
        expect(result.error).toBeUndefined();
        
        const content = result.content.toLowerCase();
        const hasRelevantContent = shouldContain.some(term => 
          content.includes(term) || content.includes(instruction.toLowerCase())
        );
        expect(hasRelevantContent).toBe(true);
      }
    });
  });
});