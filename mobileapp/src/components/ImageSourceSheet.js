import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SHEET_BG = '#1c1c1e';
const ICON_BG = '#3a3a3c';
const LABEL_COLOR = '#e5e5ea';
const HANDLE_COLOR = '#636366';

function SheetOption({ icon, label, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.iconCircle}>
        <MaterialIcons name={icon} size={28} color="#ffffff" />
      </View>
      <Text style={styles.optionLabel}>{label}</Text>
    </Pressable>
  );
}

export default function ImageSourceSheet({ visible, onClose, onCamera, onGallery }) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const dismiss = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onClose();
        if (callback) {
          setTimeout(callback, Platform.OS === 'ios' ? 50 : 0);
        }
      }
    });
  };

  const handleCamera = () => dismiss(onCamera);
  const handleGallery = () => dismiss(onGallery);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => dismiss()}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => dismiss()} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>Add photo</Text>
          <View style={styles.optionsRow}>
            <SheetOption icon="photo-camera" label="Camera" onPress={handleCamera} />
            <SheetOption icon="photo-library" label="Gallery" onPress={handleGallery} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheet: {
    backgroundColor: SHEET_BG,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    paddingHorizontal: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: HANDLE_COLOR,
    marginBottom: 12,
  },
  title: {
    color: LABEL_COLOR,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
    paddingBottom: 8,
  },
  option: {
    alignItems: 'center',
    minWidth: 88,
  },
  optionPressed: {
    opacity: 0.75,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  optionLabel: {
    color: LABEL_COLOR,
    fontSize: 13,
    fontWeight: '500',
  },
});
