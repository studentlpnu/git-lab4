import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

export function clearGallery() {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = '';
}

export function showImages(images) {
  const gallery = document.querySelector('.gallery');

  const markup = images
    .map(
      image => `
      <a href="${image.largeImageURL}" class="gallery-item">
        <img src="${image.webformatURL}" alt="${image.tags}" class="gallery-image" />
        <div class="image-info">
          <p>Likes: <span>${image.likes}</span></p>
          <p>Views: <span>${image.views}</span></p>
          <p>Comments: <span>${image.comments}</span></p>
          <p>Downloads: <span>${image.downloads}</span></p>
        </div>
      </a>
    `
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

export function showErrorMessage() {
  iziToast.error({
    title: 'Error',
    message:
      'Sorry, there are no images matching your search query. Please try again!',
  });
}

export function showLoadingIndicator() {
  const loading = document.querySelector('.loading');
  loading.style.display = 'block';
  const loadMoreButton = document.querySelector('.load-more');
  loadMoreButton.style.marginBottom = '20px';
}

export function hideLoadingIndicator() {
  const loading = document.querySelector('.loading');
  loading.style.display = 'none';
}

export function toggleLoadMoreButton(visible) {
  const loadMoreButton = document.querySelector('.load-more');
  loadMoreButton.style.display = visible ? 'block' : 'none';
}

export function showEndOfResultsMessage() {
  iziToast.info({
    title: 'Info',
    message: "We're sorry, but you've reached the end of search results.",
  });
}
