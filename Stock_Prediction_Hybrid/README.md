# Hybrid Stock Price Prediction Model

An end-to-end machine learning system that combines numerical analysis and sentiment analysis for stock price prediction. This project demonstrates advanced concepts in deep learning, natural language processing, and financial analysis.

## Features

- **Dual-Input Architecture**: Combines both numerical time series data and news sentiment analysis
- **Advanced Deep Learning**: Uses LSTM/GRU networks for time series prediction
- **Transformer-based Sentiment Analysis**: Leverages state-of-the-art NLP models for news sentiment
- **Real-time Data Integration**: Fetches live stock data and financial news
- **Interactive Dashboard**: Visualize predictions and model performance
- **Comprehensive Backtesting**: Evaluate model performance across different market conditions

## Technical Stack

- **Deep Learning**: TensorFlow, PyTorch
- **NLP**: Hugging Face Transformers, NLTK, TextBlob
- **Data Processing**: Pandas, NumPy
- **Visualization**: Plotly, Streamlit
- **Data Sources**: Yahoo Finance, Financial News APIs

## Project Structure

```
Stock_Prediction_Hybrid/
├── data/                      # Data storage
├── models/                    # Model implementations
│   ├── numerical_model.py     # Time series analysis
│   ├── sentiment_model.py     # News sentiment analysis
│   └── hybrid_model.py        # Combined model architecture
├── utils/                     # Utility functions
│   ├── data_collector.py      # Data collection utilities
│   ├── preprocessor.py        # Data preprocessing
│   └── evaluator.py          # Model evaluation
├── notebooks/                 # Jupyter notebooks
├── dashboard/                 # Interactive visualization
└── config/                   # Configuration files
```

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd Stock_Prediction_Hybrid
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Configure your API keys in `config/.env`:
```
ALPHA_VANTAGE_KEY=your_key_here
NEWS_API_KEY=your_key_here
```

2. Run data collection:
```bash
python scripts/collect_data.py --symbol AAPL --start_date 2020-01-01
```

3. Train the model:
```bash
python scripts/train.py --config config/training_config.yaml
```

4. Launch the dashboard:
```bash
streamlit run dashboard/app.py
```

## Model Architecture

The hybrid model combines two main components:

1. **Numerical Analysis Model**:
   - LSTM/GRU layers for time series processing
   - Technical indicators as additional features
   - Multi-head attention mechanism

2. **Sentiment Analysis Model**:
   - FinBERT for financial news sentiment
   - Temporal attention for news relevance
   - Sentiment aggregation strategy

## Performance Metrics

- Mean Absolute Percentage Error (MAPE)
- Root Mean Square Error (RMSE)
- Directional Accuracy
- Trading Strategy Returns

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Financial data provided by Yahoo Finance
- News data from various financial news APIs
- Sentiment analysis leveraging FinBERT pre-trained model 