import { test, expect } from '@playwright/test';

test.describe('React Native Sync Storage on Web', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load completely
    await expect(
      page.locator('text=React Native Sync Storage Demo')
    ).toBeVisible();
    await expect(page.locator('text=Loading...')).not.toBeVisible({
      timeout: 10000,
    });
  });

  test('should display the demo interface correctly', async ({ page }) => {
    // Check that all UI elements are present
    await expect(
      page.locator('text=React Native Sync Storage Demo')
    ).toBeVisible();
    await expect(page.locator('input[placeholder="Enter key"]')).toBeVisible();
    await expect(
      page.locator('input[placeholder="Enter value"]')
    ).toBeVisible();
    await expect(page.locator('text=Set Item')).toBeVisible();
    await expect(page.locator('text=Get Item')).toBeVisible();
    await expect(page.locator('text=Clear Storage')).toBeVisible();
    await expect(page.locator('text=Retrieved Value:')).toBeVisible();
    await expect(page.locator('text=All Keys:')).toBeVisible();
  });

  test('should set and retrieve a value', async ({ page }) => {
    const keyInput = page.locator('input[placeholder="Enter key"]');
    const valueInput = page.locator('input[placeholder="Enter value"]');
    const setButton = page.locator('text=Set Item');
    const getButton = page.locator('text=Get Item');

    // Set a key-value pair
    await keyInput.fill('test-key-1');
    await valueInput.fill('test-value-1');
    await setButton.click();

    // Check that the retrieved value is displayed
    const retrievedValueElement = page
      .locator('text=Retrieved Value:')
      .locator('..')
      .locator('text=test-value-1');
    await expect(retrievedValueElement).toBeVisible();

    // Check that the key appears in "All Keys"
    const allKeysElement = page
      .locator('text=All Keys:')
      .locator('..')
      .locator('text=test-key-1');
    await expect(allKeysElement).toBeVisible();

    // Test retrieving the value again
    await keyInput.fill('test-key-1');
    await getButton.click();
    await expect(retrievedValueElement).toBeVisible();
  });

  test('should handle multiple keys correctly', async ({ page }) => {
    const keyInput = page.locator('input[placeholder="Enter key"]');
    const valueInput = page.locator('input[placeholder="Enter value"]');
    const setButton = page.locator('text=Set Item');
    const getButton = page.locator('text=Get Item');

    // Set first key-value pair
    await keyInput.fill('key1');
    await valueInput.fill('value1');
    await setButton.click();

    // Set second key-value pair
    await keyInput.fill('key2');
    await valueInput.fill('value2');
    await setButton.click();

    // Set third key-value pair
    await keyInput.fill('key3');
    await valueInput.fill('value3');
    await setButton.click();

    // Check that all keys are displayed
    const allKeysSection = page.locator('text=All Keys:').locator('..');
    await expect(allKeysSection).toContainText('key1');
    await expect(allKeysSection).toContainText('key2');
    await expect(allKeysSection).toContainText('key3');

    // Retrieve each value to verify they're stored correctly
    await keyInput.fill('key1');
    await getButton.click();
    let retrievedValue = page
      .locator('text=Retrieved Value:')
      .locator('..')
      .locator('text=value1');
    await expect(retrievedValue).toBeVisible();

    await keyInput.fill('key2');
    await getButton.click();
    retrievedValue = page
      .locator('text=Retrieved Value:')
      .locator('..')
      .locator('text=value2');
    await expect(retrievedValue).toBeVisible();

    await keyInput.fill('key3');
    await getButton.click();
    retrievedValue = page
      .locator('text=Retrieved Value:')
      .locator('..')
      .locator('text=value3');
    await expect(retrievedValue).toBeVisible();
  });

  test('should clear all storage', async ({ page }) => {
    const keyInput = page.locator('input[placeholder="Enter key"]');
    const valueInput = page.locator('input[placeholder="Enter value"]');
    const setButton = page.locator('text=Set Item');
    const clearButton = page.locator('text=Clear Storage');

    // Set some data first
    await keyInput.fill('temp-key');
    await valueInput.fill('temp-value');
    await setButton.click();

    // Verify data is set
    const allKeysSection = page.locator('text=All Keys:').locator('..');
    await expect(allKeysSection).toContainText('temp-key');

    // Clear storage
    await clearButton.click();

    // Verify storage is cleared
    await expect(allKeysSection).toContainText('none');

    // Verify retrieved value is null
    const retrievedValueSection = page
      .locator('text=Retrieved Value:')
      .locator('..');
    await expect(retrievedValueSection).toContainText('null');
  });

  test('should persist data across page reloads', async ({ page }) => {
    const keyInput = page.locator('input[placeholder="Enter key"]');
    const valueInput = page.locator('input[placeholder="Enter value"]');
    const setButton = page.locator('text=Set Item');
    const getButton = page.locator('text=Get Item');

    // Set a key-value pair
    await keyInput.fill('persist-key');
    await valueInput.fill('persist-value');
    await setButton.click();

    // Verify it's set
    const allKeysSection = page.locator('text=All Keys:').locator('..');
    await expect(allKeysSection).toContainText('persist-key');

    // Reload the page
    await page.reload();
    await expect(
      page.locator('text=React Native Sync Storage Demo')
    ).toBeVisible();
    await expect(page.locator('text=Loading...')).not.toBeVisible({
      timeout: 10000,
    });

    // Check if the data persisted
    await expect(allKeysSection).toContainText('persist-key');

    // Retrieve the value to make sure it's still there
    await keyInput.fill('persist-key');
    await getButton.click();
    const retrievedValue = page
      .locator('text=Retrieved Value:')
      .locator('..')
      .locator('text=persist-value');
    await expect(retrievedValue).toBeVisible();
  });

  test('should handle empty key retrieval', async ({ page }) => {
    const keyInput = page.locator('input[placeholder="Enter key"]');
    const getButton = page.locator('text=Get Item');

    // Try to get a key that doesn't exist
    await keyInput.fill('non-existent-key');
    await getButton.click();

    // Should show null as the retrieved value
    const retrievedValueSection = page
      .locator('text=Retrieved Value:')
      .locator('..');
    await expect(retrievedValueSection).toContainText('null');
  });

  test('should handle special characters in keys and values', async ({
    page,
  }) => {
    const keyInput = page.locator('input[placeholder="Enter key"]');
    const valueInput = page.locator('input[placeholder="Enter value"]');
    const setButton = page.locator('text=Set Item');
    const getButton = page.locator('text=Get Item');

    // Test with special characters
    const specialKey = 'key-with-special-chars_@#$%';
    const specialValue = 'value with spaces & special chars: {}[]()';

    await keyInput.fill(specialKey);
    await valueInput.fill(specialValue);
    await setButton.click();

    // Verify it's stored
    const allKeysSection = page.locator('text=All Keys:').locator('..');
    await expect(allKeysSection).toContainText(specialKey);

    // Retrieve and verify the value
    await keyInput.fill(specialKey);
    await getButton.click();

    const retrievedValueSection = page
      .locator('text=Retrieved Value:')
      .locator('..');
    await expect(retrievedValueSection).toContainText(specialValue);
  });

  test('should update existing key with new value', async ({ page }) => {
    const keyInput = page.locator('input[placeholder="Enter key"]');
    const valueInput = page.locator('input[placeholder="Enter value"]');
    const setButton = page.locator('text=Set Item');
    const getButton = page.locator('text=Get Item');

    // Set initial value
    await keyInput.fill('update-key');
    await valueInput.fill('initial-value');
    await setButton.click();

    // Verify initial value
    await keyInput.fill('update-key');
    await getButton.click();
    let retrievedValue = page
      .locator('text=Retrieved Value:')
      .locator('..')
      .locator('text=initial-value');
    await expect(retrievedValue).toBeVisible();

    // Update with new value
    await keyInput.fill('update-key');
    await valueInput.fill('updated-value');
    await setButton.click();

    // Verify updated value
    await keyInput.fill('update-key');
    await getButton.click();
    retrievedValue = page
      .locator('text=Retrieved Value:')
      .locator('..')
      .locator('text=updated-value');
    await expect(retrievedValue).toBeVisible();

    // Should still only show the key once in "All Keys"
    const allKeysSection = page.locator('text=All Keys:').locator('..');
    await expect(allKeysSection).toContainText('update-key');
  });
});
