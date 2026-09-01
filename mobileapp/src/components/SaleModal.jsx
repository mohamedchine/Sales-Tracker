import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Image,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import ImageSourceSheet from './ImageSourceSheet';
import ImageModal from './ImageModal';
import { processPickedImage, deleteImage } from '../utils/imageOptimizer';
import colors from '../theme/colors';

const imageOptimizationOptions = {
  maxWidth: 1200,
  compress: 0.6,
};

export default function SaleModal({ visible, sale, onSave, onCancel, isLoading }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [modalUri, setModalUri] = useState(null);
  const [showImageSheet, setShowImageSheet] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    if (sale) {
      setName(sale.name || '');
      setPrice(String(sale.price ?? '')); 
      setImageUri(sale.imageUri || null);
      setRemoveImage(false);
    } else {
      setName('');
      setPrice('');
      setImageUri(null);
      setRemoveImage(false);
    }
  }, [sale, visible]);

  const applyPickedImage = async (result) => {
    if (!result.canceled && result.assets?.[0]?.uri) {
      setIsOptimizing(true);
      try {
        await processPickedImage(
          result,
          (permanentUri) => {
            setImageUri(permanentUri);
            setRemoveImage(false);
            setShowImageSheet(false);
          },
          () => Alert.alert('Image Processing Error', 'Failed to process the image. Please try again.'),
          imageOptimizationOptions,
          imageUri
        );
      } finally {
        setIsOptimizing(false);
      }
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to add sale images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    await applyPickedImage(result);
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take sale photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    await applyPickedImage(result);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }

    if (price === '' || Number.isNaN(Number(price))) {
      Alert.alert('Error', 'Price must be a valid number');
      return;
    }

    onSave({
      name: name.trim(),
      price: Number(price),
      imageUri: removeImage ? null : imageUri,
      removeImage,
    });
  };

  const previewUri = removeImage ? null : imageUri;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.modalBody} onPress={(e) => e.stopPropagation()}>
          <Pressable style={styles.close} onPress={onCancel}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>

          <Text style={styles.title}>{sale ? 'Edit Sale' : 'Add Sale'}</Text>

          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. iPhone 15"
            placeholderTextColor={colors.muted}
            editable={!isLoading}
          />

          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="e.g. 799.99"
            placeholderTextColor={colors.muted}
            editable={!isLoading}
          />

          <Text style={styles.label}>Image</Text>

          {isOptimizing ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Optimizing image...</Text>
            </View>
          ) : null}

          {!previewUri && !isOptimizing ? (
            <Pressable style={styles.uploadBtn} onPress={() => setShowImageSheet(true)}>
              <Text style={styles.uploadText}>{sale && !removeImage ? 'Add image' : 'Upload image'}</Text>
            </Pressable>
          ) : null}

          {previewUri ? (
            <View style={styles.imageRow}>
              <Pressable onPress={() => setModalUri(previewUri)}>
                <Image source={{ uri: previewUri }} style={styles.thumb} resizeMode="cover" />
              </Pressable>
              <View style={styles.imageActions}>
                <Pressable style={styles.smallBtn} onPress={() => setShowImageSheet(true)}>
                  <Text style={styles.smallBtnText}>Replace</Text>
                </Pressable>
                <Pressable
                  style={[styles.smallBtn, styles.deleteBtn]}
                  onPress={async () => {
                    if (imageUri) {
                      await deleteImage(imageUri).catch(() => {});
                    }
                    setImageUri(null);
                    setRemoveImage(true);
                  }}
                >
                  <Text style={styles.smallBtnText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable style={styles.submitBtn} onPress={handleSubmit} disabled={isLoading}>
              <Text style={styles.submitText}>{isLoading ? 'Saving...' : sale ? 'Save' : 'Add'}</Text>
            </Pressable>
            <Pressable style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>

      <ImageSourceSheet
        visible={showImageSheet}
        onClose={() => setShowImageSheet(false)}
        onCamera={pickFromCamera}
        onGallery={pickFromGallery}
      />

      <ImageModal uri={modalUri} alt={name || 'sale image'} onClose={() => setModalUri(null)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 18,
  },
  modalBody: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 18,
    position: 'relative',
  },
  close: {
    position: 'absolute',
    right: 10,
    top: 8,
    padding: 6,
  },
  closeText: {
    fontSize: 28,
    color: colors.muted,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 14,
    color: colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: colors.text,
  },
  uploadBtn: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    marginBottom: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  uploadText: {
    color: colors.accent,
    fontWeight: '600',
  },
  imageRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.borderLight,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  smallBtn: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  smallBtnText: {
    color: colors.accent,
    fontWeight: '600',
  },
  deleteBtn: {
    borderColor: '#f2c8c8',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.text,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.muted,
    fontWeight: '500',
  },
});
