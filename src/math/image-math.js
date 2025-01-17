/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2020-2022 - https://www.igorski.nl
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
import { getMinImageSize } from "@/definitions/editor-properties";
import { MIN_ZOOM, MAX_ZOOM } from "@/definitions/tool-types";
import { fastRound } from "@/math/unit-math";

/**
 * Calculates the appropriate dimensions for fitting an image of dimensions
 * described by imageWidth x imageHeight in a destination area described by
 * destWidth x destHeight while maintaining the image aspect ratio.
 * This imply that the image can either be cropped or requires the destination
 * area to be scrollable in order to be displayed in full.
 */
export const scaleToRatio = ( imageWidth, imageHeight, destWidth, destHeight ) => {
    let ratio  = 1;
    let height = destHeight;

    if ( imageWidth > imageHeight ) {
        ratio  = imageHeight / imageWidth;
        height = destWidth * ratio;
    }
    else if ( imageHeight > imageWidth ) {
        ratio  = imageHeight / imageWidth;
        height = destWidth * ratio;
    }
    else if ( imageHeight === imageWidth ) {
        height = destWidth;
    }

    if ( height < destHeight ) {
        destWidth *= ( destHeight / height );
        height     = destHeight;
    }
    return {
        width: destWidth, height
    };
};

/**
 * Calculates the size of given document when represented on given canvasDimensions at multiple zoom levels:
 *
 * The 0 (neutral) level
 * The MAX_ZOOM (maximum zoom in) level
 * The MIN_ZOOM (maximum zoom out) level
 *
 * Additionally, the amount of pixels travelled when enlarging/shrinking by each zoom in/out step
 * is returned, which allows to calculate the appropriate zoom levels to display the document at arbitrary
 * sizes in pixels. Note that these steps can differ when zooming in or out! Also @see calculateMaxScaling()
 */
export const getZoomRange = ( activeDocument, canvasDimensions ) => {
    const { width, height } = activeDocument;
    const { visibleWidth, visibleHeight, horizontalDominant, maxInScale, maxOutScale } = canvasDimensions;

    const MIN_IMAGE_SIZE = getMinImageSize( width, height );

    let zeroZoomWidth, zeroZoomHeight;
    let minZoomWidth, minZoomHeight, pixelsPerZoomOutUnit;
    let maxZoomWidth, maxZoomHeight, pixelsPerZoomInUnit;

    if ( horizontalDominant ) {
        // horizontal side is dominant, meaning zoom level 0 has image width occupying full visibleWidth
        zeroZoomWidth        = visibleWidth;
        zeroZoomHeight       = ( height / width ) * zeroZoomWidth;
        minZoomHeight        = MIN_IMAGE_SIZE;
        minZoomWidth         = minZoomHeight * ( width / height );
        pixelsPerZoomOutUnit = ( zeroZoomHeight - minZoomHeight ) / MIN_ZOOM;
    }
    else {
        // vertical side is dominant, meaning zoom level 0 has image height occupying full visibleHeight
        zeroZoomHeight       = visibleHeight;
        zeroZoomWidth        = ( width / height ) * zeroZoomHeight;
        minZoomWidth         = MIN_IMAGE_SIZE;
        minZoomHeight        = minZoomWidth * ( height / width );
        pixelsPerZoomOutUnit = ( zeroZoomWidth - minZoomWidth ) / MIN_ZOOM;
    }
    maxZoomWidth        = zeroZoomWidth  * maxInScale;
    maxZoomHeight       = zeroZoomHeight * maxInScale;
    pixelsPerZoomInUnit = ( maxZoomWidth - zeroZoomWidth ) / MAX_ZOOM;
    /*
    console.log(
        `cvs dims: ${visibleWidth} x ${visibleHeight}, doc size: ${width} x ${height},
         visible size at zero zoom: ${zeroZoomWidth} x ${zeroZoomHeight},
         visible size at min zoom: ${minZoomWidth} x ${minZoomHeight} with px per zoom out unit: ${pixelsPerZoomOutUnit},
         visible size at max zoom: ${maxZoomWidth} x ${maxZoomHeight} with px per zoom in unit: ${pixelsPerZoomInUnit}`
    );
    */
    return {
        zeroZoomWidth, zeroZoomHeight,
        minZoomWidth, minZoomHeight, pixelsPerZoomOutUnit,
        maxZoomWidth, maxZoomHeight, pixelsPerZoomInUnit,
    };
};

/**
 * In case given width x height exceeds the maximum amount of given megapixels, a new
 * width and height are returned that is within the range
 */
export const constrain = ( width, height, maxMegaPixel ) => {
    const megaPixel = width * height;
    if ( megaPixel > maxMegaPixel ) {
        const ratio = Math.sqrt( maxMegaPixel ) / Math.sqrt( megaPixel );
        width  = fastRound( width  * ratio );
        height = fastRound( height * ratio );
    }
    return { width, height };
};

export const isPortrait  = ( width, height ) => width < height;
export const isLandscape = ( width, height ) => width > height;
export const isSquare    = ( width, height ) => width === height;
