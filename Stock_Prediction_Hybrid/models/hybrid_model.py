import torch
import torch.nn as nn
import numpy as np
from typing import Dict, List, Tuple
import pandas as pd

from .numerical_model import PricePredictionModel
from .sentiment_model import SentimentAnalyzer

class HybridModel:
    def __init__(self, input_size: int, hidden_size: int, sequence_length: int = 10):
        """
        Initialize the hybrid model combining numerical and sentiment analysis.
        
        Args:
            input_size (int): Number of numerical features
            hidden_size (int): Size of hidden layers
            sequence_length (int): Length of input sequences
        """
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.numerical_model = PricePredictionModel(input_size, hidden_size, sequence_length)
        self.sentiment_analyzer = SentimentAnalyzer()
        
        # Fusion layer
        self.fusion_layer = nn.Sequential(
            nn.Linear(2, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size, 1)
        ).to(self.device)
        
        self.optimizer = torch.optim.Adam(self.fusion_layer.parameters())
        self.criterion = nn.MSELoss()
        
    def prepare_data(self, stock_data: pd.DataFrame, news_data: List[Dict]) -> Tuple:
        """
        Prepare both numerical and sentiment data.
        
        Args:
            stock_data (pd.DataFrame): Historical stock data
            news_data (List[Dict]): News articles data
            
        Returns:
            Tuple: Processed numerical and sentiment features
        """
        # Process numerical data
        features, targets = self.numerical_model.preprocessor.prepare_data(stock_data)
        X, y = self.numerical_model.preprocessor.create_sequences(features, targets)
        
        # Process sentiment data
        sentiment_df = self.sentiment_analyzer.process_news_data(news_data)
        
        # Align sentiment data with stock data
        sentiment_scores = []
        for date in stock_data.index[self.numerical_model.preprocessor.sequence_length:]:
            date_sentiment = sentiment_df[
                sentiment_df['date'] == pd.to_datetime(date).date()
            ]['sentiment_score'].values
            
            if len(date_sentiment) > 0:
                sentiment_scores.append(date_sentiment[0])
            else:
                sentiment_scores.append(0.0)  # Neutral sentiment if no news
        
        sentiment_scores = np.array(sentiment_scores).reshape(-1, 1)
        
        return X, sentiment_scores, y
    
    def train(self, train_data: Tuple, val_data: Tuple, epochs: int = 100) -> List[float]:
        """
        Train the hybrid model.
        
        Args:
            train_data (Tuple): Training data (numerical_X, sentiment_X, y)
            val_data (Tuple): Validation data
            epochs (int): Number of training epochs
            
        Returns:
            List[float]: Training history
        """
        X_train, sentiment_train, y_train = train_data
        X_val, sentiment_val, y_val = val_data
        
        # Convert to tensors
        X_train = torch.FloatTensor(X_train).to(self.device)
        sentiment_train = torch.FloatTensor(sentiment_train).to(self.device)
        y_train = torch.FloatTensor(y_train).to(self.device)
        
        X_val = torch.FloatTensor(X_val).to(self.device)
        sentiment_val = torch.FloatTensor(sentiment_val).to(self.device)
        y_val = torch.FloatTensor(y_val).to(self.device)
        
        val_losses = []
        
        for epoch in range(epochs):
            # Training
            self.fusion_layer.train()
            
            # Get predictions from both models
            numerical_pred = self.numerical_model.predict(X_train)
            numerical_pred = torch.FloatTensor(numerical_pred).to(self.device)
            
            # Combine predictions
            combined_input = torch.cat([numerical_pred, sentiment_train], dim=1)
            
            # Forward pass through fusion layer
            self.optimizer.zero_grad()
            final_pred = self.fusion_layer(combined_input)
            loss = self.criterion(final_pred, y_train)
            
            # Backward pass
            loss.backward()
            self.optimizer.step()
            
            # Validation
            self.fusion_layer.eval()
            with torch.no_grad():
                numerical_val_pred = self.numerical_model.predict(X_val)
                numerical_val_pred = torch.FloatTensor(numerical_val_pred).to(self.device)
                
                combined_val_input = torch.cat([numerical_val_pred, sentiment_val], dim=1)
                val_pred = self.fusion_layer(combined_val_input)
                val_loss = self.criterion(val_pred, y_val).item()
                
                val_losses.append(val_loss)
                
                if (epoch + 1) % 10 == 0:
                    print(f'Epoch [{epoch+1}/{epochs}], Validation Loss: {val_loss:.4f}')
        
        return val_losses
    
    def predict(self, X: np.ndarray, sentiment_scores: np.ndarray) -> np.ndarray:
        """
        Make predictions using the hybrid model.
        
        Args:
            X (np.ndarray): Numerical features
            sentiment_scores (np.ndarray): Sentiment scores
            
        Returns:
            np.ndarray: Final predictions
        """
        self.fusion_layer.eval()
        
        with torch.no_grad():
            # Get numerical predictions
            X_tensor = torch.FloatTensor(X).to(self.device)
            numerical_pred = self.numerical_model.predict(X_tensor)
            numerical_pred = torch.FloatTensor(numerical_pred).to(self.device)
            
            # Prepare sentiment data
            sentiment_tensor = torch.FloatTensor(sentiment_scores).to(self.device)
            
            # Combine predictions
            combined_input = torch.cat([numerical_pred, sentiment_tensor], dim=1)
            
            # Final prediction
            final_pred = self.fusion_layer(combined_input)
            
            # Convert back to original scale
            final_pred = final_pred.cpu().numpy()
            final_pred = self.numerical_model.preprocessor.inverse_transform_predictions(final_pred)
            
            return final_pred

