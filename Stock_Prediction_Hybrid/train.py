import argparse
import yaml
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import torch
from torch.utils.data import DataLoader, TensorDataset
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

from models.hybrid_model import HybridModel, EnsemblePredictor
from utils.data_collector import DataCollector

def load_config(config_path: str) -> dict:
    """Load configuration from YAML file."""
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)

def prepare_data(symbol: str, start_date: str, end_date: str = None) -> tuple:
    """Prepare data for training."""
    collector = DataCollector(symbol)
    
    # Get stock data
    stock_data = collector.get_stock_data(start_date, end_date)
    
    # Get news data
    days_of_news = (pd.to_datetime(end_date) - pd.to_datetime(start_date)).days
    news_data = collector.get_news_data(days=days_of_news)
    
    return stock_data, news_data

def create_dataloaders(X: np.ndarray, sentiment: np.ndarray, y: np.ndarray, 
                      batch_size: int) -> tuple:
    """Create train and validation dataloaders."""
    # Split data
    X_train, X_val, s_train, s_val, y_train, y_val = train_test_split(
        X, sentiment, y, test_size=0.2, shuffle=False
    )
    
    # Create datasets
    train_data = TensorDataset(
        torch.FloatTensor(X_train),
        torch.FloatTensor(s_train),
        torch.FloatTensor(y_train)
    )
    val_data = TensorDataset(
        torch.FloatTensor(X_val),
        torch.FloatTensor(s_val),
        torch.FloatTensor(y_val)
    )
    
    # Create dataloaders
    train_loader = DataLoader(train_data, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_data, batch_size=batch_size)
    
    return train_loader, val_loader

def plot_training_history(history: list, save_path: str):
    """Plot and save training history."""
    plt.figure(figsize=(10, 6))
    plt.plot(history, label='Validation Loss')
    plt.title('Training History')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.savefig(save_path)
    plt.close()

def evaluate_model(model: HybridModel, X_val: np.ndarray, 
                  sentiment_val: np.ndarray, y_val: np.ndarray) -> dict:
    """Evaluate model performance."""
    predictions = model.predict(X_val, sentiment_val)
    
    # Calculate metrics
    mse = np.mean((predictions - y_val) ** 2)
    mae = np.mean(np.abs(predictions - y_val))
    mape = np.mean(np.abs((y_val - predictions) / y_val)) * 100
    
    # Calculate directional accuracy
    actual_direction = np.diff(y_val.flatten()) > 0
    pred_direction = np.diff(predictions.flatten()) > 0
    directional_accuracy = np.mean(actual_direction == pred_direction) * 100
    
    return {
        'MSE': mse,
        'MAE': mae,
        'MAPE': mape,
        'Directional Accuracy': directional_accuracy
    }

def save_metrics(metrics: dict, save_path: str):
    """Save evaluation metrics."""
    with open(save_path, 'w') as f:
        yaml.dump(metrics, f)

def main():
    parser = argparse.ArgumentParser(description='Train hybrid stock prediction model')
    parser.add_argument('--config', type=str, required=True, help='Path to config file')
    args = parser.parse_args()
    
    # Load configuration
    config = load_config(args.config)
    
    # Create output directory
    output_dir = Path(config['output_dir'])
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Prepare data
    stock_data, news_data = prepare_data(
        config['symbol'],
        config['start_date'],
        config['end_date']
    )
    
    # Initialize model
    model = HybridModel(
        input_size=config['model']['input_size'],
        hidden_size=config['model']['hidden_size'],
        sequence_length=config['model']['sequence_length']
    )
    
    # Prepare features
    X, sentiment, y = model.prepare_data(stock_data, news_data)
    
    # Create dataloaders
    train_data = (X[:int(0.8*len(X))], 
                 sentiment[:int(0.8*len(X))], 
                 y[:int(0.8*len(X))])
    val_data = (X[int(0.8*len(X)):], 
                sentiment[int(0.8*len(X)):], 
                y[int(0.8*len(X)):])
    
    # Train model
    print("Starting training...")
    history = model.train(
        train_data,
        val_data,
        epochs=config['training']['epochs']
    )
    
    # Plot training history
    plot_training_history(history, output_dir / 'training_history.png')
    
    # Evaluate model
    print("Evaluating model...")
    metrics = evaluate_model(model, val_data[0], val_data[1], val_data[2])
    print("Evaluation metrics:", metrics)
    
    # Save metrics
    save_metrics(metrics, output_dir / 'metrics.yaml')
    
    # Save model
    torch.save(model.state_dict(), output_dir / 'model.pth')
    
    # Make future predictions
    print("Generating future predictions...")
    ensemble = EnsemblePredictor(model, window_size=config['prediction']['window_size'])
    future_preds = ensemble.predict_sequence(X[-1:], sentiment[-1:])
    
    # Save predictions
    np.save(output_dir / 'future_predictions.npy', future_preds)
    
    print("Training completed successfully!")

if __name__ == "__main__":
    main() 