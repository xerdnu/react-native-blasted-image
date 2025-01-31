declare module 'react-native-blasted-image' {
    import * as React from 'react';
    import { ImageSourcePropType, ViewStyle, StyleProp } from 'react-native';
  
    interface SourceProp {
      uri: string;
      hybridAssets?: boolean;
      cloudUrl?: string | null;
    }

    interface BlastedImageProps {
      resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
      isBackground?: boolean;
      returnSize?: boolean;
      fallbackSource?: ImageSourcePropType;
      source: SourceProp | number;
      width?: number;
      height?: number;
      style?: StyleProp<ViewStyle>;
      onLoad?: (size?: ImageSize | null) => void; 
      onError?: (error: Error) => void;
      children?: React.ReactNode;
      retries?: number;
      tintColor?: string;
    }
  
    interface BlastedImageStatic {
      clearMemoryCache(): void;
      clearDiskCache(): void;
      clearAllCaches(): void;
      preload(
        input:
            | { uri: string; skipMemoryCache?: boolean; hybridAssets?: boolean; cloudUrl?: string | null }
            | Array<{ uri: string; skipMemoryCache?: boolean; hybridAssets?: boolean; cloudUrl?: string | null }>,
        retries?: number
    ): Promise<void>;
    }
  
    const BlastedImage: React.FC<BlastedImageProps> & BlastedImageStatic;
  
    export function loadImage(
      imageUrl: string,
      skipMemoryCache?: boolean,
      hybridAssets?: boolean,
      cloudUrl?: string | null
    ): Promise<void>;
  
    export default BlastedImage;
}