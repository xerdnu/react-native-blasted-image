import { Component, ReactNode } from 'react';
import { ImageSourcePropType, StyleProp, ImageStyle, ViewStyle } from 'react-native';

interface BlastedImageProps {
  source: ImageSourcePropType;
  width?: number;
  onLoad?: () => void;
  onError?: (error: any) => void;
  fallbackSource?: ImageSourcePropType;
  height?: number;
  style?: StyleProp<ViewStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  isBackground?: boolean;
  children?: ReactNode;
}

declare class BlastedImage extends Component<BlastedImageProps, {}> {}

export = BlastedImage;
