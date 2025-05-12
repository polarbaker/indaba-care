import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  Image
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Divider, 
  Text, 
  List, 
  Badge,
  Button,
  IconButton,
  Appbar,
  Avatar,
  Banner
} from 'react-native-paper';
import { useAuthContext } from '../contexts/AuthContext';
import { useNetworkContext } from '../contexts/NetworkContext';

// Sample data - would be fetched from local database in a real app
const sampleData = {
  childrenCount: 2,
  upcomingSession: {
    date: new Date(Date.now() + 86400000).toLocaleDateString(),
    startTime: '10:00 AM',
    endTime: '2:00 PM',
    nannyName: 'Maria Johnson'
  },
  recentActivities: [
    { id: '1', type: 'photo', description: 'New photo uploaded of Sarah', time: '1 hour ago' },
    { id: '2', type: 'milestone', description: 'Tim completed potty training', time: '2 days ago' },
    { id: '3', type: 'feedback', description: 'Feedback submitted for session on May 10', time: '3 days ago' },
  ],
  resources: [
    { id: '1', title: 'Healthy Meal Ideas for Toddlers', category: 'Nutrition' },
    { id: '2', title: 'Early Reading Activities', category: 'Education' },
  ]
};

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const { user } = useAuthContext();
  const { isConnected } = useNetworkContext();
  const [refreshing, setRefreshing] = useState(false);
  const [syncNeeded, setSyncNeeded] = useState(false);
  
  // In a real app, this would fetch data from the local database
  const loadData = async () => {
    // Simulating data load
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    
    // Check if sync is needed when connected
    if (isConnected) {
      // This would be determined by checking last sync time vs. new changes
      setSyncNeeded(Math.random() > 0.5);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  const handleSync = async () => {
    // Implement sync logic
    setSyncNeeded(false);
  };
  
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Dashboard" />
        <Appbar.Action 
          icon={isConnected ? "wifi" : "wifi-off"} 
          color={isConnected ? "#4CAF50" : "#F44336"}
        />
      </Appbar.Header>
      
      <Banner
        visible={syncNeeded}
        icon="sync"
        actions={[
          { label: 'Sync Now', onPress: handleSync },
          { label: 'Later', onPress: () => setSyncNeeded(false) },
        ]}
      >
        New changes available. Sync now to update your data.
      </Banner>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} />
        }
      >
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <View style={styles.userInfoContainer}>
              <Avatar.Text 
                size={60} 
                label={user?.displayName?.substring(0, 2) || 'U'} 
                color="white"
                style={styles.avatar}
              />
              <View style={styles.userTextContainer}>
                <Title style={styles.welcomeTitle}>
                  Good {getTimeOfDay()}, {user?.displayName || 'User'}
                </Title>
                <Paragraph style={styles.welcomeSubtitle}>
                  Here's what's happening today
                </Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>{sampleData.childrenCount}</Title>
              <Paragraph style={styles.statLabel}>Children</Paragraph>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>3</Title>
              <Paragraph style={styles.statLabel}>Recent Photos</Paragraph>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>1</Title>
              <Paragraph style={styles.statLabel}>Upcoming Session</Paragraph>
            </Card.Content>
          </Card>
        </View>
        
        <Card style={styles.sectionCard}>
          <Card.Title 
            title="Upcoming Childcare Session" 
            left={(props) => <List.Icon {...props} icon="calendar" />}
          />
          <Card.Content>
            <View style={styles.sessionContainer}>
              <View style={styles.sessionDetails}>
                <Paragraph style={styles.sessionDate}>
                  {sampleData.upcomingSession.date}
                </Paragraph>
                <Paragraph style={styles.sessionTime}>
                  {sampleData.upcomingSession.startTime} - {sampleData.upcomingSession.endTime}
                </Paragraph>
                <Paragraph style={styles.sessionNanny}>
                  Nanny: {sampleData.upcomingSession.nannyName}
                </Paragraph>
              </View>
              <Button 
                mode="outlined" 
                icon="calendar-edit" 
                onPress={() => navigation.navigate('Schedule')}
              >
                View
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.sectionCard}>
          <Card.Title 
            title="Recent Activity" 
            left={(props) => <List.Icon {...props} icon="history" />}
            right={(props) => (
              <IconButton 
                {...props} 
                icon="arrow-right" 
                onPress={() => {}} 
              />
            )}
          />
          <Card.Content>
            {sampleData.recentActivities.map(activity => (
              <View key={activity.id}>
                <List.Item
                  title={activity.description}
                  description={activity.time}
                  left={props => {
                    let icon = 'information';
                    if (activity.type === 'photo') icon = 'camera';
                    if (activity.type === 'milestone') icon = 'trophy';
                    if (activity.type === 'feedback') icon = 'message';
                    
                    return <List.Icon {...props} icon={icon} />;
                  }}
                />
                <Divider />
              </View>
            ))}
          </Card.Content>
        </Card>
        
        <Card style={styles.sectionCard}>
          <Card.Title 
            title="Recent Resources" 
            left={(props) => <List.Icon {...props} icon="book-open-variant" />}
            right={(props) => (
              <IconButton 
                {...props} 
                icon="arrow-right" 
                onPress={() => navigation.navigate('Resources')} 
              />
            )}
          />
          <Card.Content>
            {sampleData.resources.map(resource => (
              <View key={resource.id}>
                <List.Item
                  title={resource.title}
                  description={resource.category}
                  left={props => <List.Icon {...props} icon="file-document" />}
                  right={props => <Badge>New</Badge>}
                />
                <Divider />
              </View>
            ))}
            <Button 
              mode="text" 
              icon="view-list" 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Resources')}
            >
              View All Resources
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    elevation: 2,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#3182ce',
    marginRight: 16,
  },
  userTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
  },
  welcomeSubtitle: {
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
    fontSize: 12,
  },
  sectionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sessionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionDetails: {
    flex: 1,
  },
  sessionDate: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  sessionTime: {
    marginVertical: 4,
  },
  sessionNanny: {
    opacity: 0.7,
  },
  viewAllButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
});
