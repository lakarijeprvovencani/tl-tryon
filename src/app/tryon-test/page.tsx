'use client';

import { useState } from 'react';

export default function TryOnTestPage() {
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personFile || !garmentFile) {
      setError('Please select both person and garment images');
      return;
    }

    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const formData = new FormData();
      formData.append('person', personFile);
      formData.append('garment', garmentFile);

      const response = await fetch('/api/tryon', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Get the image blob
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setResultImage(imageUrl);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Virtual Try-On Test
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Person Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Person Image
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => setPersonFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {personFile && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(personFile)}
                    alt="Person preview"
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
              )}
            </div>

            {/* Garment Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Garment Image
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => setGarmentFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {garmentFile && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(garmentFile)}
                    alt="Garment preview"
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading || !personFile || !garmentFile}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Try-On'}
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {/* Result Display */}
        {resultImage && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Generated Result</h2>
            <div className="flex justify-center">
              <img
                src={resultImage}
                alt="Generated try-on result"
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="mt-4 text-center">
              <a
                href={resultImage}
                download="tryon-result.png"
                className="inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Download Result
              </a>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Instructions:</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• Upload a clear photo of a person</li>
            <li>• Upload a clear photo of the garment</li>
            <li>• Both images should be JPEG or PNG format</li>
            <li>• Maximum file size: 10MB per image</li>
            <li>• The AI will generate a realistic image of the person wearing the garment</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


