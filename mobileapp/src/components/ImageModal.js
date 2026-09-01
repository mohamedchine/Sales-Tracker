import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
} from 'react-native';
import colors from '../theme/colors';

function fitImageSize(naturalW, naturalH, maxW, maxH) {
  if (!naturalW || !naturalH) return { width: maxW, height: maxH };
  const scale = Math.min(maxW / naturalW, maxH / naturalH, 1);
  return {
    width: Math.round(naturalW * scale),
    height: Math.round(naturalH * scale),
  };
}

export default function ImageModal({ uri, alt, onClose }) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const [naturalSize, setNaturalSize] = useState(null);

  useEffect(() => {
    if (!uri) {
      setNaturalSize(null);
      return;
    }
    let cancelled = false;
    Image.getSize(
      uri,
      (w, h) => {
        if (!cancelled) setNaturalSize({ w, h });
      },
      () => {
        if (!cancelled) setNaturalSize(null);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [uri]);

  const imageSize = useMemo(() => {
    const maxW = screenW - 48;
    const maxH = screenH * 0.78;
    if (naturalSize) {
      return fitImageSize(naturalSize.w, naturalSize.h, maxW, maxH);
    }
    return { width: maxW, height: Math.min(maxW, maxH) };
  }, [naturalSize, screenW, screenH]);

  if (!uri) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={[styles.content, imageSize]}>
            <Pressable style={styles.close} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
            <Image
              source={{ uri }}
              style={imageSize}
              resizeMode="contain"
              accessibilityLabel={alt}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: colors.background,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  close: {
    position: 'absolute',
    right: 6,
    top: 6,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
  },
});
