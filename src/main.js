import { fetchImages, resetPage, getCurrentPage } from './js/pixabay-api.js';
import {
  clearGallery,
  showImages,
  showErrorMessage,
  showLoadingIndicator,
  hideLoadingIndicator,
  toggleLoadMoreButton,
  showEndOfResultsMessage,
} from './js/render-functions.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const statusElement = document.querySelector('#env-status');
if (statusElement) {
  // Значення змінної VITE_APP_STATUS з кореневого .env файлу
  const appStatus = import.meta.env.VITE_APP_STATUS;
  statusElement.textContent = appStatus || 'Unknown';

  // Зміна кольору тексту залежно від режиму
  statusElement.style.color = import.meta.env.DEV ? '#ff9800' : '#4caf50';
}

toggleLoadMoreButton(false);

let query = '';
let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
  showCounter: false,
});

document
  .querySelector('.search-form')
  .addEventListener('submit', async function (event) {
    event.preventDefault();
    query = document.querySelector('.search-input').value.trim();

    if (!query) {
      toggleLoadMoreButton(false);
      clearGallery();
      showErrorMessage();
      return;
    }

    resetPage();
    clearGallery();
    toggleLoadMoreButton(false);
    showLoadingIndicator();

    try {
      const data = await fetchImages(query, 1);
      hideLoadingIndicator();

      if (data.hits.length === 0) {
        toggleLoadMoreButton(false);
        showErrorMessage();
        return;
      }

      showImages(data.hits);
      lightbox.refresh();

      toggleLoadMoreButton(data.totalHits > data.hits.length);
    } catch {
      hideLoadingIndicator();
      toggleLoadMoreButton(false);
      showErrorMessage();
    }
  });

document
  .querySelector('.load-more')
  .addEventListener('click', async function () {
    const nextPage = getCurrentPage() + 1;

    showLoadingIndicator();
    try {
      const data = await fetchImages(query, nextPage);
      hideLoadingIndicator();

      if (data.hits.length === 0) {
        toggleLoadMoreButton(false);
        return;
      }

      showImages(data.hits);
      lightbox.refresh();

      const totalLoaded = nextPage * 20;
      if (totalLoaded >= data.totalHits) {
        toggleLoadMoreButton(false);
        showEndOfResultsMessage();
      } else {
        toggleLoadMoreButton(true);
      }

      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    } catch {
      hideLoadingIndicator();
      toggleLoadMoreButton(false);
      showErrorMessage();
    }
  });
