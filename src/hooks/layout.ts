import { useState, useEffect, useCallback } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

type Orientation = 'portrait' | 'landscape';
function getOrientation(width: number, height: number): Orientation {
  if (width > height) {
    return 'landscape';
  }
  return 'portrait';
}

export function useScreenDimensions() {
  const [screenData, setScreenData] = useState(Dimensions.get('screen'));
  const [orientation, setOrientation] = useState<Orientation>(
    getOrientation(screenData.width, screenData.height),
  );

  const onChange = useCallback(
    (result: { window: ScaledSize; screen: ScaledSize }) => {
      setScreenData(result.screen);
      setOrientation(getOrientation(result.screen.width, result.screen.height));
    },
    [],
  );

  useEffect(() => {
    const dimsub = Dimensions.addEventListener('change', onChange);
    return () => {
      // @ts-ignore
      // typings for 0.65.x not available yet
      dimsub?.remove()
    };
  }, [orientation, onChange]);
  return { screen: screenData, orientation };
}
