import torch
import torch.nn as nn
import numpy as np
from typing import Tuple, List
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

class TimeSeriesPreprocessor:
    def __init__(self, sequence_length: int = 10):
        """
        Initialize the preprocessor.
        
        Args:
            sequence_length (int): Number of time steps to use for prediction
        """
        self.sequence_length = sequence_length
        self.feature_scaler = MinMaxScaler()
        self.target_scaler = MinMaxScaler()
        
    def prepare_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare data for time series prediction.
        
        Args:
            df (pd.DataFrame): Input DataFrame with features
            
        Returns:
            Tuple[np.ndarray, np.ndarray]: Scaled features and targets
        """
        # Select features for prediction
        feature_columns = ['Open', 'High', 'Low', 'Close', 'Volume', 
                         'MA5', 'MA20', 'RSI', 'MACD', 'Signal_Line',
                         'BB_middle', 'BB_upper', 'BB_lower']
        
        # Scale features
        features = self.feature_scaler.fit_transform(df[feature_columns])
        
        # Scale target (Close price)
        targets = self.target_scaler.fit_transform(df[['Close']])
        
        return features, targets
    
    def create_sequences(self, features: np.ndarray, targets: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Create sequences for time series prediction.
        
        Args:
            features (np.ndarray): Scaled features
            targets (np.ndarray): Scaled targets
            
        Returns:
            Tuple[np.ndarray, np.ndarray]: Sequence data for training
        """
        X, y = [], []
        
        for i in range(len(features) - self.sequence_length):
            X.append(features[i:(i + self.sequence_length)])
            y.append(targets[i + self.sequence_length])
            
        return np.array(X), np.array(y)
    
    def inverse_transform_predictions(self, predictions: np.ndarray) -> np.ndarray:
        """
        Convert scaled predictions back to original scale.
        
        Args:
            predictions (np.ndarray): Scaled predictions
            
        Returns:
            np.ndarray: Predictions in original scale
        """
        return self.target_scaler.inverse_transform(predictions)

class NumericalModel(nn.Module):
    def __init__(self, input_size: int, hidden_size: int, num_layers: int = 2):
        """
        Initialize the numerical prediction model.
        
        Args:
            input_size (int): Number of input features
            hidden_size (int): Size of hidden layers
            num_layers (int): Number of LSTM layers
        """
        super().__init__()
        
        self.lstm = nn.LSTM(input_size, hidden_size, 
                           num_layers=num_layers, 
                           batch_first=True,
                           dropout=0.2)
        
        # Multi-head self-attention
        self.attention = nn.MultiheadAttention(hidden_size, 
                                             num_heads=4, 
                                             dropout=0.1,
                                             batch_first=True)
        
        self.fc_layers = nn.Sequential(
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size // 2, hidden_size // 4),
            nn.ReLU(),
            nn.Linear(hidden_size // 4, 1)
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
        
        # Self-attention
        attn_out, _ = self.attention(lstm_out, lstm_out, lstm_out)
        
        # Combine LSTM and attention outputs
        combined = lstm_out + attn_out
        
        # Get last sequence for prediction
        last_hidden = combined[:, -1, :]
        
        # Final prediction
        out = self.fc_layers(last_hidden)
        return out

class PricePredictionModel:
    def __init__(self, input_size: int, hidden_size: int, sequence_length: int = 10):
        """
        Initialize the price prediction model.
        
        Args:
            input_size (int): Number of input features
            hidden_size (int): Size of hidden layers
            sequence_length (int): Length of input sequences
        """
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = NumericalModel(input_size, hidden_size).to(self.device)
        self.preprocessor = TimeSeriesPreprocessor(sequence_length)
        self.criterion = nn.MSELoss()
        self.optimizer = torch.optim.Adam(self.model.parameters())
        
    def train(self, train_loader: torch.utils.data.DataLoader, 
              val_loader: torch.utils.data.DataLoader,
              epochs: int = 100) -> List[float]:
        """
        Train the model.
        
        Args:
            train_loader (DataLoader): Training data loader
            val_loader (DataLoader): Validation data loader
            epochs (int): Number of training epochs
            
        Returns:
            List[float]: Training history (validation losses)
        """
        val_losses = []
        
        for epoch in range(epochs):
            # Training
            self.model.train()
            for batch_x, batch_y in train_loader:
                batch_x = batch_x.to(self.device).float()
                batch_y = batch_y.to(self.device).float()
                
                self.optimizer.zero_grad()
                outputs = self.model(batch_x)
                loss = self.criterion(outputs, batch_y)
                loss.backward()
                self.optimizer.step()
            
            # Validation
            self.model.eval()
            val_loss = 0
            with torch.no_grad():
                for batch_x, batch_y in val_loader:
                    batch_x = batch_x.to(self.device).float()
                    batch_y = batch_y.to(self.device).float()
                    
                    outputs = self.model(batch_x)
                    val_loss += self.criterion(outputs, batch_y).item()
            
            val_loss /= len(val_loader)
            val_losses.append(val_loss)
            
            if (epoch + 1) % 10 == 0:
                print(f'Epoch [{epoch+1}/{epochs}], Validation Loss: {val_loss:.4f}')
        
        return val_losses
    
    def predict(self, X: torch.Tensor) -> np.ndarray:
        """
        Make predictions using the trained model.
        
        Args:
            X (torch.Tensor): Input data
            
        Returns:
            np.ndarray: Predicted values
        """
        self.model.eval()
        with torch.no_grad():
            X = X.to(self.device).float()
            predictions = self.model(X)
            return predictions.cpu().numpy()

if __name__ == "__main__":
    # Example usage
    import torch.utils.data as data
    
    # Create dummy data
    X = np.random.randn(100, 10, 13)  # 100 samples, 10 time steps, 13 features
    y = np.random.randn(100, 1)       # 100 targets
    
    # Create data loaders
    train_data = data.TensorDataset(torch.FloatTensor(X), torch.FloatTensor(y))
    train_loader = data.DataLoader(train_data, batch_size=32, shuffle=True)
    
    # Initialize and train model
    model = PricePredictionModel(input_size=13, hidden_size=64)
    history = model.train(train_loader, train_loader, epochs=10)  # Using same data for train/val
    print("Training completed") 