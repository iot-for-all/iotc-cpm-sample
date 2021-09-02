import {TextStyle, ViewStyle, Platform} from 'react-native';

const DefaultStyles: {
  header: TextStyle;
  centerFragment: ViewStyle;
  centeredButton: ViewStyle;
  elevated: ViewStyle;
  itemName: TextStyle;
  itemDetail: TextStyle;
} = {
  header: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  centerFragment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredButton: {
    width: 230,
    height: 50,
    marginVertical: 20,
    justifyContent: 'center',
  },
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: "'rgba(0, 0, 0, 0.14)'",
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemDetail: {
    fontSize: 14,
  },
};
export default DefaultStyles;
