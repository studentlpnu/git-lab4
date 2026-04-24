import axios from 'axios';

const API_KEY = '48291953-85546cde0c7bc9cda0531770b';
const BASE_URL = 'https://pixabay.com/api/';
const PER_PAGE = 20;

let currentPage = 1;

export async function fetchImages(query, page = 1) {
  try {
    const url = `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${PER_PAGE}&page=${page}`;
    const response = await axios.get(url);

    if (response.data.hits.length === 0) {
      throw new Error('No images found');
    }

    currentPage = page;
    return response.data;
  } catch (error) {
    throw error;
  }
}

export function resetPage() {
  currentPage = 1;
}

export function getCurrentPage() {
  return currentPage;
}
