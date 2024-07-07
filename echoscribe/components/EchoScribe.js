import React, { useState } from 'react';
import { Globe, Lock, FileAudio } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EchoScribe = () => {
  const [language, setLanguage] = useState('');
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');

  const handleLanguageChange = (value) => {
    setLanguage(value);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleTranscribe = async () => {
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
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4">Podcast Transcription</h1>
      <h2 className="text-2xl font-semibold mb-4">Transcribe Your Podcast, For Free</h2>
      <p className="mb-4">Introducing the ultimate free and safe solution for transcribing your podcast episodes! It runs completely on your local device, ensuring the highest level of privacy and security.</p>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Select your language</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              {/* Add more language options as needed */}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Choose your audio file</CardTitle>
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

      <Button onClick={handleTranscribe} className="w-full mb-4">
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
          </CardContent>
        </Card>
      )}

      <h3 className="text-xl font-semibold mt-8 mb-4">Why should you use Free Podcast Transcription?</h3>

      <Card className="mb-4">
        <CardContent className="flex items-center space-x-4">
          <Globe className="w-6 h-6" />
          <div>
            <h4 className="font-semibold">COMPLETELY FREE</h4>
            <p>There are no hidden fees or costs associated with using this free podcast transcription tool.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="flex items-center space-x-4">
          <Lock className="w-6 h-6" />
          <div>
            <h4 className="font-semibold">HIGHEST PRIVACY & SECURITY</h4>
            <p>We don't send the mp3 file to a server. All the processing happens on your device.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="flex items-center space-x-4">
          <FileAudio className="w-6 h-6" />
          <div>
            <h4 className="font-semibold">ALL MAIN FORMATS SUPPORTED</h4>
            <p>We are capable of transcribing a wide variety of audio file formats, including MP3.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EchoScribe;