import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { fetchGlucoseReadings } from '../services/api';
import { colors } from '../utils/theme';

const { width } = Dimensions.get('window');

const ReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [glucoseData, setGlucoseData] = useState([]);
  const [activeTab, setActiveTab] = useState('glucose');
  const [timeFrame, setTimeFrame] = useState('daily');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const data = await fetchGlucoseReadings();
      setGlucoseData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };
  
  // Process data based on the selected time frame
  const processData = () => {
    if (!glucoseData.length) return { labels: [], datasets: [{ data: [] }] };
    
    const now = new Date();
    let filteredData = [...glucoseData];
    
    // Filter data based on timeFrame
    if (timeFrame === 'daily') {
      const today = now.toDateString();
      filteredData = glucoseData.filter(reading => 
        new Date(reading.timestamp).toDateString() === today
      );
    } else if (timeFrame === 'weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      filteredData = glucoseData.filter(reading => 
        new Date(reading.timestamp) >= weekAgo
      );
    } else if (timeFrame === 'monthly') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      filteredData = glucoseData.filter(reading => 
        new Date(reading.timestamp) >= monthAgo
      );
    }
    
    // Group and format data
    if (timeFrame === 'daily') {
      // For daily view, show by hour
      const hourData = Array(24).fill(0).map((_, i) => ({ hour: i, values: [] }));
      
      filteredData.forEach(reading => {
        const hour = new Date(reading.timestamp).getHours();
        hourData[hour].values.push(reading.value);
      });
      
      const labels = hourData
        .filter(d => d.values.length > 0)
        .map(d => `${d.hour}:00`);
      
      const data = hourData
        .filter(d => d.values.length > 0)
        .map(d => {
          // Average for that hour
          return d.values.reduce((sum, value) => sum + value, 0) / d.values.length;
        });
      
      return {
        labels,
        datasets: [{ data }]
      };
    } else if (timeFrame === 'weekly') {
      // For weekly view, group by day
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayData = Array(7).fill(0).map((_, i) => ({ day: i, values: [] }));
      
      filteredData.forEach(reading => {
        const dayIndex = new Date(reading.timestamp).getDay();
        dayData[dayIndex].values.push(reading.value);
      });
      
      const labels = dayData
        .filter(d => d.values.length > 0)
        .map(d => days[d.day]);
      
      const data = dayData
        .filter(d => d.values.length > 0)
        .map(d => {
          return d.values.reduce((sum, value) => sum + value, 0) / d.values.length;
        });
      
      return {
        labels,
        datasets: [{ data }]
      };
    } else {
      // For monthly view, group by week
      const monthData = Array(5).fill(0).map((_, i) => ({ week: i + 1, values: [] }));
      
      filteredData.forEach(reading => {
        const date = new Date(reading.timestamp);
        const weekOfMonth = Math.ceil(date.getDate() / 7);
        const weekIndex = Math.min(weekOfMonth - 1, 4); // Cap at 4 (5th week)
        monthData[weekIndex].values.push(reading.value);
      });
      
      const labels = monthData
        .filter(d => d.values.length > 0)
        .map(d => `Week ${d.week}`);
      
      const data = monthData
        .filter(d => d.values.length > 0)
        .map(d => {
          return d.values.reduce((sum, value) => sum + value, 0) / d.values.length;
        });
      
      return {
        labels,
        datasets: [{ data }]
      };
    }
  };
  
  // Calculate statistics
  const getStats = () => {
    if (!glucoseData.length) return { avg: 0, inRange: 0, high: 0, low: 0 };
    
    const values = glucoseData.map(r => r.value);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    
    const inRange = values.filter(v => v >= 70 && v <= 180).length;
    const high = values.filter(v => v > 180).length;
    const low = values.filter(v => v < 70).length;
    
    const total = values.length;
    
    return {
      avg,
      inRange: Math.round((inRange / total) * 100),
      high: Math.round((high / total) * 100),
      low: Math.round((low / total) * 100)
    };
  };
  
  const chartData = processData();
  const stats = getStats();
  
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'glucose' && styles.activeTab]}
        onPress={() => setActiveTab('glucose')}
      >
        <Icon 
          name="analytics-outline" 
          size={20} 
          color={activeTab === 'glucose' ? colors.primary : colors.text.secondary} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'glucose' && styles.activeTabText
        ]}>Glucose</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
        onPress={() => setActiveTab('insights')}
      >
        <Icon 
          name="pie-chart-outline" 
          size={20} 
          color={activeTab === 'insights' ? colors.primary : colors.text.secondary} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'insights' && styles.activeTabText
        ]}>Insights</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
        onPress={() => setActiveTab('summary')}
      >
        <Icon 
          name="document-text-outline" 
          size={20} 
          color={activeTab === 'summary' ? colors.primary : colors.text.secondary} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'summary' && styles.activeTabText
        ]}>Summary</Text>
      </TouchableOpacity>
    </View>
    
  );


  {/* Carb Analysis Button */}
