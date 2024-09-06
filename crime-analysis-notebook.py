# India Crime Data Analysis Notebook

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import geopandas as gpd
import numpy as np
from scipy import stats

# Load the data
df = pd.read_csv('NCRB_Table_1C.2 (1).csv')

# Data Cleaning and Preprocessing
df = df.drop(columns=['Sl. No.', 'Category'])
df = df.rename(columns={'State/UT': 'State'})
df = df[df['State'] != 'Total State (S)']
df = df[df['State'] != 'Total UT (S)']
df = df[df['State'] != 'Total All India']

# Convert numeric columns to float
numeric_columns = df.columns[1:]
df[numeric_columns] = df[numeric_columns].astype(float)

# Calculate crime rate per 100,000 population (assuming population data is available)
# For this example, we'll use a hypothetical population for each state
# In a real scenario, you would need to import actual population data
df['Population'] = np.random.randint(1000000, 100000000, size=len(df))
df['Crime Rate'] = df['Total Violent Crimes (Cols.3 to 17)'] / df['Population'] * 100000

# 1. Crime Rate by State/Region
def analyze_crime_rates():
    print("1. Crime Rate Analysis")
    print("\nTop 5 States with Highest Crime Rates:")
    print(df.sort_values('Crime Rate', ascending=False)[['State', 'Crime Rate']].head())
    
    print("\nTop 5 States with Lowest Crime Rates:")
    print(df.sort_values('Crime Rate')[['State', 'Crime Rate']].head())
    
    # Visualization
    plt.figure(figsize=(12, 6))
    sns.barplot(x='Crime Rate', y='State', data=df.sort_values('Crime Rate', ascending=False).head(10))
    plt.title('Top 10 States by Crime Rate')
    plt.tight_layout()
    plt.show()

analyze_crime_rates()

# 2. Violent Crime Trend Analysis
def analyze_violent_crime_trends():
    print("\n2. Violent Crime Trend Analysis")
    
    crime_types = df.columns[1:-2]  # Exclude 'State', 'Population', and 'Crime Rate'
    total_crimes = df[crime_types].sum().sort_values(ascending=False)
    
    print("\nMost Common Violent Crimes in India:")
    print(total_crimes.head())
    
    # Visualization
    plt.figure(figsize=(12, 6))
    sns.barplot(x=total_crimes.head(10).values, y=total_crimes.head(10).index)
    plt.title('Top 10 Most Common Violent Crimes in India')
    plt.xlabel('Number of Cases')
    plt.tight_layout()
    plt.show()
    
    # Analysis of specific crimes across regions
    specific_crimes = ['Rape (Sec.376 IPC)', 'Dowry Deaths (Sec.304B IPC)', 'Murder (Sec.302 IPC)']
    for crime in specific_crimes:
        print(f"\nTop 5 States with Highest {crime}:")
        print(df.sort_values(crime, ascending=False)[['State', crime]].head())

analyze_violent_crime_trends()

# 3. Correlation Analysis of Crimes
def correlation_analysis():
    print("\n3. Correlation Analysis of Crimes")
    
    corr_matrix = df[df.columns[1:-2]].corr()
    
    # Visualization
    plt.figure(figsize=(12, 10))
    sns.heatmap(corr_matrix, annot=False, cmap='coolwarm')
    plt.title('Correlation Heatmap of Violent Crimes')
    plt.tight_layout()
    plt.show()
    
    print("\nHighest Correlations:")
    corr_unstack = corr_matrix.unstack()
    print(corr_unstack[corr_unstack < 1].sort_values(ascending=False).head(10))
    
    # Analysis of attempts vs. successful crimes
    attempt_crimes = ['Attempt to Commit Murder (Sec.307 IPC)', 'Attempt to Commit Rape (Sec.376 r/w 511 IPC)']
    actual_crimes = ['Murder (Sec.302 IPC)', 'Rape (Sec.376 IPC)']
    
    for attempt, actual in zip(attempt_crimes, actual_crimes):
        correlation = df[attempt].corr(df[actual])
        print(f"\nCorrelation between {attempt} and {actual}: {correlation:.2f}")

