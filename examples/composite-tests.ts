/**
 * Example Composite Tests
 * Demonstrates how to create composite tests with multi-user support
 */

import { getActivePage } from '@core/page-manager';
import type { CompositeTest, TestCase } from 'endorphin-ai';

// Individual test definitions
export const SEARCH_BOOKING_COM: TestCase = {
  id: 'search-booking-com',
  name: 'Search Booking.com',
  description: 'Search for hotels on Booking.com',
  priority: 'High',
  tags: ['hotel', 'booking', 'search'],
  user: '@user-admin',

  setup: async () => {
    const page = getActivePage();
    await page.goto('https://booking.com');
    await page.locator('#language-selector').selectOption('en');

    return {
      site: 'booking.com',
      configured: true,
    };
  },

  data: async () => ({
    destination: 'New York',
    checkIn: '2024-08-01',
    checkOut: '2024-08-03',
    guests: 2,
  }),

  task: async (data, setupData) => {
    return `
      Search for hotels in ${data.destination}
      Check-in: ${data.checkIn}
      Check-out: ${data.checkOut}
      Guests: ${data.guests}
      
      Find and extract hotel information including names, prices, and ratings
    `;
  },

  after: async (result, data, setupData) => {
    const page = getActivePage();

    // Extract hotel data
    const hotels = await page.$$eval('.hotel-item', (elements) => {
      return elements.map((el) => ({
        name: el.querySelector('.hotel-name')?.textContent || '',
        price: el.querySelector('.price')?.textContent || '',
        rating: el.querySelector('.rating')?.textContent || '',
        url: el.querySelector('a')?.href || '',
      }));
    });

    return {
      site: 'booking.com',
      hotels,
      totalFound: hotels.length,
      searchCriteria: data,
      searchTime: new Date().toISOString(),
    };
  },
};

export const SEARCH_EXPEDIA: TestCase = {
  id: 'search-expedia',
  name: 'Search Expedia',
  description: 'Search for hotels on Expedia',
  priority: 'High',
  tags: ['hotel', 'expedia', 'search'],
  user: '@user-admin',

  setup: async () => {
    const page = getActivePage();
    await page.goto('https://expedia.com');
    await page.locator('[data-testid="language-selector"]').selectOption('en');

    return {
      site: 'expedia.com',
      configured: true,
    };
  },

  data: async () => ({
    destination: 'New York',
    checkIn: '2024-08-01',
    checkOut: '2024-08-03',
    guests: 2,
  }),

  task: async (data, setupData) => {
    return `
      Search for hotels in ${data.destination}
      Check-in: ${data.checkIn}
      Check-out: ${data.checkOut}
      Guests: ${data.guests}
      
      Extract hotel information including names, prices, and availability
    `;
  },

  after: async (result, data, setupData) => {
    const page = getActivePage();

    // Extract hotel data
    const hotels = await page.$$eval('.hotel-listing', (elements) => {
      return elements.map((el) => ({
        name: el.querySelector('.hotel-name')?.textContent || '',
        price: el.querySelector('.price')?.textContent || '',
        rating: el.querySelector('.rating')?.textContent || '',
        url: el.querySelector('a')?.href || '',
      }));
    });

    return {
      site: 'expedia.com',
      hotels,
      totalFound: hotels.length,
      searchCriteria: data,
      searchTime: new Date().toISOString(),
    };
  },
};

