/**
 * The drag gesture will not operate as expected when the element is dragged outside of the viewport because the Mouse class does not fire events outside of the viewport.
 *
 * For example, if the mouse is moved outside of the viewport, then the `mouseup` event will not fire.
 *
 * See https://playwright.dev/docs/api/class-mouse#mouse-move for more information.
 */

import type { ElementHandle, Locator } from '@playwright/test';

import type { E2EPage } from './';

export const dragElementBy = async (
  el: Locator | ElementHandle<SVGElement | HTMLElement>,
  page: E2EPage,
  dragByX = 0,
  dragByY = 0,
  startXCoord?: number,
  startYCoord?: number
) => {
  const boundingBox = await el.boundingBox();

  if (!boundingBox) {
    throw new Error(
      'Cannot get a bounding box for an element that is not visible. See https://playwright.dev/docs/api/class-locator#locator-bounding-box for more information'
    );
  }

  const startX = startXCoord === undefined ? boundingBox.x + boundingBox.width / 2 : startXCoord;
  const startY = startYCoord === undefined ? boundingBox.y + boundingBox.height / 2 : startYCoord;

  const viewport = page.viewportSize();
  if (viewport === null) {
    throw new Error(
      'Cannot get viewport size. See https://playwright.dev/docs/api/class-page#page-viewport-size for more information'
    );
  }

  const endX = calculateEndX(startX, dragByX, viewport.width);
  const endY = calculateEndY(startY, dragByY, viewport.height);

  await page.mouse.move(startX, startY, { steps: 20 });
  await page.mouse.down();

  await page.mouse.move(endX, endY, { steps: 20 });
  await page.waitForChanges();
  await page.mouse.up();
};

/**
 * Drags an element by the given amount of pixels on the Y axis.
 * @param el The element to drag.
 * @param page The E2E Page object.
 * @param dragByY The amount of pixels to drag the element by.
 * @param startYCoord The Y coordinate to start the drag gesture at. Defaults to the center of the element.
 */
export const dragElementByYAxis = async (
  el: Locator | ElementHandle<SVGElement | HTMLElement>,
  page: E2EPage,
  dragByY: number,
  startYCoord?: number
) => {
  const boundingBox = await el.boundingBox();

  if (!boundingBox) {
    throw new Error(
      'Cannot get a bounding box for an element that is not visible. See https://playwright.dev/docs/api/class-locator#locator-bounding-box for more information'
    );
  }

  const startX = boundingBox.x + boundingBox.width / 2;
  const startY = startYCoord === undefined ? boundingBox.y + boundingBox.height / 2 : startYCoord;

  const viewport = page.viewportSize();
  if (viewport === null) {
    throw new Error(
      'Cannot get viewport size. See https://playwright.dev/docs/api/class-page#page-viewport-size for more information'
    );
  }

  const endY = calculateEndY(startY, dragByY, viewport.height);

  await page.mouse.move(startX, startY);
  await page.mouse.down();

  await page.mouse.move(startX, endY, { steps: 10 });

  await page.mouse.up();
};

const calculateEndX = (startX: number, dragByX: number, viewportWidth: number) => {
  let endX = startX + dragByX;
  // The element is being dragged past the right of the viewport.
  if (endX > viewportWidth) {
    // The x coordinate is set to 5 pixels to the left of the right of the viewport to avoid the mouseup event not firing.
    endX = viewportWidth - 5;
  }

  // The element is being dragged past the left of the viewport.
  if (endX < 0) {
    // The x coordinate is set to 5 pixels to the right of the left of the viewport to avoid the mouseup event not firing.
    endX = 5;
  }

  return endX;
};

const calculateEndY = (startY: number, dragByY: number, viewportHeight: number) => {
  let endY = startY + dragByY;
  // The element is being dragged past the bottom of the viewport.
  if (endY > viewportHeight) {
    // The y coordinate is set to 5 pixels above the bottom of the viewport to avoid the mouseup event not firing.
    endY = viewportHeight - 5;
  }

  // The element is being dragged past the top of the viewport.
  if (endY < 0) {
    // The y coordinate is set to 5 pixels below the top of the viewport to avoid the mouseup event not firing.
    endY = 5;
  }

  return endY;
};
