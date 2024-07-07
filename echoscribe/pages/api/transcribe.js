import { IncomingForm } from 'formidable';
import fs from 'fs';
import { Groq } from 'groq';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const file = files.file[0];
    const language = fields.language[0];

    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    try {
      const transcription = await client.audio.transcriptions.create({
        file: fs.createReadStream(file.filepath),
        model: 'whisper-large-v3',
        language: language,
      });

      res.status(200).json({ text: transcription.text });
    } catch (error) {
      console.error('Transcription error:', error);
      res.status(500).json({ error: 'Transcription failed' });
    }
  });
}