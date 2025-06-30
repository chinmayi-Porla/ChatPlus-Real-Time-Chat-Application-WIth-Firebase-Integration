const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};

const dailyApiKey = "your-daily-api-key-here";

// API endpoint for calls
const callAPI = "http://localhost:5000";

// Algolia search configuration
const algoliaKeys = {
  appKey: "your-algolia-app-key",
  publicSearchKey: "your-algolia-public-search-key",
  index: "your-algolia-index"
};

export { firebaseConfig, dailyApiKey, callAPI, algoliaKeys }; 