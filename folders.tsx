import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView as RNScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FolderOpen, Search } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useClassStore } from '@/store/classStore';
import { useFolderStore } from '@/store/folderStore';
import FolderItem from '@/components/FolderItem';
import AddButton from '@/components/AddButton';
import EmptyState from '@/components/EmptyState';

export default function FoldersScreen() {
  const router = useRouter();
  const { classes } = useClassStore();
  const { folders, getFoldersByClassId } = useFolderStore();
  
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  const filteredFolders = selectedClassId 
    ? getFoldersByClassId(selectedClassId)
    : folders;
  
  const handleClassSelect = (classId: string) => {
    setSelectedClassId(selectedClassId === classId ? null : classId);
  };
  
  const handleFolderPress = (folderId: string) => {
    router.push(`/folder/${folderId}`);
  };
  
  return (
    <View style={styles.container}>
      {/* Class Filter */}
      <View style={styles.classFilterContainer}>
        <RNScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.classFilterContent}
        >
          <TouchableOpacity
            style={[
              styles.classFilterButton,
              selectedClassId === null && styles.selectedClassButton
            ]}
            onPress={() => setSelectedClassId(null)}
          >
            <Text 
              style={[
                styles.classFilterText,
                selectedClassId === null && styles.selectedClassText
              ]}
            >
              All Folders
            </Text>
          </TouchableOpacity>
          
          {classes.map((classItem) => (
            <TouchableOpacity
              key={classItem.id}
              style={[
                styles.classFilterButton,
                selectedClassId === classItem.id && styles.selectedClassButton,
                { borderLeftColor: colors.classColors[classItem.colorIndex % colors.classColors.length] }
              ]}
              onPress={() => handleClassSelect(classItem.id)}
            >
              <Text 
                style={[
                  styles.classFilterText,
                  selectedClassId === classItem.id && styles.selectedClassText
                ]}
              >
                {classItem.name}
              </Text>
            </TouchableOpacity>
          ))}
        </RNScrollView>
      </View>
      
      {/* Folders List */}
      <View style={styles.foldersContainer}>
        {filteredFolders.length > 0 ? (
          <FlatList
            data={filteredFolders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FolderItem 
                item={{
                  id: item.id,
                  name: item.name,
                  type: 'folder',
                }}
                onPress={() => handleFolderPress(item.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.foldersList}
          />
        ) : (
          <EmptyState
            title="No Folders Found"
            message={selectedClassId 
              ? "You don't have any folders for this class yet." 
              : "You don't have any folders yet. Create one to get started!"
            }
            icon={<FolderOpen size={32} color={colors.primary} />}
            buttonText="Add Folder"
            onButtonPress={() => router.push('/modal?type=folder')}
          />
        )}
      </View>
      
      <AddButton onAddFolder={() => router.push('/modal?type=folder')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  classFilterContainer: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  classFilterContent: {
    paddingHorizontal: 12,
  },
  classFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    marginHorizontal: 4,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  selectedClassButton: {
    backgroundColor: `${colors.primary}20`,
    borderLeftColor: colors.primary,
  },
  classFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  selectedClassText: {
    color: colors.primary,
  },
  foldersContainer: {
    flex: 1,
    padding: 16,
  },
  foldersList: {
    paddingBottom: 100,
  },
});