class EnsemblePredictor:
    def __init__(self, model: HybridModel, window_size: int = 5):
        """
        Initialize the ensemble predictor for multiple time horizons.
        
        Args:
            model (HybridModel): Trained hybrid model
            window_size (int): Number of future time steps to predict
        """
        self.model = model
        self.window_size = window_size
        
    def predict_sequence(self, initial_X: np.ndarray, 
                        initial_sentiment: np.ndarray) -> np.ndarray:
        """
        Make sequential predictions for multiple time steps.
        
        Args:
            initial_X (np.ndarray): Initial numerical features
            initial_sentiment (np.ndarray): Initial sentiment scores
            
        Returns:
            np.ndarray: Sequence of predictions
        """
        predictions = []
        current_X = initial_X.copy()
        current_sentiment = initial_sentiment.copy()
        
        for _ in range(self.window_size):
            # Make prediction for current step
            pred = self.model.predict(current_X, current_sentiment)
            predictions.append(pred[0])
            
            # Update features for next prediction
            current_X = self._update_features(current_X, pred)
            
        return np.array(predictions)
    
    def _update_features(self, X: np.ndarray, new_pred: np.ndarray) -> np.ndarray:
        """
        Update feature window with new prediction.
        
        Args:
            X (np.ndarray): Current feature window
            new_pred (np.ndarray): New prediction to incorporate
            
        Returns:
            np.ndarray: Updated feature window
        """
        # Shift window and add new prediction
        updated_X = X.copy()
        updated_X = np.roll(updated_X, -1, axis=0)
        updated_X[-1, 3] = new_pred[0]  # Update Close price
        
        return updated_X

if __name__ == "__main__":
    # Example usage
    import numpy as np
    
    # Create dummy data
    X = np.random.randn(100, 10, 13)  # 100 samples, 10 time steps, 13 features
    sentiment = np.random.randn(100, 1)  # 100 sentiment scores
    y = np.random.randn(100, 1)  # 100 targets
    
    # Split data
    train_idx = int(0.8 * len(X))
    train_data = (X[:train_idx], sentiment[:train_idx], y[:train_idx])
    val_data = (X[train_idx:], sentiment[train_idx:], y[train_idx:])
    
    # Initialize and train model
    model = HybridModel(input_size=13, hidden_size=64)
    history = model.train(train_data, val_data, epochs=10)
    print("Training completed")
    
    # Make predictions
    ensemble = EnsemblePredictor(model)
    future_preds = ensemble.predict_sequence(X[-1:], sentiment[-1:])
    print("Future predictions:", future_preds) 