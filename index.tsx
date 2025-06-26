import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, ChevronRight, BookOpen, Calendar as CalendarIcon } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useClassStore } from '@/store/classStore';
import { useTaskStore } from '@/store/taskStore';
import { getCurrentDay, formatTime, getTimeUntil } from '@/utils/dateUtils';
import ClassCard from '@/components/ClassCard';
import TaskItem from '@/components/TaskItem';
import AddButton from '@/components/AddButton';
import EmptyState from '@/components/EmptyState';
import ClassTag from '@/components/ClassTag';

export default function DashboardScreen() {
  const router = useRouter();
  const { classes, getClassesForToday, getNextOccurrence } = useClassStore();
  const { tasks, getTasksDueToday } = useTaskStore();
  
  const todayClasses = getClassesForToday();
  const todayTasks = getTasksDueToday();
  
  // Find the next class
  const findNextClass = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    return todayClasses.find(c => c.startTime > currentTimeString);
  };
  
  const nextClass = findNextClass();
  
  const navigateToClass = (classId: string) => {
    router.push(`/class/${classId}`);
  };
  
  const navigateToCalendar = () => {
    router.push('/calendar');
  };
  
  const navigateToAllClasses = () => {
    router.push('/classes');
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, Student</Text>
          <Text style={styles.date}>{getCurrentDay()}</Text>
        </View>
        
        {/* Class Tags Section */}
        {classes.length > 0 && (
          <View style={styles.classTagsSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.classTagsContainer}
            >
              {classes.map(classItem => (
                <ClassTag 
                  key={classItem.id} 
                  classItem={classItem} 
                  nextOccurrence={getNextOccurrence(classItem)}
                  onPress={() => navigateToClass(classItem.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Classes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            {todayClasses.length > 0 && (
              <TouchableOpacity onPress={navigateToAllClasses}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {todayClasses.length > 0 ? (
            <View>
              {nextClass && (
                <View style={styles.nextClassContainer}>
                  <View style={styles.nextClassHeader}>
                    <View style={styles.nextClassBadge}>
                      <Clock size={14} color={colors.white} />
                      <Text style={styles.nextClassBadgeText}>
                        Next Class in {getTimeUntil(nextClass.startTime)} min
                      </Text>
                    </View>
                  </View>
                  <ClassCard classItem={nextClass} isNext={true} />
                </View>
              )}
              
              {todayClasses
                .filter(c => c.id !== nextClass?.id)
                .map(classItem => (
                  <ClassCard 
                    key={classItem.id} 
                    classItem={classItem} 
                  />
                ))
              }
            </View>
          ) : (
            <EmptyState
              title="No Classes Today"
              message="You don't have any classes scheduled for today. Enjoy your free time!"
              icon={<BookOpen size={32} color={colors.primary} />}
              buttonText="Add Class"
              onButtonPress={() => router.push('/modal?type=class')}
            />
          )}
        </View>
        
        {/* Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Due Today</Text>
            <TouchableOpacity onPress={navigateToCalendar}>
              <Text style={styles.seeAllText}>Calendar</Text>
            </TouchableOpacity>
          </View>
          
          {todayTasks.length > 0 ? (
            <View>
              {todayTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onPress={() => router.push(`/task/${task.id}`)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              title="No Tasks Due Today"
              message="You don't have any homework or tests due today. Great job staying on top of things!"
              icon={<CalendarIcon size={32} color={colors.primary} />}
              buttonText="Add Task"
              onButtonPress={() => router.push('/modal?type=task')}
            />
          )}
        </View>
      </ScrollView>
      
      <AddButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  classTagsSection: {
    marginBottom: 24,
  },
  classTagsContainer: {
    paddingRight: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  nextClassContainer: {
    marginBottom: 16,
  },
  nextClassHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  nextClassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  nextClassBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
