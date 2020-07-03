import React from 'react';
if (__DEV__) {
    console.log(`Tracing active`);
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React);
}