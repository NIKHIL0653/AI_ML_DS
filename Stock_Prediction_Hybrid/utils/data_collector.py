import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Union
import os
from dotenv import load_dotenv
import time

load_dotenv()

class DataCollector:
    def __init__(self, symbol: str):
        """
        Initialize the DataCollector with a stock symbol.
        
        Args:
            symbol (str): Stock symbol (e.g., 'AAPL' for Apple)
        """
        self.symbol = symbol
        self.news_api_key = os.getenv('NEWS_API_KEY')
        
    def get_stock_data(self, start_date: str, end_date: str = None) -> pd.DataFrame:
        """
        Fetch historical stock data from Yahoo Finance.
        
        Args:
            start_date (str): Start date in 'YYYY-MM-DD' format
            end_date (str): End date in 'YYYY-MM-DD' format (default: today)
            
        Returns:
            pd.DataFrame: Historical stock data with technical indicators
        """
        stock = yf.Ticker(self.symbol)
        df = stock.history(start=start_date, end=end_date)
        
        # Add technical indicators
        df = self._add_technical_indicators(df)
        
        return df
    
    def _add_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Add technical indicators to the stock data.
        
        Args:
            df (pd.DataFrame): Stock price dataframe
            
        Returns:
            pd.DataFrame: DataFrame with additional technical indicators
        """
        # Moving averages
        df['MA5'] = df['Close'].rolling(window=5).mean()
        df['MA20'] = df['Close'].rolling(window=20).mean()
        
        # Relative Strength Index (RSI)
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        # MACD
        exp1 = df['Close'].ewm(span=12, adjust=False).mean()
        exp2 = df['Close'].ewm(span=26, adjust=False).mean()
        df['MACD'] = exp1 - exp2
        df['Signal_Line'] = df['MACD'].ewm(span=9, adjust=False).mean()
        
        # Bollinger Bands
        df['BB_middle'] = df['Close'].rolling(window=20).mean()
        df['BB_upper'] = df['BB_middle'] + 2 * df['Close'].rolling(window=20).std()
        df['BB_lower'] = df['BB_middle'] - 2 * df['Close'].rolling(window=20).std()
        
        return df
    
    def get_news_data(self, days: int = 7) -> List[Dict]:
        """
        Fetch news articles related to the stock.
        
        Args:
            days (int): Number of days of news to fetch
            
        Returns:
            List[Dict]: List of news articles with sentiment scores
        """
        # Limit days to 30 for free API tier
        days = min(days, 30)
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Format dates for the API
        from_date = start_date.strftime('%Y-%m-%d')
        to_date = end_date.strftime('%Y-%m-%d')
        
        url = f"https://newsapi.org/v2/everything"
        params = {
            'q': f"{self.symbol} stock",  # More specific search
            'from': from_date,
            'to': to_date,
            'language': 'en',
            'sortBy': 'publishedAt',
            'pageSize': 100,  # Maximum articles per request
            'apiKey': self.news_api_key
        }
        
        try:
            response = requests.get(url, params=params)
            
            # Handle rate limiting
            if response.status_code == 429:
                print("API rate limit reached. Waiting before retrying...")
                time.sleep(60)  # Wait for 1 minute
                response = requests.get(url, params=params)
            
            response.raise_for_status()
            articles = response.json()['articles']
            
            # Process and clean the articles
            processed_articles = []
            for article in articles:
                # Skip articles without title or description
                if not article.get('title') or not article.get('description'):
                    continue
                    
                processed_articles.append({
                    'date': article['publishedAt'],
                    'title': article['title'],
                    'description': article['description'],
                    'url': article['url'],
                    'source': article.get('source', {}).get('name', 'Unknown')
                })
                
            print(f"Retrieved {len(processed_articles)} news articles")
            return processed_articles
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching news data: {e}")
            # Return empty list instead of failing
            return []
        except Exception as e:
            print(f"Unexpected error processing news data: {e}")
            return []
    
    def combine_data(self, stock_data: pd.DataFrame, news_data: List[Dict]) -> pd.DataFrame:
        """
        Combine stock and news data into a single DataFrame.
        
        Args:
            stock_data (pd.DataFrame): Historical stock data
            news_data (List[Dict]): News articles data
            
        Returns:
            pd.DataFrame: Combined dataset
        """
        # Convert news data to DataFrame
        news_df = pd.DataFrame(news_data)
        news_df['date'] = pd.to_datetime(news_df['date'])
        news_df.set_index('date', inplace=True)
        
        # Combine on date index
        combined_df = stock_data.join(news_df, how='left')
        
        return combined_df

if __name__ == "__main__":
    # Example usage
    collector = DataCollector('AAPL')
    
    # Get stock data for the last 6 months
    start_date = (datetime.now() - timedelta(days=180)).strftime('%Y-%m-%d')
    stock_data = collector.get_stock_data(start_date)
    
    # Get news data for the last week
    news_data = collector.get_news_data(days=7)
    
    # Combine the data
    combined_data = collector.combine_data(stock_data, news_data)
    print(combined_data.head()) 