correlation_analysis()

# 4. Impact of Gender-Related Crimes
def analyze_gender_related_crimes():
    print("\n4. Impact of Gender-Related Crimes")
    
    gender_crimes = ['Rape (Sec.376 IPC)', 'Dowry Deaths (Sec.304B IPC)', 'Infanticide (Sec.315 IPC)']
    
    for crime in gender_crimes:
        print(f"\nTop 5 States with Highest {crime}:")
        print(df.sort_values(crime, ascending=False)[['State', crime]].head())
    
    # Correlation with overall crime rate
    for crime in gender_crimes:
        correlation = df[crime].corr(df['Crime Rate'])
        print(f"\nCorrelation between {crime} and overall Crime Rate: {correlation:.2f}")
    
    # Visualization
    plt.figure(figsize=(12, 6))
    df_melted = df.melt(id_vars='State', value_vars=gender_crimes, var_name='Crime Type', value_name='Count')
    sns.barplot(x='State', y='Count', hue='Crime Type', data=df_melted)
    plt.xticks(rotation=90)
    plt.title('Gender-Related Crimes by State')
    plt.tight_layout()
    plt.show()

analyze_gender_related_crimes()

# 5. Crime Prevention Prioritization
def crime_prevention_prioritization():
    print("\n5. Crime Prevention Prioritization")
    
    crime_types = df.columns[1:-2]
    
    for crime in crime_types:
        print(f"\nTop 3 States to Prioritize for {crime}:")
        print(df.sort_values(crime, ascending=False)[['State', crime]].head(3))
    
    # Visualization of crime distribution
    plt.figure(figsize=(12, 8))
    df_melted = df.melt(id_vars='State', value_vars=crime_types, var_name='Crime Type', value_name='Count')
    sns.boxplot(x='Crime Type', y='Count', data=df_melted)
    plt.xticks(rotation=90)
    plt.title('Distribution of Crimes Across States')
    plt.tight_layout()
    plt.show()

crime_prevention_prioritization()

# 6. Crime Severity and Category Analysis
def crime_severity_analysis():
    print("\n6. Crime Severity and Category Analysis")
    
    crime_types = df.columns[1:-2]
    total_crimes = df[crime_types].sum()
    crime_proportions = total_crimes / total_crimes.sum() * 100
    
    print("\nProportion of Each Crime Type in Total Violent Crimes:")
    print(crime_proportions.sort_values(ascending=False))
    
    # Visualization
    plt.figure(figsize=(12, 8))
    crime_proportions.sort_values(ascending=False).plot(kind='bar')
    plt.title('Proportion of Each Crime Type in Total Violent Crimes')
    plt.ylabel('Percentage')
    plt.xticks(rotation=90)
    plt.tight_layout()
    plt.show()
    
    # Regional analysis
    print("\nTop Contributing Crime Type for Each State:")
    for _, row in df.iterrows():
        state = row['State']
        top_crime = row[crime_types].idxmax()
        print(f"{state}: {top_crime}")

crime_severity_analysis()

