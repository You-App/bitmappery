/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2021 - https://www.igorski.nl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
export const degreesToRadians = deg => deg * Math.PI / 180;
export const radiansToDegrees = rad => rad * 180 / Math.PI;

// Safari greatly benefits from round numbers as subpixel content is sometimes ommitted from rendering...
export const fastRound = num => num > 0 ? ( num + .5 ) << 0 : num | 0;

const CM_PER_INCH = 2.54;
const MM_PER_INCH = CM_PER_INCH * 10;

export const pixelsToInch   = ( pixels, dpi = 72 ) => pixels / dpi;
export const pixelsToCm     = ( pixels, dpi = 72 ) => pixelsToInch( pixels, dpi ) * CM_PER_INCH
export const pixelsToMm     = ( pixels, dpi = 72 ) => pixelsToInch( pixels, dpi ) * MM_PER_INCH;
export const inchesToPixels = ( inches, dpi = 72 ) => inches * dpi;
export const cmToPixels     = ( cms, dpi = 72 ) => inchesToPixels( cms / CM_PER_INCH, dpi );
export const mmToPixels     = ( mms, dpi = 72 ) => inchesToPixels( mms / MM_PER_INCH, dpi );

// convenience method to scale given value and its expected maxValue against
// an arbitrary range (defined by maxCompareValue in relation to maxValue)

export const scale = ( value, maxValue, maxCompareValue ) => Math.min( maxValue, value ) * ( maxCompareValue / maxValue );

export const randomInRange = ( min, max ) => Math.random() * ( max - min + 1 ) + min;
