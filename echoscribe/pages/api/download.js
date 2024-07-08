// pages/api/download.js

import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';
import { promisify } from 'util';

const parsepodcast = promisify(nodePodcastParser);

const MAX_CONCURRENT_DOWNLOADS = 10;
const MAX_LOAD_DAYS = 14;
const MAX_FILENAME_LENGTH = 200;

const mime_to_filetype = {
  'audio/mpeg': 'mp3',
};

const PATH_INVALID_CHARS_REGEX = /[\\\/\.\/\*:?"']/g;

const dateSlug = (date) => {
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const resolveHome = (filepath) => {
  if (filepath[0] === '~') {
    return path.join(process.env.HOME, filepath.slice(1));
  }
  return filepath;
};

const generatePodcastDirname = (ep, absolute, config) => {
  const dirname = ep.podcast.title
    .replace(PATH_INVALID_CHARS_REGEX, '-')
    .slice(0, MAX_FILENAME_LENGTH / 3);
  return absolute ? path.resolve(config.download_dir, dirname) : dirname;
};

const generateEpisodeFilename = (ep, config) => {
  const date = new Date(ep.published);
  const date_slug = dateSlug(date);
  return (
    date_slug +
    ' ' +
    ep.title
      .replace(PATH_INVALID_CHARS_REGEX, '-')
      .slice(
        0,
        MAX_FILENAME_LENGTH -
          generatePodcastDirname(ep, true, config).length -
          4 -
          date_slug.length
      ) +
    '.' +
    mime_to_filetype[ep.enclosure.type]
  );
};

const generatePathForEp = async (ep, config) => {
  const dir = generatePodcastDirname(ep, true, config);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
  return `${dir}/${generateEpisodeFilename(ep, config)}`;
};

const markAsDownloaded = async (url, config) => {
  await fs.appendFile(config.log_file, `${url}\n`);
};

const wasDownloaded = async (url, config) => {
  try {
    const content = await fs.readFile(config.log_file, 'utf8');
    return content.split('\n').includes(url);
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
};

const downloadEpisode = async (ep, config) => {
  if (!(ep.enclosure && ep.enclosure.url)) {
    console.error('Could not download this episode: ', ep);
    return null;
  }

  const was_downloaded = await wasDownloaded(ep.enclosure.url, config);
  if (was_downloaded) {
    console.log(ep.title, 'already downloaded, skipping');
    return null;
  }

  console.log('downloading', ep.title);

  try {
    const response = await axios.get(ep.enclosure.url, { responseType: 'arraybuffer' });
    const file_path = await generatePathForEp(ep, config);
    await fs.writeFile(file_path, response.data);
    await markAsDownloaded(ep.enclosure.url, config);
    return `${generatePodcastDirname(ep, false, config)}/${generateEpisodeFilename(ep, config)}`;
  } catch (error) {
    console.error('Error downloading episode:', error);
    return null;
  }
};

const addPathsToWhatsNewPlaylist = async (paths_array, config) => {
  const date_slug = dateSlug(new Date());
  const playlist_path = path.resolve(config.download_dir, `new_on_${date_slug}.m3u`);
  await fs.appendFile(playlist_path, paths_array.join('\n'));
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Podcast URL is required' });
  }

  try {
    const config = {
      download_dir: resolveHome(process.env.DOWNLOAD_DIR || '~/podcasts'),
      log_file: resolveHome(process.env.LOG_FILE || '~/.podcast-downloader.log'),
    };

    const response = await axios.get(url);
    const podcastData = await parsepodcast(response.data);

    const now = Date.now();
    const episodes = podcastData.episodes
      .map(ep => ({ ...ep, published: new Date(ep.published) }))
      .filter(ep => now - ep.published < MAX_LOAD_DAYS * 24 * 60 * 60 * 1000)
      .map(ep => ({ ...ep, podcast: podcastData }))
      .slice(0, parseInt(process.env.NUM_EPISODES) || 5);

    const downloadPromises = episodes.map(ep => downloadEpisode(ep, config));
    const downloadedPaths = await Promise.all(downloadPromises);
    const validPaths = downloadedPaths.filter(path => path !== null);

    await addPathsToWhatsNewPlaylist(validPaths, config);

    res.status(200).json({ message: 'Podcast episodes downloaded successfully', downloadedCount: validPaths.length });
  } catch (error) {
    console.error('Error processing podcast:', error);
    res.status(500).json({ error: 'An error occurred while processing the podcast' });
  }
}