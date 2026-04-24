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
    } catch (error) {
      hideLoadingIndicator();
      toggleLoadMoreButton(false);
      showErrorMessage();
      console.error(error);
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

      const totalLoaded = nextPage * 15;
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
    } catch (error) {
      hideLoadingIndicator();
      toggleLoadMoreButton(false);
      showErrorMessage();
      console.error(error);
    }
  });
