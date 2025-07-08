import torch
from torch import nn
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
from typing import List, Dict, Union
import pandas as pd

class SentimentAnalyzer:
    def __init__(self, model_name: str = "ProsusAI/finbert"):
        """
        Initialize the sentiment analyzer with a pre-trained model.
        
        Args:
            model_name (str): Name of the pre-trained model to use
        """
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.model.to(self.device)
        
    def analyze_text(self, text: str) -> Dict[str, float]:
        """
        Analyze the sentiment of a single text.
        
        Args:
            text (str): Text to analyze
            
        Returns:
            Dict[str, float]: Dictionary containing sentiment scores
        """
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=1)
            
        # Convert to numpy for easier handling
        probs = probabilities.cpu().numpy()[0]
        
        return {
            'positive': float(probs[0]),
            'negative': float(probs[1]),
            'neutral': float(probs[2])
        }
    
    def analyze_batch(self, texts: List[str]) -> List[Dict[str, float]]:
        """
        Analyze sentiment for a batch of texts.
        
        Args:
            texts (List[str]): List of texts to analyze
            
        Returns:
            List[Dict[str, float]]: List of sentiment scores for each text
        """
        # Handle empty input
        if not texts:
            return []
        
        # Tokenize all texts
        inputs = self.tokenizer(texts, return_tensors="pt", truncation=True, 
                              max_length=512, padding=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        # Get predictions
        with torch.no_grad():
            outputs = self.model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=1)
        
        # Convert to list of dictionaries
        results = []
        for probs in probabilities.cpu().numpy():
            results.append({
                'positive': float(probs[0]),
                'negative': float(probs[1]),
                'neutral': float(probs[2])
            })
            
        return results
    
    def process_news_data(self, news_data: List[Dict]) -> pd.DataFrame:
        """
        Process a list of news articles and return sentiment scores.
        
        Args:
            news_data (List[Dict]): List of news articles
            
        Returns:
            pd.DataFrame: DataFrame with sentiment scores for each article
        """
        # Extract texts to analyze
        texts = []
        dates = []
        for article in news_data:
            # Combine title and description for better context
            text = f"{article['title']} {article['description']}"
            texts.append(text)
            dates.append(article['date'])
        
        # Get sentiment scores
        sentiments = self.analyze_batch(texts)
        
        # Create DataFrame
        df = pd.DataFrame(sentiments)
        df['date'] = dates
        df['date'] = pd.to_datetime(df['date'])
        
        # Calculate aggregate daily sentiment
        daily_sentiment = df.groupby(df['date'].dt.date).agg({
            'positive': 'mean',
            'negative': 'mean',
            'neutral': 'mean'
        }).reset_index()
        
        # Calculate compound score
        daily_sentiment['sentiment_score'] = (
            daily_sentiment['positive'] - daily_sentiment['negative']
        )
        
        return daily_sentiment

class SentimentModel(nn.Module):
    def __init__(self, input_size: int, hidden_size: int):
        """
        Initialize the sentiment-based prediction model.
        
        Args:
            input_size (int): Size of input features
            hidden_size (int): Size of hidden layers
        """
        super().__init__()
        
        self.lstm = nn.LSTM(input_size, hidden_size, 
                           num_layers=2, batch_first=True, dropout=0.2)
        
        self.attention = nn.Sequential(
            nn.Linear(hidden_size, hidden_size),
            nn.Tanh(),
            nn.Linear(hidden_size, 1),
            nn.Softmax(dim=1)
        )
        
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size // 2, 1)
        )
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass of the model.
        
        Args:
            x (torch.Tensor): Input tensor of shape (batch_size, seq_len, input_size)
            
        Returns:
            torch.Tensor: Predictions
        """
        # LSTM layer
        lstm_out, _ = self.lstm(x)
        
        # Attention mechanism
        attention_weights = self.attention(lstm_out)
        context = torch.sum(attention_weights * lstm_out, dim=1)
        
        # Final prediction
        out = self.fc(context)
        return out

if __name__ == "__main__":
    # Example usage
    analyzer = SentimentAnalyzer()
    
    # Test single text analysis
    text = "Company X reports better than expected earnings in Q3"
    result = analyzer.analyze_text(text)
    print(f"Single text sentiment: {result}")
    
    # Test batch analysis
    texts = [
        "Company X reports better than expected earnings in Q3",
        "Market shows signs of volatility amid economic concerns"
    ]
    results = analyzer.analyze_batch(texts)
    print(f"Batch sentiment results: {results}") 