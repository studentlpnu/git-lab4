import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import * as api from './js/pixabay-api.js';
import * as render from './js/render-functions.js';

// Імітація роботи axios, щоб не робити реальних запитів
vi.mock('axios');

describe('Тестування MVP: Pixabay API та Рендеринг', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Чиста розмітка в JSDOM перед кожним тестом
    document.body.innerHTML = `
      <div class="gallery"></div>
      <div class="loading" style="display: none;"></div>
      <button class="load-more" style="display: none;"></button>
    `;
  });

  // 1. Успішний запит
  it('fetchImages: повертає дані при успішному запиті', async () => {
    const mockData = { data: { hits: [{ id: 1, tags: 'cat' }], total: 1 } };
    axios.get.mockResolvedValue(mockData);

    const result = await api.fetchImages('cat');
    expect(result.hits[0].tags).toBe('cat');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  // 2. Обробка помилок сервера
  it('fetchImages: коректно обробляє помилку 500 від сервера', async () => {
    axios.get.mockRejectedValue(new Error('Server Error'));

    await expect(api.fetchImages('dog')).rejects.toThrow('Server Error');
  });

  // 3. Обробка порожньої відповіді
  it('fetchImages: викидає помилку, якщо сервер повернув 0 результатів', async () => {
    axios.get.mockResolvedValue({ data: { hits: [] } });

    await expect(api.fetchImages('nonexistent')).rejects.toThrow(
      'No images found'
    );
  });

  // 4. Імунітет до пробілів
  it('БІЗНЕС-ЛОГІКА: правильно формує URL навіть із зайвими пробілами', async () => {
    axios.get.mockResolvedValue({ data: { hits: [1] } });

    await api.fetchImages('  red  car  ');

    const calledUrl = axios.get.mock.calls[0][0];
    expect(calledUrl).toContain('q=%20%20red%20%20car%20%20');
  });

  // 5. Симуляція затримки
  it('ОРИГІНАЛЬНИЙ: функція успішно чекає на відповідь при затримці мережі', async () => {
    axios.get.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: { hits: [1] } }), 50)
        )
    );

    const result = await api.fetchImages('test');
    expect(result.hits).toBeDefined();
  });

  // 6. XSS-захист
  it('БЕЗПЕКА: екранує шкідливий код у тегах (XSS protection)', () => {
    const dangerousData = [
      {
        largeImageURL: '1.jpg',
        webformatURL: '2.jpg',
        tags: '<img src=x onerror=alert(1)>',
        likes: 0,
        views: 0,
        comments: 0,
        downloads: 0,
      },
    ];

    render.showImages(dangerousData);
    const img = document.querySelector('.gallery-image');
    expect(img.getAttribute('alt')).toBe('<img src=x onerror=alert(1)>');
  });

  // 7. Накопичувальний ефект
  it('РЕНДЕРИНГ: нові картинки додаються до галереї, а не затирають попередні', () => {
    const mockImg = {
      largeImageURL: '',
      webformatURL: '',
      tags: 't',
      likes: 0,
      views: 0,
      comments: 0,
      downloads: 0,
    };

    render.showImages([mockImg]);
    render.showImages([mockImg]);

    const items = document.querySelectorAll('.gallery-item');
    expect(items.length).toBe(2);
  });
});
