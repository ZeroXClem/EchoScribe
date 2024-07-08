import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import axios from 'axios';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const file = files.file[0];
    const language = fields.language[0];

    if (!file || !language) {
      return res.status(400).json({ error: 'Missing file or language' });
    }

    try {
      const fileContent = await fs.readFile(file.filepath);

      const formData = new FormData();
      formData.append('file', fileContent, file.originalFilename);
      formData.append('model', 'whisper-large-v3');
      formData.append('language', language);
      formData.append('response_format', 'json');

      const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
      });

      const transcription = response.data.text;

      res.status(200).json({ text: transcription });
    } catch (error) {
      console.error('Transcription error:', error.response?.data || error.message);
      res.status(500).json({ error: 'Transcription failed' });
    }
  });
}