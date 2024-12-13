import { useEffect, useRef } from 'react';
import Quagga from "quagga"; // For barcode scanning
import jsQR from "jsqr"; 
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  const outputRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const startScanner = () => {
      // Initialize Quagga for barcode scanning
      Quagga.init(
        {
          inputStream: {
            type: 'LiveStream',
            constraints: {
              facingMode: 'environment', // Use back camera
            },
            target: videoRef.current, // Attach the video feed
          },
          decoder: {
            readers: ['code_128_reader', 'code_39_reader', 'ean_reader', 'upc_reader'], // Supported formats
          },
        },
        function (err) {
          if (err) {
            console.error(err);
            if (outputRef.current) outputRef.current.textContent = 'Unable to access the camera.';
            return;
          }
          Quagga.start();
          if (outputRef.current) outputRef.current.textContent = 'Waiting for barcode or QR code...';
        }
      );

      // Detect barcodes using Quagga
      Quagga.onDetected((data) => {
        if (outputRef.current) outputRef.current.textContent = `Detected Barcode: ${data.codeResult.code}`;
        Quagga.stop();
      });

      // Use the video stream for QR code scanning
      if (videoRef.current) {
        const processFrame = () => {
          if (canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);

            if (code) {
              if (outputRef.current) outputRef.current.textContent = `Detected QR Code: ${code.data}`;
              Quagga.stop();
              return;
            }
          }
          requestAnimationFrame(processFrame);
        };
        processFrame();
      }
    };

    startScanner();

    return () => {
      Quagga.stop(); // Cleanup on component unmount
    };
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div id="scanner-container" ref={videoRef}></div>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <div id="output" ref={outputRef}>Waiting for barcode or QR code...</div>
      <div className="card">
        <p>Edit <code>src/App.jsx</code> and save to test HMR</p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