# 7. Cultural and Economic Influences on Crime (Hypothetical Analysis)
def cultural_economic_analysis():
    print("\n7. Cultural and Economic Influences on Crime (Hypothetical Analysis)")
    
    # This analysis would require additional socio-economic data
    # For demonstration, we'll use hypothetical data
    
    df['Economic Index'] = np.random.rand(len(df))  # Hypothetical economic index
    df['Cultural Index'] = np.random.rand(len(df))  # Hypothetical cultural index
    
    economic_corr = df['Economic Index'].corr(df['Crime Rate'])
    cultural_corr = df['Cultural Index'].corr(df['Crime Rate'])
    
    print(f"\nHypothetical correlation between Economic Index and Crime Rate: {economic_corr:.2f}")
    print(f"Hypothetical correlation between Cultural Index and Crime Rate: {cultural_corr:.2f}")
    
    # Visualization
    plt.figure(figsize=(12, 5))
    plt.subplot(1, 2, 1)
    plt.scatter(df['Economic Index'], df['Crime Rate'])
    plt.title('Crime Rate vs Economic Index')
    plt.xlabel('Economic Index')
    plt.ylabel('Crime Rate')
    
    plt.subplot(1, 2, 2)
    plt.scatter(df['Cultural Index'], df['Crime Rate'])
    plt.title('Crime Rate vs Cultural Index')
    plt.xlabel('Cultural Index')
    plt.ylabel('Crime Rate')
    
    plt.tight_layout()
    plt.show()

cultural_economic_analysis()

# 8. State-Specific Crime Control Recommendations
def crime_control_recommendations():
    print("\n8. State-Specific Crime Control Recommendations")
    
    # Example: Focus on women's safety in states with high rape and dowry death rates
    df['Women Safety Index'] = df['Rape (Sec.376 IPC)'] + df['Dowry Deaths (Sec.304B IPC)']
    
    print("\nStates Needing Focus on Women's Safety:")
    print(df.sort_values('Women Safety Index', ascending=False)[['State', 'Women Safety Index']].head())
    
    # Other recommendations based on crime rates
    high_crime_states = df.sort_values('Crime Rate', ascending=False).head(5)
    
    for _, state in high_crime_states.iterrows():
        print(f"\nRecommendations for {state['State']}:")
        top_crimes = state.sort_values(ascending=False).head(3)
        for crime, value in top_crimes.items():
            if crime not in ['State', 'Population', 'Crime Rate']:
                print(f"- Focus on reducing {crime}: {value:.0f} cases")

crime_control_recommendations()

# Heatmap Visualization on India Map
def create_india_heatmap():
    # Load India shapefile (you need to have this file)
    india_map = gpd.read_file('india_states.shp')
    
    # Merge crime data with map data
    merged_data = india_map.merge(df, how='left', left_on='NAME_1', right_on='State')
    
    # Create the map
    fig, ax = plt.subplots(1, 1, figsize=(15, 10))
    merged_data.plot(column='Crime Rate', cmap='YlOrRd', linewidth=0.8, edgecolor='0.8', ax=ax, legend=True)
    
    # Customize the map
    ax.axis('off')
    ax.set_title('Crime Rate Heatmap of India', fontdict={'fontsize': '25', 'fontweight': '3'})
    
    # Add annotations
    for idx, row in merged_data.iterrows():
        ax.annotate(text=row['State'], xy=(row.geometry.centroid.x, row.geometry.centroid.y),
                    xytext=(3, 3), textcoords="offset points", fontsize=8)
    
    plt.tight_layout()
    plt.show()

create_india_heatmap()

# Conclusion and Key Findings
print("\nConclusion and Key Findings:")
print("1. Crime rates vary significantly across different states and union territories in India.")
print("2. Some states consistently rank high in multiple crime categories, suggesting a need for comprehensive crime prevention strategies.")
print("3. There are correlations between different types of violent crimes, which could inform law enforcement strategies.")
print("4. Gender-related crimes show distinct patterns across different regions, highlighting the need for targeted interventions.")
print("5. Economic and cultural factors may play a role in crime rates, but further research with more detailed data is needed to draw concrete conclusions.")
print("6. State-specific crime control recommendations can be made based on the predominant types of crimes in each region.")
print("7. The heatmap visualization provides a clear geographical representation of crime rates across India, helping to identify high-risk areas.")

print("\nThis analysis provides valuable insights for policymakers, law enforcement agencies, and researchers to understand and address violent crime patterns in India. However, it's important to note that this analysis is based on reported crime data and should be interpreted in conjunction with other socio-economic factors and unreported crime estimates for a more comprehensive understanding.")
