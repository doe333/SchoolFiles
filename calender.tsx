import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import { useClassStore } from '@/store/classStore';
import { getCurrentDate, formatDate, getCurrentWeekDates, isToday } from '@/utils/dateUtils';
import TaskItem from '@/components/TaskItem';
import AddButton from '@/components/AddButton';
import EmptyState from '@/components/EmptyState';
import ClassCard from '@/components/ClassCard';

export default function CalendarScreen() {
  const router = useRouter();
  const { tasks, getTasksByDate } = useTaskStore();
  const { classes, getClassesForToday } = useClassStore();
  
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [weekDates, setWeekDates] = useState(getCurrentWeekDates());
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<string | null>(null);
  const [showClasses, setShowClasses] = useState(true);
  
  // Get classes for the selected date
  const getClassesForDate = (date: string) => {
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    
    return classes.filter(classItem => {
      // For weekly or daily repetition, check if the day matches
      if (!classItem.repetition || classItem.repetition === 'weekly' || classItem.repetition === 'daily') {
        if (!classItem.days.includes(dayName)) {
          return false;
        }
        
        if (classItem.repetition === 'daily') {
          return true;
        }
        
        return true; // Weekly and the day matches
      }
      
      // For every-other-day patterns
      if (classItem.repetition === 'every-other-day' || classItem.repetition === 'every-other-day-except-weekends') {
        const startOfYear = new Date(dateObj.getFullYear(), 0, 1);
        const daysSinceStartOfYear = Math.floor((dateObj.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        
        // If it's every other day except weekends and today is a weekend, don't show
        if (classItem.repetition === 'every-other-day-except-weekends') {
          const day = dateObj.getDay();
          if (day === 0 || day === 6) { // 0 = Sunday, 6 = Saturday
            return false;
          }
        }
        
        // Show on odd-numbered days since start of year for every-other-day pattern
        return daysSinceStartOfYear % 2 === 1;
      }
      
      return false;
    });
  };
  
  const classesForSelectedDate = getClassesForDate(selectedDate);
  
  const tasksForSelectedDate = getTasksByDate(selectedDate)
    .filter(task => {
      if (filterType && task.type !== filterType) return false;
      if (filterClass && task.classId !== filterClass) return false;
      return true;
    })
    .sort((a, b) => {
      // Sort by priority (high -> medium -> low)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  
  const navigateToPreviousWeek = () => {
    const firstDate = new Date(weekDates[0]);
    firstDate.setDate(firstDate.getDate() - 7);
    
    const newWeekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDate);
      date.setDate(firstDate.getDate() + i);
      newWeekDates.push(date.toISOString().split('T')[0]);
    }
    
    setWeekDates(newWeekDates);
  };
  
  const navigateToNextWeek = () => {
    const firstDate = new Date(weekDates[0]);
    firstDate.setDate(firstDate.getDate() + 7);
    
    const newWeekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDate);
      date.setDate(firstDate.getDate() + i);
      newWeekDates.push(date.toISOString().split('T')[0]);
    }
    
    setWeekDates(newWeekDates);
  };
  
  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  const getDayNumber = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };
  
  const toggleFilterType = (type: string) => {
    setFilterType(filterType === type ? null : type);
  };
  
  const toggleFilterClass = (classId: string) => {
    setFilterClass(filterClass === classId ? null : classId);
  };
  
  return (
    <View style={styles.container}>
      {/* Week Selector */}
      <View style={styles.weekSelector}>
        <TouchableOpacity 
          style={styles.weekButton} 
          onPress={navigateToPreviousWeek}
        >
          <ChevronLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.weekText}>
          {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
        </Text>
        
        <TouchableOpacity 
          style={styles.weekButton} 
          onPress={navigateToNextWeek}
        >
          <ChevronRight size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      
      {/* Day Selector */}
      <View style={styles.daySelector}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayScrollContent}
        >
          {weekDates.map((date) => (
            <TouchableOpacity
              key={date}
              style={[
                styles.dayButton,
                selectedDate === date && styles.selectedDayButton,
                isToday(date) && styles.todayButton
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text 
                style={[
                  styles.dayName,
                  selectedDate === date && styles.selectedDayText,
                  isToday(date) && styles.todayText
                ]}
              >
                {getDayName(date)}
              </Text>
              <Text 
                style={[
                  styles.dayNumber,
                  selectedDate === date && styles.selectedDayText,
                  isToday(date) && styles.todayText
                ]}
              >
                {getDayNumber(date)}
              </Text>
              
              {/* Task indicator dots */}
              {getTasksByDate(date).length > 0 && (
                <View 
                  style={[
                    styles.taskIndicator,
                    selectedDate === date && styles.selectedTaskIndicator
                  ]} 
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* View Toggle */}
      <View style={styles.viewToggleContainer}>
        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            showClasses && styles.activeViewToggleButton
          ]}
          onPress={() => setShowClasses(true)}
        >
          <Text 
            style={[
              styles.viewToggleText,
              showClasses && styles.activeViewToggleText
            ]}
          >
            Classes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            !showClasses && styles.activeViewToggleButton
          ]}
          onPress={() => setShowClasses(false)}
        >
          <Text 
            style={[
              styles.viewToggleText,
              !showClasses && styles.activeViewToggleText
            ]}
          >
            Tasks
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Filters */}
      {!showClasses && (
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'homework' && styles.activeFilterButton
              ]}
              onPress={() => toggleFilterType('homework')}
            >
              <Text 
                style={[
                  styles.filterText,
                  filterType === 'homework' && styles.activeFilterText
                ]}
              >
                Homework
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'test' && styles.activeFilterButton
              ]}
              onPress={() => toggleFilterType('test')}
            >
              <Text 
                style={[
                  styles.filterText,
                  filterType === 'test' && styles.activeFilterText
                ]}
              >
                Tests
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'project' && styles.activeFilterButton
              ]}
              onPress={() => toggleFilterType('project')}
            >
              <Text 
                style={[
                  styles.filterText,
                  filterType === 'project' && styles.activeFilterText
                ]}
              >
                Projects
              </Text>
            </TouchableOpacity>
            
            {classes.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                style={[
                  styles.filterButton,
                  filterClass === classItem.id && styles.activeFilterButton
                ]}
                onPress={() => toggleFilterClass(classItem.id)}
              >
                <Text 
                  style={[
                    styles.filterText,
                    filterClass === classItem.id && styles.activeFilterText
                  ]}
                >
                  {classItem.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Content List */}
      <View style={styles.contentContainer}>
        <Text style={styles.dateHeader}>{formatDate(selectedDate)}</Text>
        
        {showClasses ? (
          // Classes for selected date
          classesForSelectedDate.length > 0 ? (
            <FlatList
              data={classesForSelectedDate}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ClassCard 
                  classItem={item} 
                  onPress={() => router.push(`/class/${item.id}`)}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentList}
            />
          ) : (
            <EmptyState
              title="No Classes"
              message={`You don't have any classes scheduled for ${formatDate(selectedDate)}.`}
              icon={<Filter size={32} color={colors.primary} />}
              buttonText="Add Class"
              onButtonPress={() => router.push('/modal?type=class')}
            />
          )
        ) : (
          // Tasks for selected date
          tasksForSelectedDate.length > 0 ? (
            <FlatList
              data={tasksForSelectedDate}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TaskItem 
                  task={item} 
                  onPress={() => router.push(`/task/${item.id}`)}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentList}
            />
          ) : (
            <EmptyState
              title="No Tasks"
              message={`You don't have any tasks scheduled for ${formatDate(selectedDate)}.`}
              icon={<Filter size={32} color={colors.primary} />}
              buttonText="Add Task"
              onButtonPress={() => router.push('/modal?type=task')}
            />
          )
        )}
      </View>
      
      <AddButton 
        onAddClass={() => router.push('/modal?type=class')}
        onAddTask={() => router.push('/modal?type=task')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  weekButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  weekText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  daySelector: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  dayScrollContent: {
    paddingHorizontal: 8,
  },
  dayButton: {
    width: 60,
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    backgroundColor: colors.offWhite,
  },
  selectedDayButton: {
    backgroundColor: colors.primary,
  },
  todayButton: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  selectedDayText: {
    color: colors.white,
  },
  todayText: {
    color: colors.primary,
  },
  taskIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  selectedTaskIndicator: {
    backgroundColor: colors.white,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeViewToggleButton: {
    backgroundColor: `${colors.primary}20`,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeViewToggleText: {
    color: colors.primary,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  filtersScrollContent: {
    paddingHorizontal: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    marginHorizontal: 4,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeFilterText: {
    color: colors.white,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  contentList: {
    paddingBottom: 100,
  },
});
