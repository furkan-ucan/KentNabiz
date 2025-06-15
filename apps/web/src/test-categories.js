/* eslint-env browser */
/* global localStorage, window */
// Test için basit kategori endpoint'i test edici
import axios from 'axios';

const testCategories = async () => {
  try {
    console.log('Testing category endpoint...');

    // Auth token'ını local storage'dan al
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No auth token found');
      return;
    }

    const response = await axios.get(
      'http://localhost:3000/api/report-categories',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Categories response:', response.data);
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

// Export for testing in console
window.testCategories = testCategories;
