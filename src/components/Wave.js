import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Wave = ({ color = '#fff', height = 60 }) => {
  return (
    <Svg
      width="100%"
      height={height}
      viewBox="0 0 1440 320"
      style={{ position: 'absolute', bottom: 0, left: 0 }}
    >
      <Path
        fill={color}
        d="M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,250.7C672,267,768,277,864,256C960,235,1056,181,1152,160C1248,139,1344,149,1392,154.7L1440,160V320H0Z"
      />
    </Svg>
  );
};

export default Wave;