<View style={styles.actionButtonContainer}>
  <TouchableOpacity 
    style={styles.analysisButton}
    onPress={() => navigation.navigate('CarbAnalysis')}
  >
    <Icon name="nutrition-outline" size={20} color="#fff" />
    <Text style={styles.analysisButtonText}>Carb Analysis</Text>
  </TouchableOpacity>
</View>

  


  const renderTimeFrameSelection = () => (
    <View style={styles.timeFrameContainer}>
      <TouchableOpacity
        style={[styles.timeFrameOption, timeFrame === 'daily' && styles.activeTimeFrame]}
        onPress={() => setTimeFrame('daily')}
      >
        <Text style={[
          styles.timeFrameText,
          timeFrame === 'daily' && styles.activeTimeFrameText
        ]}>Daily</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.timeFrameOption, timeFrame === 'weekly' && styles.activeTimeFrame]}
        onPress={() => setTimeFrame('weekly')}
      >
        <Text style={[
          styles.timeFrameText,
          timeFrame === 'weekly' && styles.activeTimeFrameText
        ]}>Weekly</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.timeFrameOption, timeFrame === 'monthly' && styles.activeTimeFrame]}
        onPress={() => setTimeFrame('monthly')}
      >
        <Text style={[
          styles.timeFrameText,
          timeFrame === 'monthly' && styles.activeTimeFrameText
        ]}>Monthly</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderGlucoseTab = () => (
    <View style={styles.tabContent}>
      {renderTimeFrameSelection()}
      
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Glucose Trend</Text>
        {chartData.labels.length > 0 ? (
          <LineChart
            data={{
              labels: chartData.labels,
              datasets: [{
                data: chartData.datasets[0].data,
              }]
            }}
            width={width - 50}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(81, 145, 250, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: colors.primary
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="analytics" size={40} color={colors.text.secondary} />
            <Text style={styles.noDataText}>No data available for this time period</Text>
          </View>
        )}
        
        <View style={styles.rangeContainer}>
          <View style={styles.rangeItem}>
            <View style={[styles.rangeDot, { backgroundColor: colors.danger }]} />
            <Text style={styles.rangeText}>High: &gt; 180 mg/dL</Text>
          </View>
          <View style={styles.rangeItem}>
            <View style={[styles.rangeDot, { backgroundColor: colors.success }]} />
            <Text style={styles.rangeText}>Target: 70-180 mg/dL</Text>
          </View>
          <View style={styles.rangeItem}>
            <View style={[styles.rangeDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.rangeText}>Low: &lt; 70 mg/dL</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.avg}</Text>
          <Text style={styles.statLabel}>Average mg/dL</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.inRange}%</Text>
          <Text style={styles.statLabel}>Time in Range</Text>
        </View>
      </View>
    </View>

    
  );
  
  const renderInsightsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Glucose Distribution</Text>
        
        {glucoseData.length > 0 ? (
          <>
            <PieChart
              data={[
                {
                  name: 'Low',
                  population: stats.low,
                  color: colors.warning,
                  legendFontColor: colors.text.primary,
                  legendFontSize: 12
                },
                {
                  name: 'In Range',
                  population: stats.inRange,
                  color: colors.success,
                  legendFontColor: colors.text.primary,
                  legendFontSize: 12
                },
                {
                  name: 'High',
                  population: stats.high,
                  color: colors.danger,
                  legendFontColor: colors.text.primary,
                  legendFontSize: 12
                }
              ]}
              width={width - 50}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            
            <View style={styles.distributionStats}>
              <View style={styles.distributionItem}>
                <Text style={styles.distributionPercent}>{stats.inRange}%</Text>
                <Text style={styles.distributionLabel}>In Range</Text>
              </View>
              <View style={styles.distributionItem}>
                <Text style={styles.distributionPercent}>{stats.high}%</Text>
                <Text style={styles.distributionLabel}>High</Text>
              </View>
              <View style={styles.distributionItem}>
                <Text style={styles.distributionPercent}>{stats.low}%</Text>
                <Text style={styles.distributionLabel}>Low</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="pie-chart" size={40} color={colors.text.secondary} />
            <Text style={styles.noDataText}>No data available for insights</Text>
          </View>
        )}
      </View>
      
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Average by Time of Day</Text>
        
        {glucoseData.length > 0 ? (
          <BarChart
            data={{
              labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
              datasets: [{
                data: [
                  getTimeOfDayAverage(0, 6),
                  getTimeOfDayAverage(6, 12),
                  getTimeOfDayAverage(12, 18),
                  getTimeOfDayAverage(18, 24)
                ]
              }]
            }}
            width={width - 50}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(72, 121, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              barPercentage: 0.7,
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="bar-chart" size={40} color={colors.text.secondary} />
            <Text style={styles.noDataText}>No data available</Text>
          </View>
        )}
      </View>
    </View>
  );
  
  const getTimeOfDayAverage = (startHour, endHour) => {
    if (!glucoseData.length) return 0;
    
    const readings = glucoseData.filter(reading => {
      const hour = new Date(reading.timestamp).getHours();
      return hour >= startHour && hour < endHour;
    });
    
    if (!readings.length) return 0;
    
    const sum = readings.reduce((total, reading) => total + reading.value, 0);
    return sum / readings.length;
  };
  
  const renderSummaryTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly Summary</Text>
        
        <View style={styles.summaryItem}>
          <View style={styles.summaryIconContainer}>
            <Icon name="pulse" size={24} color={colors.primary} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>Average Glucose</Text>
            <Text style={styles.summaryValue}>{stats.avg} mg/dL</Text>
          </View>
        </View>
        
        <View style={styles.summaryItem}>
          <View style={styles.summaryIconContainer}>
            <Icon name="timer" size={24} color={colors.success} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>Time in Range</Text>
            <Text style={styles.summaryValue}>{stats.inRange}%</Text>
          </View>
        </View>
        
        <View style={styles.summaryItem}>
          <View style={styles.summaryIconContainer}>
            <Icon name="trending-up" size={24} color={colors.danger} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>High Readings</Text>
            <Text style={styles.summaryValue}>{stats.high}%</Text>
          </View>
        </View>
        
        <View style={styles.summaryItem}>
          <View style={styles.summaryIconContainer}>
            <Icon name="trending-down" size={24} color={colors.warning} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>Low Readings</Text>
            <Text style={styles.summaryValue}>{stats.low}%</Text>
          </View>
        </View>
        
        <View style={styles.summaryItem}>
          <View style={styles.summaryIconContainer}>
            <Icon name="analytics" size={24} color={colors.info || '#64D2FF'} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>Total Readings</Text>
            <Text style={styles.summaryValue}>{glucoseData.length}</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.exportButton}
        onPress={() => {
          // Handle export functionality
          console.log('Export report');
        }}
      >
        <Icon name="download-outline" size={20} color="#fff" />
        <Text style={styles.exportButtonText}>Export Report</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <View style={styles.placeholder} />
      </View>
      
      {renderTabs()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {activeTab === 'glucose' && renderGlucoseTab()}
          {activeTab === 'insights' && renderInsightsTab()}
          {activeTab === 'summary' && renderSummaryTab()}
          
          <View style={styles.bottomSpace} />
        </ScrollView>
      )}
      
      {/* Predict Blood Glucose Button */}
      <TouchableOpacity 
        style={styles.predictButton}
        onPress={() => navigation.navigate('Prediction')}
      >
        <Icon name="analytics" size={20} color="#fff" />
        <Text style={styles.predictButtonText}>Predict Blood Glucose</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(81, 145, 250, 0.1)',
  },
  tabText: {
    marginLeft: 5,
    fontSize: 14,
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 15,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 2,
    marginBottom: 15,
  },
  timeFrameOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTimeFrame: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  timeFrameText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  activeTimeFrameText: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text.primary,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  noDataText: {
    marginTop: 10,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  rangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  rangeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  rangeText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  distributionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  distributionItem: {
    alignItems: 'center',
  },
  distributionPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  distributionLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 5,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text.primary,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(81, 145, 250, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  exportButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.text.secondary,
  },
  bottomSpace: {
    height: 100,
  },
  predictButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  predictButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },

  actionButtonContainer: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    zIndex: 999,
  },
  analysisButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  analysisButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ReportsScreen;