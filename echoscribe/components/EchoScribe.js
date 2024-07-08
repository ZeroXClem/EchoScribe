import React, { useCallback, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Globe = dynamic(() => import('lucide-react').then((mod) => mod.Globe));
const Lock = dynamic(() => import('lucide-react').then((mod) => mod.Lock));
const FileAudio = dynamic(() => import('lucide-react').then((mod) => mod.FileAudio));
const Download = dynamic(() => import('lucide-react').then((mod) => mod.Download));

const EchoScribe = ({ initialLanguage, initialTranscription, initialError, initialDownloadError }) => {
  const [language, setLanguage] = React.useState(initialLanguage);
  const [file, setFile] = React.useState(null);
  const [podcastUrl, setPodcastUrl] = React.useState('');
  const [transcription, setTranscription] = React.useState(initialTranscription);
  const [error, setError] = React.useState(initialError);
  const [downloadError, setDownloadError] = React.useState(initialDownloadError);
  const [downloadStatus, setDownloadStatus] = React.useState('');

  const handleLanguageChange = useCallback((value) => {
    setLanguage(value);
  }, []);

  const handleFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  }, []);

  const handlePodcastUrlChange = useCallback((event) => {
    setPodcastUrl(event.target.value);
  }, []);

  const handleTranscribe = useCallback(async () => {
    if (!file) {
      setError('Please select an audio file.');
      return;
    }

    if (!language) {
      setError('Please select a language.');
      return;
    }

    setError('');
    setTranscription('Transcribing...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-large-v3');
    formData.append('language', language);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      setTranscription(data.text);
    } catch (error) {
      setError('An error occurred during transcription. Please try again.');
      setTranscription('');
    }
  }, [file, language]);

  const handleDownload = useCallback(async () => {
    if (!podcastUrl) {
      setDownloadError('Please enter a Podcast URL.');
      return;
    }

    setDownloadStatus('Downloading...');
    setDownloadError('');

    try {
      const response = await fetch(`/api/download?url=${encodeURIComponent(podcastUrl)}`);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const data = await response.json();
      setDownloadStatus(`Successfully downloaded ${data.downloadedCount} episode(s)`);
    } catch (error) {
      setDownloadError('An error occurred during download. Please try again.');
      setDownloadStatus('');
    }
  }, [podcastUrl]);

  const languageOptions = useMemo(() => [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
  ], []);
  const downloadTranscription = useCallback((format) => {
    if (!transcription) {
      setError('No transcription available to download.');
      return;
    }

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'markdown':
        content = `# Transcription\n\n${transcription}`;
        filename = 'transcription.md';
        mimeType = 'text/markdown';
        break;
      case 'text':
        content = transcription;
        filename = 'transcription.txt';
        mimeType = 'text/plain';
        break;
      case 'csv':
        content = `"Transcription"\n"${transcription.replace(/"/g, '""')}"`;
        filename = 'transcription.csv';
        mimeType = 'text/csv';
        break;
      default:
        setError('Invalid format selected.');
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [transcription]);

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-4xl font-bold mb-4">Podcast Transcription</h1>
      <h2 className="text-3xl font-semibold mb-4">Transcribe Your Podcast, For Free</h2>
      <p className="text-lg mb-4">Introducing the ultimate free and safe solution for transcribing your podcast episodes! It runs completely on your local device, ensuring the highest level of privacy and security.</p>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl">Select your language</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleLanguageChange} value={language}>
            <SelectTrigger>
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl">Choose your audio file</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept=".mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm"
            onChange={handleFileChange}
            className="w-full"
          />
        </CardContent>
      </Card>

      <Button onClick={handleTranscribe} className="w-full mb-4 text-base">
        Transcribe!
      </Button>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {transcription && (
    <Card>
      <CardHeader>
        <CardTitle>Transcription</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{transcription}</p>
        <div className="mt-4 flex space-x-2">
          <Button onClick={() => downloadTranscription('markdown')} size="sm">
            Download as Markdown
          </Button>
          <Button onClick={() => downloadTranscription('text')} size="sm">
            Download as Text
          </Button>
          <Button onClick={() => downloadTranscription('csv')} size="sm">
            Download as CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  )}

      <h3 className="text-2xl font-semibold mt-8 mb-4">Download Podcast</h3>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl">Enter podcast URL</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="url"
            value={podcastUrl}
            onChange={handlePodcastUrlChange}
            className="w-full p-2 border rounded"
            placeholder="https://example.com/podcast"
          />
        </CardContent>
      </Card>

      <Button onClick={handleDownload} className="w-full mb-4 text-base flex items-center justify-center">
        <Download className="w-4 h-4 mr-2" /> Download
      </Button>

      {downloadStatus && (
        <Alert className="mb-4">
          <AlertDescription>{downloadStatus}</AlertDescription>
        </Alert>
      )}

      {downloadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{downloadError}</AlertDescription>
        </Alert>
      )}

      <h3 className="text-2xl font-semibold mt-8 mb-4">Why should you use Free Podcast Transcription?</h3>

      <Card className="mb-4">
        <CardContent className="flex items-center space-x-4">
          <Globe className="w-6 h-6" />
          <div>
            <h4 className="text-lg font-semibold">COMPLETELY FREE</h4>
            <p>There are no hidden fees or costs associated with using this free podcast transcription tool.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="flex items-center space-x-4">
          <Lock className="w-6 h-6" />
          <div>
            <h4 className="text-lg font-semibold">HIGHEST PRIVACY & SECURITY</h4>
            <p>We don't send the mp3 file to a server. All the processing happens on your device.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="flex items-center space-x-4">
          <FileAudio className="w-6 h-6" />
          <div>
            <h4 className="text-lg font-semibold">ALL MAIN FORMATS SUPPORTED</h4>
            <p>We are capable of transcribing a wide variety of audio file formats, including MP3.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export async function getServerSideProps() {
  // You can fetch initial data here if needed
  return {
    props: {
      initialLanguage: '',
      initialTranscription: '',
      initialError: '',
      initialDownloadError: '',
    },
  };
}

export default EchoScribe;