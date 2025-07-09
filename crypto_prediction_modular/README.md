# CryptoX - Cryptocurrency Analysis Dashboard

A modern cryptocurrency analysis dashboard that combines real-time market data with AI-powered price predictions and sentiment analysis.

## Project Structure

```
crypto_prediction/
├── static/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── model/
│   └── crypto_model.ipynb
├── index.html
├── requirements.txt
└── README.md
```

## Features

- Real-time cryptocurrency price tracking
- Interactive price charts using Chart.js
- AI-powered price predictions using LSTM neural networks
- Sentiment analysis of news and social media
- Technical analysis indicators
- Responsive and modern UI design

## Setup Instructions

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configure API Keys:
   - Open `model/crypto_model.ipynb`
   - Replace `YOUR_API_KEY` with your CryptoPanic API key

3. Start the Backend Server:
   - Open and run all cells in `model/crypto_model.ipynb`
   - The Flask server will start on port 5000

4. Start the Frontend:
   - Use a local web server to serve the frontend files
   - Open `index.html` in your browser

## API Endpoints

### Price Prediction
- Endpoint: `GET /predict/<coin_id>`
- Returns predicted price, confidence score, and trading recommendation

### Sentiment Analysis
- Endpoint: `GET /sentiment/<coin_id>`
- Returns overall sentiment score and recent news analysis

## Technologies Used

- Frontend:
  - HTML5, CSS3, JavaScript
  - Chart.js for data visualization
  - CoinGecko API for market data

- Backend:
  - Python
  - TensorFlow for price prediction
  - TextBlob for sentiment analysis
  - Flask for API endpoints
  - CryptoPanic API for news data

## Development

The project is structured to separate concerns:
- Frontend files (`static/` and `index.html`) handle the UI and user interactions
- Backend model (`model/crypto_model.ipynb`) handles predictions and analysis
- API endpoints connect the frontend with the model

To modify the project:
1. Frontend changes can be made in the respective CSS and JS files
2. Model improvements can be made in the Jupyter notebook
3. New features can be added by extending both frontend and backend components 