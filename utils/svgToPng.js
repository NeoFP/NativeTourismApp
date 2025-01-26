import { SvgXml } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';

export const svgToPng = async (svg, width, height) => {
  const ref = React.createRef();
  const uri = await captureRef(ref, {
    width,
    height,
    format: 'png',
  });
  return uri;
}; 