import { TextStyle } from 'react-native';

const wallpaperFontConfig: Record<number, { 
   clock?: string; 
   [key: string]: any;
 }> = { 
  0: { // Dark Solid Color
   
   },
   1: { // Light Solid Color
     
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
      togglei: {color: '#5C8BCC'}, 
      when: {color: '#2E3B4D'}, 
      remind: {color: '#2E3B4D'}, 
      quit: {color: '#FFFFFF'}, 
      bordert: {borderColor: '#A2B9D9'}, 
      quitbg: {backgroundColor: '#42ABBE'}, 
    //  allApps
    searchbg: {backgroundColor: '#FFFFFF26'}, 
    searchi: {color: '#5C8BCC'}, 
    allapp: {color: '#1A2B33'}, 
    header: {color: '#192B33'}, 
    applist: {color: '#1A2B33'}, 
    applistbg: {backgroundColor: '#0A26331A'}, 
    appdu: {color: '#1A2B33'}, 
    alphaside: {color: '#1A2B33'}, 
// category
    searchCbg: {backgroundColor: '#FFFFFF26'}, 
    searchCi: {color: '#5C8BCC'}, 
    appC: {color: '#1A2B33'}, 
    appCn: {color: '#1A2B33'}, 
    appCi: {color: '#1A2B33'}, 
    applistC: {color: '#1A2B33'}, 
    applistCdu: {color: '#1A2B33'}, 
    applistCbg: {backgroundColor: '#0A26331A'}, 
   },
  3: { // Wallpaper/4.jpg
    // home
     time: {'fontFamily': 'Codystar-Regular', fontSize: 44,color: '#CEDDF2'},
     pm: {'fontFamily': 'Codystar-Regular', fontSize: 16,color: '#CEDDF2'},
     date: {'fontFamily': 'Codystar-Regular', fontSize: 16,color: '#fff'},
     battery: {color: '#3782B8'}, 
     home: {color: '#1A2B33'}, 
     icon: {'fontFamily': 'NovaFlat-Regular', fontSize: 16,color: '#1A2B33'}, 
     don: {'fontFamily': 'NovaFlat-Regular', fontSize: 16,color: '#405B7F'}, 
     footer: {'fontFamily': 'NovaFlat-Regular', fontSize: 16,color: '#1A2B33'}, 
     leave: {'fontFamily': 'NovaFlat-Regular', fontSize: 16,color: '#405B7F'}, 
     bottom: { backgroundColor: '#0B303033'}, 
     dialer: {'fontFamily': 'NovaFlat-Regular', fontSize: 16, color: '#1A2B33'}, 
     alpha: {'fontFamily': 'NovaFlat-Regular', fontSize: 16,color: '#1A2B33'}, 
    //  modal
    modalbg: {backgroundColor: '#131B27'}, 
      open: {color: '#DBDFE5'}, 
      appicon: {color: '#1A2B33'}, 
      select: {color: '#A3B8D9'}, 
      numberbg: {backgroundColor: '#212C40'}, 
      number: {color: '#DBDFE5'}, 
      toggle: {color: '#2E3B4D'}, 
      togglei: {color: '#5C8BCC'}, 
      when: {color: '#2E3B4D'}, 
      remind: {color: '#2E3B4D'}, 
      quit: {color: '#FFFFFF'}, 
      bordert: {borderColor: '#A2B9D9'}, 
      quitbg: {backgroundColor: '#42ABBE'}, 
    //  allApps
    searchbg: {backgroundColor: '#FFFFFF26'}, 
    searchi: {color: '#5C8BCC'}, 
    allapp: {color: '#1A2B33'}, 
    header: {color: '#192B33'}, 
    applist: {color: '#1A2B33'}, 
    applistbg: {backgroundColor: '#0A26331A'}, 
    appdu: {color: '#1A2B33'}, 
    alphaside: {color: '#1A2B33'}, 
// category
    searchCbg: {backgroundColor: ''}, 
    searchCi: {color: '#434C59'}, 
    appC: {color: '#A3B9D9'}, 
    appCn: {color: '#405B7F'}, 
    appCi: {color: '#405B7F'}, 
    applistC: {fontFamily: 'Codystar-Regular', fontSize: 20,color: '#fff'}, 
    applistCdu: {color: '#405B7F'}, 
    applistCbg: {backgroundColor: ''},
   },
 }; 
 
 
 export default wallpaperFontConfig;