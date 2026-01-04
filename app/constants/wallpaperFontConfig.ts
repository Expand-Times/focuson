import { TextStyle } from 'react-native';

const wallpaperFontConfig: Record<number, { 
   clock: string; 
   date: string; 
   info: string;
 } & TextStyle> = { 
   0: { // Dark Solid Color
     clock: 'Poppins-Bold', 
     date: 'Poppins-Regular', 
     info: 'Poppins-Light', 
   }, 
   1: { // Light Solid Color
     clock: 'Imprima-Regular', 
     date: 'Imprima-Regular', 
     info: 'Imprima-Regular', 
   }, 
   2: { // Wallpaper/3.jpg
     clock: 'RampartOne-Regular', 
     date: 'RampartOne-Regular', 
     info: 'RampartOne-Regular', 
   },
   3: { // Wallpaper/4.jpg
     clock: 'RubikMoonrocks-Regular', 
     date: 'RampartOne-Regular', 
     info: 'RubikMoonrocks-Regular',  
     fontSize: 20,
     marginRight: 44,
     padding: 4,
     color: '#CEDDF2',
    //  backgroundColor: '#CEDDF2',
   },
   4: { // Wallpaper/5.jpg
     clock: 'Monoton-Regular', 
     date: 'Monoton-Regular', 
     info: 'Monoton-Regular', 
   },
   5: { // Wallpaper/6.jpg
     clock: 'RobotoMono-Bold', 
     date: 'RobotoMono-Regular', 
     info: 'RobotoMono-Light', 
   },
   6: { // Wallpaper/7.jpg
     clock: 'Poppins-Bold', 
     date: 'Poppins-Regular', 
     info: 'Poppins-Light', 
   },
   7: { // Wallpaper/8.jpg
     clock: 'Imprima-Regular', 
     date: 'Imprima-Regular', 
     info: 'Imprima-Regular', 
   },
   8: { // Wallpaper/9.jpg
     clock: 'RobotoMono-Bold', 
     date: 'RobotoMono-Regular', 
     info: 'RobotoMono-Light', 
   },
   9: { // Wallpaper/10.jpg
     clock: 'Poppins-Bold', 
     date: 'Poppins-Regular', 
     info: 'Poppins-Light', 
   },
 }; 
 
 export default wallpaperFontConfig;