import { test, expect } from '@playwright/test';

test.use({ browserName: 'webkit', headless: false });

test('login to WNBA, select next Saturday 6-10AM within 7 days, and confirm booking', async ({ page }) => {
  // 1️⃣ Go to website
  await page.goto('https://bookings.wnba.org.nz', { waitUntil: 'domcontentloaded' });

  // 2️⃣ Handle "Stay signed out / Continue" prompt if it appears
  const continueButton = page.locator('text=Continue, text=Stay signed out');
  if (await continueButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await continueButton.click();
    console.log('Clicked Stay signed out / Continue button');
  }

  // 3️⃣ Click "Sign in with your username"
  const usernameSignInOption = page.locator('text=Sign in with your username');
  await usernameSignInOption.waitFor({ state: 'visible', timeout: 15000 });
  await usernameSignInOption.click();

  // 4️⃣ Fill username
  const usernameInput = page.locator('input[type="text"]:visible, input[type="email"]:visible');
  await usernameInput.waitFor({ state: 'visible', timeout: 15000 });
  await usernameInput.fill('vinodyadam@gmail.com');

  // 5️⃣ Fill password
  const passwordInput = page.locator('input[type="password"]:visible');
  await passwordInput.waitFor({ state: 'visible', timeout: 15000 });
  await passwordInput.fill('*baddy1526');

  // 6️⃣ Click Sign In
  const signInButton = page.locator('button:has-text("Sign In"):visible').first();
  await signInButton.waitFor({ state: 'visible', timeout: 20000 });
  await signInButton.click();
  console.log('Clicked username Sign In button');

  // 7️⃣ Wait for network idle
  await page.waitForLoadState('networkidle');

  // 8️⃣ Handle popups (Not Now / Membership expired)
  const popups = [
    page.getByRole('button', { name: 'Close' }),
    page.getByRole('button', { name: 'Not Now' })
  ];
  for (const popup of popups) {
    if (await popup.isVisible({ timeout: 5000 }).catch(() => false)) {
      await popup.click();
      console.log('Closed a popup');
    }
  }

  // 9️⃣ Click Bookings link robustly
  const bookingsLink = page.getByRole('link', { name: /Bookings/i });
  await bookingsLink.waitFor({ state: 'visible', timeout: 20000 });
  await bookingsLink.click();
  console.log('Clicked Bookings link');

  // 🔟 Navigate to Wellington North Badminton Stadium page for the target Saturday
  const today = new Date();
  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7));
  const diffDays = Math.floor((nextSaturday - today) / (1000 * 60 * 60 * 24));

  if (diffDays > 7) {
    console.log('No Saturday booking within 7 days available');
    return;
  }

  const targetDateStr = nextSaturday.toISOString().split('T')[0]; // YYYY-MM-DD
  const stadiumURL = `https://bookings.wnba.org.nz/bookings/wellington-north-badminton-stadium/${targetDateStr}`;
  await page.goto(stadiumURL, { waitUntil: 'networkidle' });
  console.log(`Navigated to stadium page for ${targetDateStr}`);

  // 1️⃣1️⃣ Select a slot dynamically (8–10AM preferred, fallback to 6AM)
  const slots = page.locator('div.slot:visible');
  const slotCount = await slots.count();
  let slotSelected = false;

  const preferredTimes = ['8:00AM', '9:00AM', '10:00AM', '6:00AM'];

  for (const preferredTime of preferredTimes) {
    for (let i = 0; i < slotCount; i++) {
      const slotText = await slots.nth(i).innerText();
      const timeMatch = slotText.match(/(\d{1,2}:\d{2}\s?[AP]M)/i);
      if (timeMatch) {
        const slotTime = timeMatch[1].toUpperCase();
        if (slotTime === preferredTime) {
          await slots.nth(i).click();
          slotSelected = true;
          console.log(`Selected slot: ${slotTime}`);
          break;
        }
      }
    }
    if (slotSelected) break;
  }

  if (!slotSelected) {
    console.log('No suitable slot available on Saturday within 7 days.');
    return;
  }

  // 1️⃣2️⃣ Confirm booking
  const confirmButton = page.getByRole('button', { name: /Confirm booking/i });
  await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
  await confirmButton.click();
  console.log('Booking confirmed');

  // 1️⃣3️⃣ Handle post-confirmation popup
  const okButton = page.getByRole('button', { name: 'Ok' });
  if (await okButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await okButton.click();
    console.log('Clicked Ok after booking confirmation');
  }

  console.log('Saturday booking flow completed successfully!');
});
