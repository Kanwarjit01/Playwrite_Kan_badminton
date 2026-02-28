// const {test,expect} = require('@playwright/test')
// // const {hello, helloworld} = require('./demo/hello')
// //console.log (hello());

// test('My first test', async ({page}) =>{

//     await page.goto('https://google.com')

// })

import { test } from '@playwright/test';

test.use({ browserName: 'webkit', headless: false });

test('login to WNBA bookings site using username only in Safari/WebKit with popup handling', async ({ page }) => {
  // 1️⃣ Go to website
  await page.goto('http://bookings.wnba.org.nz', { waitUntil: 'domcontentloaded' });

  // 2️⃣ Handle any "Stay signed out / Continue" prompt
  const continueButton = page.locator('text=Continue, text=Stay signed out');
  if (await continueButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await continueButton.click();
    console.log('Clicked Stay signed out / Continue button');
  }

  // 3️⃣ Click the "Sign in with your username" option
  const usernameSignInOption = page.locator('text=Sign in with your username');
  await usernameSignInOption.waitFor({ state: 'visible', timeout: 15000 });
  await usernameSignInOption.click();

  // 4️⃣ Fill username
  const usernameInput = page.locator('input[type="text"]:visible, input[type="email"]:visible');
  await usernameInput.waitFor({ state: 'visible', timeout: 15000 });
  await usernameInput.fill('kanwarjitbedi@gmail.com');

  // 5️⃣ Fill password (hidden)
  const passwordInput = page.locator('input[type="password"]:visible');
  await passwordInput.waitFor({ state: 'visible', timeout: 15000 });
  await passwordInput.fill('welcome1');

  // 6️⃣ Click the correct Sign In button (ignore social media buttons)
  const signInButton = page.locator('button:has-text("Sign In"):visible').first();
  await signInButton.waitFor({ state: 'visible', timeout: 20000 });
  await signInButton.click();
  console.log('Clicked username Sign In button');

  // 7️⃣ Wait for network idle after login
  await page.waitForLoadState('networkidle');

  // 8️⃣ Handle "Not Now" popup if it appears
  const notNowButton = page.locator('text=Not Now');
  if (await notNowButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await notNowButton.click();
    console.log('Clicked Not Now on post-login popup');
  }
// 9️⃣ Handle "Your membership has expired" popup
  const expiredPopupClose = page.locator('button:has-text("Close")');
  if (await expiredPopupClose.isVisible({ timeout: 5000 }).catch(() => false)) {
    await expiredPopupClose.click();
    console.log('Closed "Your membership has expired" popup');
  }
  
  console.log('Login flow completed in Safari/WebKit (no verification step)');
});




