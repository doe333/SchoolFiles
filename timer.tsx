import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { Clock, Edit2, Plus, Trash2, Check, X } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useTimerStore } from '@/store/timerStore';
import { formatDuration } from '@/utils/dateUtils';
import { getRandomQuote } from '@/utils/helpers';
import TimerCircle from '@/components/TimerCircle';
import { TimerPresetType } from '@/types';
import { generateId } from '@/utils/helpers';

export default function TimerScreen() {
  const { 
    presets, 
    activePresetId, 
    currentPhase,
    setActivePreset,
    totalFocusTime,
    stats,
    addPreset,
    updatePreset,
    deletePreset
  } = useTimerStore();
  
  const [quote, setQuote] = useState(getRandomQuote());
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [showEditPreset, setShowEditPreset] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  
  const [presetName, setPresetName] = useState('');
  const [workDuration, setWorkDuration] = useState('25');
  const [breakDuration, setBreakDuration] = useState('5');
  const [longBreakDuration, setLongBreakDuration] = useState('15');
  const [cycles, setCycles] = useState('4');
  
  const activePreset = presets.find(p => p.id === activePresetId);
  
  const handleSelectPreset = (presetId: string) => {
    setActivePreset(presetId);
  };
  
  const refreshQuote = () => {
    setQuote(getRandomQuote());
  };
  
  // Get today's focus time
  const getTodayFocusTime = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayStat = stats.find(s => s.date === today);
    return todayStat?.focusTime || 0;
  };
  
  const handleAddPreset = () => {
    setPresetName('');
    setWorkDuration('25');
    setBreakDuration('5');
    setLongBreakDuration('15');
    setCycles('4');
    setShowAddPreset(true);
  };
  
  const handleEditPreset = (preset: TimerPresetType) => {
    setPresetName(preset.name);
    setWorkDuration(preset.workDuration.toString());
    setBreakDuration(preset.breakDuration.toString());
    setLongBreakDuration(preset.longBreakDuration.toString());
    setCycles(preset.cycles.toString());
    setEditingPresetId(preset.id);
    setShowEditPreset(true);
  };
  
  const handleSavePreset = () => {
    if (!presetName.trim()) {
      Alert.alert("Error", "Please enter a preset name");
      return;
    }
    
    const workDurationNum = parseInt(workDuration);
    const breakDurationNum = parseInt(breakDuration);
    const longBreakDurationNum = parseInt(longBreakDuration);
    const cyclesNum = parseInt(cycles);
    
    if (isNaN(workDurationNum) || workDurationNum <= 0) {
      Alert.alert("Error", "Work duration must be a positive number");
      return;
    }
    
    if (isNaN(breakDurationNum) || breakDurationNum <= 0) {
      Alert.alert("Error", "Break duration must be a positive number");
      return;
    }
    
    if (isNaN(longBreakDurationNum) || longBreakDurationNum <= 0) {
      Alert.alert("Error", "Long break duration must be a positive number");
      return;
    }
    
    if (isNaN(cyclesNum) || cyclesNum <= 0) {
      Alert.alert("Error", "Cycles must be a positive number");
      return;
    }
    
    const newPreset: TimerPresetType = {
      id: generateId(),
      name: presetName.trim(),
      workDuration: workDurationNum,
      breakDuration: breakDurationNum,
      longBreakDuration: longBreakDurationNum,
      cycles: cyclesNum,
      isCustom: true
    };
    
    addPreset(newPreset);
    setShowAddPreset(false);
  };
  
  const handleUpdatePreset = () => {
    if (!editingPresetId) return;
    
    if (!presetName.trim()) {
      Alert.alert("Error", "Please enter a preset name");
      return;
    }
    
    const workDurationNum = parseInt(workDuration);
    const breakDurationNum = parseInt(breakDuration);
    const longBreakDurationNum = parseInt(longBreakDuration);
    const cyclesNum = parseInt(cycles);
    
    if (isNaN(workDurationNum) || workDurationNum <= 0) {
      Alert.alert("Error", "Work duration must be a positive number");
      return;
    }
    
    if (isNaN(breakDurationNum) || breakDurationNum <= 0) {
      Alert.alert("Error", "Break duration must be a positive number");
      return;
    }
    
    if (isNaN(longBreakDurationNum) || longBreakDurationNum <= 0) {
      Alert.alert("Error", "Long break duration must be a positive number");
      return;
    }
    
    if (isNaN(cyclesNum) || cyclesNum <= 0) {
      Alert.alert("Error", "Cycles must be a positive number");
      return;
    }
    
    const updatedPreset: TimerPresetType = {
      id: editingPresetId,
      name: presetName.trim(),
      workDuration: workDurationNum,
      breakDuration: breakDurationNum,
      longBreakDuration: longBreakDurationNum,
      cycles: cyclesNum,
      isCustom: true
    };
    
    updatePreset(updatedPreset);
    setShowEditPreset(false);
    setEditingPresetId(null);
  };
  
  const handleDeletePreset = (presetId: string) => {
    // Don't allow deleting the active preset
    if (presetId === activePresetId) {
      Alert.alert(
        "Cannot Delete Active Preset",
        "Please select a different preset before deleting this one."
      );
      return;
    }
    
    // Don't allow deleting all presets
    if (presets.length <= 1) {
      Alert.alert(
        "Cannot Delete Last Preset",
        "You must have at least one timer preset."
      );
      return;
    }
    
    Alert.alert(
      "Delete Preset",
      "Are you sure you want to delete this preset?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => deletePreset(presetId),
          style: "destructive"
        }
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Timer Section */}
        <View style={styles.timerSection}>
          <TimerCircle />
          
          {currentPhase !== 'work' && (
            <TouchableOpacity 
              style={styles.quoteContainer}
              onPress={refreshQuote}
            >
              <Text style={styles.quote}>"{quote}"</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDuration(getTodayFocusTime())}</Text>
              <Text style={styles.statLabel}>Focus Time</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDuration(totalFocusTime)}</Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>
          </View>
        </View>
        
        {/* Presets Section */}
        <View style={styles.presetsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Timer Presets</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddPreset}
            >
              <Plus size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.presetsList}>
            {presets.map((preset) => (
              <View key={preset.id} style={styles.presetWrapper}>
                <TouchableOpacity
                  style={[
                    styles.presetCard,
                    preset.id === activePresetId && styles.activePresetCard
                  ]}
                  onPress={() => handleSelectPreset(preset.id)}
                >
                  <View style={styles.presetHeader}>
                    <Text 
                      style={[
                        styles.presetName,
                        preset.id === activePresetId && styles.activePresetText
                      ]}
                    >
                      {preset.name}
                    </Text>
                    
                    {preset.isCustom && (
                      <View style={styles.presetActions}>
                        <TouchableOpacity 
                          style={styles.editButton}
                          onPress={() => handleEditPreset(preset)}
                        >
                          <Edit2 size={14} color={preset.id === activePresetId ? colors.white : colors.darkGray} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.deletePresetButton}
                          onPress={() => handleDeletePreset(preset.id)}
                        >
                          <Trash2 size={14} color={preset.id === activePresetId ? colors.white : colors.error} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.presetDetails}>
                    <View style={styles.presetDetail}>
                      <Text 
                        style={[
                          styles.presetDetailValue,
                          preset.id === activePresetId && styles.activePresetText
                        ]}
                      >
                        {preset.workDuration}m
                      </Text>
                      <Text 
                        style={[
                          styles.presetDetailLabel,
                          preset.id === activePresetId && styles.activePresetText
                        ]}
                      >
                        Work
                      </Text>
                    </View>
                    
                    <View style={styles.presetDetail}>
                      <Text 
                        style={[
                          styles.presetDetailValue,
                          preset.id === activePresetId && styles.activePresetText
                        ]}
                      >
                        {preset.breakDuration}m
                      </Text>
                      <Text 
                        style={[
                          styles.presetDetailLabel,
                          preset.id === activePresetId && styles.activePresetText
                        ]}
                      >
                        Break
                      </Text>
                    </View>
                    
                    <View style={styles.presetDetail}>
                      <Text 
                        style={[
                          styles.presetDetailValue,
                          preset.id === activePresetId && styles.activePresetText
                        ]}
                      >
                        {preset.cycles}
                      </Text>
                      <Text 
                        style={[
                          styles.presetDetailLabel,
                          preset.id === activePresetId && styles.activePresetText
                        ]}
                      >
                        Cycles
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Add Preset Modal */}
      {showAddPreset && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Preset</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowAddPreset(false)}
              >
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preset Name</Text>
                <TextInput
                  style={styles.input}
                  value={presetName}
                  onChangeText={setPresetName}
                  placeholder="Enter preset name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Work (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={workDuration}
                    onChangeText={setWorkDuration}
                    keyboardType="number-pad"
                    placeholder="25"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Break (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={breakDuration}
                    onChangeText={setBreakDuration}
                    keyboardType="number-pad"
                    placeholder="5"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Long Break (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={longBreakDuration}
                    onChangeText={setLongBreakDuration}
                    keyboardType="number-pad"
                    placeholder="15"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Cycles</Text>
                  <TextInput
                    style={styles.input}
                    value={cycles}
                    onChangeText={setCycles}
                    keyboardType="number-pad"
                    placeholder="4"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddPreset(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSavePreset}
              >
                <Text style={styles.saveButtonText}>Create Preset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      {/* Edit Preset Modal */}
      {showEditPreset && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Preset</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowEditPreset(false)}
              >
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preset Name</Text>
                <TextInput
                  style={styles.input}
                  value={presetName}
                  onChangeText={setPresetName}
                  placeholder="Enter preset name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Work (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={workDuration}
                    onChangeText={setWorkDuration}
                    keyboardType="number-pad"
                    placeholder="25"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Break (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={breakDuration}
                    onChangeText={setBreakDuration}
                    keyboardType="number-pad"
                    placeholder="5"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Long Break (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={longBreakDuration}
                    onChangeText={setLongBreakDuration}
                    keyboardType="number-pad"
                    placeholder="15"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Cycles</Text>
                  <TextInput
                    style={styles.input}
                    value={cycles}
                    onChangeText={setCycles}
                    keyboardType="number-pad"
                    placeholder="4"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditPreset(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdatePreset}
              >
                <Text style={styles.saveButtonText}>Update Preset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    paddingBottom: 40,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  quoteContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    width: '100%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
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
  presetsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsList: {
    gap: 12,
  },
  presetWrapper: {
    marginBottom: 12,
  },
  presetCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activePresetCard: {
    backgroundColor: colors.primary,
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  activePresetText: {
    color: colors.white,
  },
  presetActions: {
    flexDirection: 'row',
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  deletePresetButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.error}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetDetail: {
    alignItems: 'center',
  },
  presetDetailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  presetDetailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.offWhite,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
  },
});
