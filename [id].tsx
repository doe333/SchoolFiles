import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Clock, MapPin, Edit, Trash2, Book, FolderOpen, Calendar } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useClassStore } from '@/store/classStore';
import { useTaskStore } from '@/store/taskStore';
import { useFolderStore } from '@/store/folderStore';
import { formatTime } from '@/utils/dateUtils';
import TaskItem from '@/components/TaskItem';
import FolderItem from '@/components/FolderItem';
import AddButton from '@/components/AddButton';

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { getClassById, deleteClass } = useClassStore();
  const { getTasksByClassId } = useTaskStore();
  const { getFoldersByClassId } = useFolderStore();
  
  const classItem = getClassById(id);
  const tasks = getTasksByClassId(id);
  const folders = getFoldersByClassId(id);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'folders'>('overview');
  
  if (!classItem) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Class not found</Text>
      </View>
    );
  }
  
  const handleDeleteClass = () => {
    deleteClass(id);
    router.back();
  };
  
  const handleEditClass = () => {
    // Navigate to edit class screen
    router.push(`/edit-class/${id}`);
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.overviewContainer}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Clock size={20} color={colors.darkGray} />
                <Text style={styles.infoText}>
                  {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Calendar size={20} color={colors.darkGray} />
                <Text style={styles.infoText}>
                  {classItem.days.join(', ')}
                </Text>
              </View>
              
              {classItem.location && (
                <View style={styles.infoRow}>
                  <MapPin size={20} color={colors.darkGray} />
                  <Text style={styles.infoText}>{classItem.location}</Text>
                </View>
              )}
              
              {classItem.professor && (
                <View style={styles.infoRow}>
                  <Book size={20} color={colors.darkGray} />
                  <Text style={styles.infoText}>{classItem.professor}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleEditClass}
              >
                <Edit size={20} color={colors.primary} />
                <Text style={styles.actionText}>Edit Class</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeleteClass}
              >
                <Trash2 size={20} color={colors.error} />
                <Text style={[styles.actionText, styles.deleteText]}>Delete Class</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{tasks.length}</Text>
                <Text style={styles.statLabel}>Tasks</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{folders.length}</Text>
                <Text style={styles.statLabel}>Folders</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {tasks.filter(t => t.status === 'completed').length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </View>
        );
        
      case 'tasks':
        return (
          <View style={styles.tasksContainer}>
            {tasks.length > 0 ? (
              tasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onPress={() => router.push(`/task/${task.id}`)}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Calendar size={40} color={colors.primary} />
                <Text style={styles.emptyTitle}>No Tasks</Text>
                <Text style={styles.emptyText}>
                  You don't have any tasks for this class yet.
                </Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => router.push(`/modal?type=task`)}
                >
                  <Text style={styles.emptyButtonText}>Add Task</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
        
      case 'folders':
        return (
          <View style={styles.foldersContainer}>
            {folders.length > 0 ? (
              folders.map(folder => (
                <FolderItem 
                  key={folder.id} 
                  item={{
                    id: folder.id,
                    name: folder.name,
                    type: 'folder',
                  }}
                  onPress={() => router.push(`/folder/${folder.id}`)}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <FolderOpen size={40} color={colors.primary} />
                <Text style={styles.emptyTitle}>No Folders</Text>
                <Text style={styles.emptyText}>
                  You don't have any folders for this class yet.
                </Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => router.push(`/modal?type=folder`)}
                >
                  <Text style={styles.emptyButtonText}>Add Folder</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: classItem.name,
          headerTintColor: colors.white,
          headerStyle: {
            backgroundColor: colors.classColors[classItem.colorIndex % colors.classColors.length],
          },
        }} 
      />
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'overview' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('overview')}
        >
          <Text 
            style={[
              styles.tabText,
              activeTab === 'overview' && styles.activeTabText
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'tasks' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text 
            style={[
              styles.tabText,
              activeTab === 'tasks' && styles.activeTabText
            ]}
          >
            Tasks
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'folders' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('folders')}
        >
          <Text 
            style={[
              styles.tabText,
              activeTab === 'folders' && styles.activeTabText
            ]}
          >
            Folders
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>
      
      <AddButton 
        onAddTask={() => router.push(`/modal?type=task`)}
        onAddFolder={() => router.push(`/modal?type=folder`)}
        onAddNote={() => router.push(`/modal?type=note`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  errorText: {
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  overviewContainer: {
    gap: 20,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  deleteButton: {
    backgroundColor: `${colors.error}10`,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 8,
  },
  deleteText: {
    color: colors.error,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.lightGray,
  },
  tasksContainer: {
    gap: 12,
  },
  foldersContainer: {
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
  },
});
