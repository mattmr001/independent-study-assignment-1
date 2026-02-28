// ABOUTME: Displays a captured photo preview
// ABOUTME: Reusable image display component for capture and results screens

import { Image, StyleSheet } from 'react-native';

interface Props {
  imagePath: string;
}

export function CapturePreview({ imagePath }: Props) {
  return (
    <Image
      source={{ uri: imagePath }}
      style={styles.image}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 300, borderRadius: 0, borderWidth: 2, borderColor: '#000000' },
});
