import { TextStyle } from 'react-native';

const wallpaperFontConfig: Record<number, { 
   clock?: string; 
   [key: string]: any;
 }> = { 
   0: { // Dark Solid Color
     clock: 'Poppins-Bold', 
     time: {'fontFamily': 'Poppins-Regular', fontSize: 16,color: '#DBDFE5'},
     date: {'fontFamily': 'Poppins-Regular', fontSize: 16,color: '#DBDFE5'},
     info: 'Poppins-Light', 
   }, 
   1: { // Light Solid Color
     clock: 'Imprima-Regular', 
     time: {'fontFamily': 'Imprima-Regular', fontSize: 16,color: '#DBDFE5'},
     date: {'fontFamily': 'Imprima-Regular', fontSize: 16,color: '#DBDFE5'},
     info: 'Imprima-Regular', 
     
   }, 
   2: { // Wallpaper/3.jpg
    // home
     time: {'fontFamily': 'RampartOne-Regular', fontSize: 32,color: '#1A2B33'},
     pm: {color: '#1A2B33'},
     date: {color: '#1A2B33'},
     battery: {color: '#3782B8'}, 
     home: {color: '#1A2B33'}, 
     icon: {color: '#1A2B33'}, 
     don: {color: '#405B7F'}, 
     footer: {color: '#1A2B33'}, 
     leave: {color: '#405B7F'}, 
     bottom: { backgroundColor: '#0B303033'}, 
     dialer: { color: '#1A2B33'}, 
     alpha: {color: '#1A2B33'}, 
    //  modal
    modalbg: {backgroundColor: '#FFFFFF'}, 
      open: {color: '#2E3A4C'}, 
      appicon: {color: '#1A2B33'}, 
      select: {color: '#A3B8D9'}, 
      numberbg: {backgroundColor: '#51CDE5'}, 
      number: {color: '#FFFFFF'}, 
      toggle: {color: '#2E3B4D'}, 
      when: {color: '#2E3B4D'}, 
      remind: {color: '#2E3B4D'}, 
      quit: {color: '#FFFFFF'}, 
      bordert: {borderColor: '#A2B9D9'}, 
      quitbg: {backgroundColor: '#42ABBE'}, 
    //  allApp
    search: {'fontFamily': 'RampartOne-Regular', fontSize: 20,color: '#DBDFE5'}, 
    header: {'fontFamily': 'RampartOne-Regular', fontSize: 20,color: '#DBDFE5'}, 
    applist: {'fontFamily': 'RampartOne-Regular', fontSize: 20,color: '#DBDFE5'}, 
    alphaside: {'fontFamily': 'RampartOne-Regular', fontSize: 20,color: '#DBDFE5'}, 

    
   },
  
 }; 
 
 export default wallpaperFontConfig;