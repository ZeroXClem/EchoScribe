# EchoScribe

EchoScribe is a free, open-source podcast transcription tool that prioritizes privacy and ease of use. It leverages the power of Groq's Whisper API to provide accurate transcriptions while keeping your audio files secure.

## Features

- **Free to Use**: No hidden fees or costs.
- **Privacy-Focused**: Audio processing happens on your device.
- **Multiple Languages**: Support for various languages.
- **Wide Format Support**: Compatible with MP3, MP4, WAV, and more.
- **User-Friendly Interface**: Simple, intuitive design for easy transcription.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- A Groq API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/echoscribe.git
   cd echoscribe
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your Groq API key:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Select the language of your audio file.
2. Upload your audio file (supported formats: MP3, MP4, WAV, etc.).
3. Click "Transcribe" and wait for the process to complete.
4. View your transcription results.

## Deployment

EchoScribe is designed to be easily deployed on Vercel. Follow these steps:

1. Push your code to a GitHub repository.
2. Connect your GitHub repository to Vercel.
3. Add the `GROQ_API_KEY` environment variable in your Vercel project settings.
4. Deploy your application.

## Contributing

We welcome contributions to EchoScribe! Please feel free to submit issues, fork the repository and send pull requests!

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- [Groq](https://groq.com/) for providing the Whisper API
- [Next.js](https://nextjs.org/) for the React framework
- [shadcn/ui](https://ui.shadcn.com/) for the UI components