export const SEARCH_HOTELS_COM: TestCase = {
  id: 'search-hotels-com',
  name: 'Search Hotels.com',
  description: 'Search for hotels on Hotels.com',
  priority: 'High',
  tags: ['hotel', 'hotels-com', 'search'],
  user: '@user-reviewer', // Different user for this test

  setup: async () => {
    const page = getActivePage();
    await page.goto('https://hotels.com');

    return {
      site: 'hotels.com',
      configured: true,
    };
  },

  data: async () => ({
    destination: 'New York',
    checkIn: '2024-08-01',
    checkOut: '2024-08-03',
    guests: 2,
  }),

  task: async (data, setupData) => {
    return `
      Search for hotels in ${data.destination}
      Check-in: ${data.checkIn}
      Check-out: ${data.checkOut}
      Guests: ${data.guests}
      
      Find hotel listings and extract detailed information
    `;
  },

  after: async (result, data, setupData) => {
    const page = getActivePage();

    // Extract hotel data
    const hotels = await page.$$eval('.property', (elements) => {
      return elements.map((el) => ({
        name: el.querySelector('.property-name')?.textContent || '',
        price: el.querySelector('.price')?.textContent || '',
        rating: el.querySelector('.rating')?.textContent || '',
        url: el.querySelector('a')?.href || '',
      }));
    });

    return {
      site: 'hotels.com',
      hotels,
      totalFound: hotels.length,
      searchCriteria: data,
      searchTime: new Date().toISOString(),
    };
  },
};

// User workflow tests
export const USER_LOGIN_TEST: TestCase = {
  id: 'user-login-test',
  name: 'User Login Test',
  description: 'Test user login functionality',
  priority: 'High',
  tags: ['auth', 'login'],
  user: '@user-admin',

  task: async (data, setupData) => {
    return 'Navigate to login page, enter credentials, and verify successful login';
  },

  after: async (result, data, setupData) => {
    const page = getActivePage();
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').isVisible();

    return {
      loginSuccessful: isLoggedIn,
      timestamp: new Date().toISOString(),
    };
  },
};

export const ADMIN_DASHBOARD_TEST: TestCase = {
  id: 'admin-dashboard-test',
  name: 'Admin Dashboard Test',
  description: 'Test admin dashboard functionality',
  priority: 'High',
  tags: ['admin', 'dashboard'],
  user: '@user-admin',

  task: async (data, setupData) => {
    return 'Navigate to admin dashboard and verify all widgets are loading correctly';
  },

  after: async (result, data, setupData) => {
    const page = getActivePage();
    const widgets = await page.$$eval('.dashboard-widget', (elements) => {
      return elements.map((el) => ({
        title: el.querySelector('.widget-title')?.textContent || '',
        status: el.classList.contains('loading') ? 'loading' : 'loaded',
      }));
    });

    return {
      widgets,
      totalWidgets: widgets.length,
      timestamp: new Date().toISOString(),
    };
  },
};

// Composite test definitions
export const HOTEL_RESEARCH: CompositeTest = {
  id: 'hotel-research',
  name: 'Complete Hotel Research',
  description: 'Research hotels across multiple booking sites',

  tasks: [
    { task: 'search-booking-com' },
    { task: 'search-expedia' },
    { task: 'search-hotels-com' },
  ],

  combineResults: true, // Single combined report
};

export const HOTEL_COMPARISON: CompositeTest = {
  id: 'hotel-comparison',
  name: 'Hotel Site Comparison',
  description: 'Compare hotels across different booking sites',

  tasks: [
    { task: 'search-booking-com' },
    { task: 'search-expedia' },
    { task: 'search-hotels-com' },
  ],

  combineResults: false, // Separate report for each task
};

export const USER_WORKFLOW_TEST: CompositeTest = {
  id: 'user-workflow-test',
  name: 'User Workflow Test',
  description: 'Test complete user workflow from login to dashboard',

  tasks: [{ task: 'user-login-test' }, { task: 'admin-dashboard-test' }],

  combineResults: true,
};

export const COMPREHENSIVE_HOTEL_ANALYSIS: CompositeTest = {
  id: 'comprehensive-hotel-analysis',
  name: 'Comprehensive Hotel Analysis',
  description: 'Complete hotel research with user authentication',

  tasks: [
    { task: 'user-login-test' },
    { task: 'search-booking-com' },
    { task: 'search-expedia' },
    { task: 'search-hotels-com' },
    { task: 'admin-dashboard-test' },
  ],

  combineResults: true,
};
