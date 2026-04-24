import { test, expect } from '@playwright/test';

// Переконайся, що твій локальний сервер запущений на цьому порті
const BASE_URL = 'http://localhost:5173';

test.describe('Критичний шлях користувача (MediaVision MVP)', () => {
  test.beforeEach(async ({ page }) => {
    // Відкриваємо сторінку перед кожним тестом
    await page.goto(BASE_URL);
  });

  test('Успішний пошук: користувач вводить запит і бачить відрендерену галерею з фото', async ({
    page,
  }) => {
    const input = page.locator('#search-query');
    const button = page.locator('.btn-submit');

    // 1. Взаємодія: пошук квітів
    await input.fill('yellow flowers');
    await button.click();

    // 2. Очікування: перевіряємо, чи з'явився контейнер галереї
    const gallery = page.locator('.gallery');
    await expect(gallery).toBeVisible();

    // 3. Спеціальне очікування завантаження самих файлів зображень (щоб не було "битих" картинок)
    await page.waitForFunction(
      () => {
        const images = Array.from(document.querySelectorAll('.gallery-image'));
        return (
          images.length > 0 &&
          images.every(img => img.complete && img.naturalWidth > 0)
        );
      },
      { timeout: 10000 }
    );

    // 4. Перевірка: чи видима перша картинка
    const firstImage = page.locator('.gallery-image').first();
    await expect(firstImage).toBeVisible();

    // Перевірка, що в інфо-блоці є дані (наприклад, лайки)
    const likes = page.locator('.image-info p').first();
    await expect(likes).toContainText('Likes:');
  });

  test('Помилка пошуку: відображення сповіщення iziToast при порожньому результаті', async ({
    page,
  }) => {
    const input = page.locator('#search-query');
    const button = page.locator('.btn-submit');

    // 1. Взаємодія: вводимо запит, який точно не дасть результатів
    await input.fill('xyz123abc456_non_existent');
    await button.click();

    // 2. Перевірка: чи з'явилося вікно сповіщення iziToast
    // iziToast зазвичай має клас .iziToast-wrapper або .iziToast
    const toast = page.locator('.iziToast');
    await expect(toast).toBeVisible();

    // Перевірка тексту помилки
    await expect(toast).toContainText('Sorry');
  });
});
