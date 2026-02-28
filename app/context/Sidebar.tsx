import React from 'react';
import { TouchableOpacity, Text, TextInput, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';

interface SidebarItemProps {
  letter: string;
  index: number;
  touchY: SharedValue<number>;
  isTouching: SharedValue<boolean>;
  onSelect: (letter: string) => void;
  isDarkMode: boolean;
  currentLetter: string;
  isImageWallpaper?: boolean;
  style?: any;
  itemHeight: number;
  enableLiquidEffect?: boolean;
}

export const SidebarItem = ({
  letter,
  index,
  touchY,
  isTouching,
  onSelect,
  isDarkMode,
  currentLetter,
  isImageWallpaper,
  style,
  itemHeight,
  enableLiquidEffect = false,
}: SidebarItemProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const itemY = index * itemHeight + itemHeight / 2;
    const diff = itemY - touchY.value;
    const dist = Math.abs(diff);

    // Liquid Effect Logic (from Home)
    if (enableLiquidEffect) {
      const direction = diff > 0 ? 1 : -1;
      const RANGE = itemHeight * 5;
      const MAX_SCALE = 2;

      let spreadY = 0;
      if (isTouching.value) {
        if (dist < RANGE) {
          spreadY = (MAX_SCALE - 1) * dist * (1 - dist / (2 * RANGE));
        } else {
          spreadY = ((MAX_SCALE - 1) * RANGE) / 2;
        }
      }
      const finalTranslateY = direction * spreadY;

      const translateX = interpolate(
        dist,
        [0, itemHeight * 5],
        [-itemHeight * 6, 0],
        Extrapolation.CLAMP
      );
      const scale = interpolate(dist, [0, itemHeight * 5], [MAX_SCALE, 1], Extrapolation.CLAMP);

      return {
        transform: [
          { translateX: withSpring(isTouching.value ? translateX : 0) },
          { translateY: withSpring(isTouching.value ? finalTranslateY : 0) },
          { scale: withSpring(isTouching.value ? scale : 1) },
        ],
        zIndex: isTouching.value && dist < itemHeight * 1.5 ? 100 : 1,
      };
    }

    // Simple Effect Logic (from All Apps)
    else {
      // Based on all-apps implementation
      // [0, 60] range was used for ITEM_HEIGHT=20. 60 is 3 * ITEM_HEIGHT.
      const range = itemHeight * 3;

      const translateX = interpolate(dist, [0, range], [-itemHeight * 2, 0], Extrapolation.CLAMP); // -40 is -2 * 20
      const scale = interpolate(dist, [0, range], [2, 1], Extrapolation.CLAMP);

      return {
        transform: [
          { translateX: withSpring(isTouching.value ? translateX : 0) },
          { scale: withSpring(isTouching.value ? scale : 1) },
        ],
        zIndex: isTouching.value && dist < itemHeight * 1.5 ? 100 : 1,
      };
    }
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const itemStart = index * itemHeight;
    const itemEnd = itemStart + itemHeight;
    // Check if touch is strictly within this item's vertical bounds
    const isSelectedByTouch = isTouching.value && touchY.value >= itemStart && touchY.value < itemEnd;

    // Determine active state: either currently touched OR selected via prop (fallback)
    // We prioritize touch interaction for instant feedback
    const isActive = isTouching.value ? isSelectedByTouch : currentLetter === letter;

    // Define colors
    let activeColor = '#5C8BCC'; // Default light mode active
    let inactiveColor = '#405B80'; // Default light mode inactive

    if (isImageWallpaper) {
      activeColor = 'white';
      inactiveColor = 'white';
    } else if (isDarkMode) {
      activeColor = 'white';
      inactiveColor = '#738099';
    }

    return {
      fontSize: withTiming(isActive ? itemHeight * 0.8 : itemHeight * 0.6, { duration: 100 }),
      color: withTiming(isActive ? activeColor : inactiveColor, { duration: 100 }),
      fontWeight: isActive ? '700' : '500', // 700 is bold, 500 is medium
    };
  }, [currentLetter, isDarkMode, isImageWallpaper, itemHeight, letter, index]);

  return (
    <Animated.View
      style={[
        { height: itemHeight, justifyContent: 'center', alignItems: 'center', width: 24 },
        animatedStyle,
      ]}>
      <ReanimatedText
        allowFontScaling={false}
        style={[style, animatedTextStyle]}
      >
        {letter}
      </ReanimatedText>
    </Animated.View>
  );
};

const ReanimatedText = Animated.createAnimatedComponent(Text);
const ReanimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface BubbleCursorProps {
  touchY: SharedValue<number>;
  isTouching: SharedValue<boolean>;
  alphabet: string[];
  isDarkMode: boolean;
  style?: any;
  itemHeight: number;
  cursorSize?: number;
  bubbleColor?: string;
  enableLiquidEffect?: boolean;
}

export const BubbleCursor = ({
  touchY,
  isTouching,
  alphabet,
  isDarkMode,
  style,
  itemHeight,
  cursorSize,
  bubbleColor,
  enableLiquidEffect = false,
}: BubbleCursorProps) => {
  const size = cursorSize || itemHeight * 2.5;

  const animatedStyle = useAnimatedStyle(() => {
    const translateXTarget = enableLiquidEffect ? -itemHeight * 6 : -itemHeight * 2.5; // -50 vs -120 roughly
    const totalHeight = alphabet.length * itemHeight;
    const halfItem = itemHeight / 2;
    const maxDist = totalHeight - halfItem;
    const clampedY = Math.max(halfItem, Math.min(touchY.value, maxDist));

    return {
      transform: [
        { translateY: clampedY - size / 2 },
        { scale: withSpring(isTouching.value ? 1 : 0) },
        { translateX: withSpring(isTouching.value ? translateXTarget : 0) },
      ],
      opacity: withSpring(isTouching.value ? 1 : 0),
    };
  });

  const animatedProps = useAnimatedProps(() => {
    if (!alphabet || alphabet.length === 0) {
      return { text: '', defaultValue: '' } as any;
    }
    const index = Math.floor(touchY.value / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, alphabet.length - 1));
    const char = alphabet[clampedIndex] || '';

    return {
      text: char,
      defaultValue: char,
    } as any;
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          right: itemHeight * 1.5,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bubbleColor ? bubbleColor : (isDarkMode ? '#DADFE5' : '#FFFFFF'),
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          elevation: 5,
          shadowColor: isDarkMode ? '#FFFFFF33' : '#0000001A',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        style,
        animatedStyle,
      ]}>
      <ReanimatedTextInput
        allowFontScaling={false}
        underlineColorAndroid="transparent"
        editable={false}
        style={[
          {
            fontSize: size * 0.4,
            textAlign: 'center',
            padding: 0,
            includeFontPadding: false,
            // Adjust vertical alignment if needed, usually TextInput is centered by default if height is not set, 
            // but here we are inside a centered View.
          },
          style
        ]}
        className={`font-bold ${isDarkMode ? 'text-[#131B26]' : 'text-[#4D6D99]'}`}
        animatedProps={animatedProps}
      />
    </Animated.View>
  );
};

export default SidebarItem;