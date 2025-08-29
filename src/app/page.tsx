'use client';

import { useState, useRef, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  category: string;
  description: string;
  inStock: boolean;
  isOnSale: boolean;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch products from our new API route
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error fetching products');
      }
    };
    fetchProducts();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(e.target?.result as string);
        setGeneratedResult(null); // Clear previous result on new image
        setError(null);
      };
      reader.onerror = () => {
        setError("Failed to read the image file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!userImage || !selectedProduct) {
      setError("Please select a product and upload your image first.");
      return;
    }
    
    setIsGenerating(true);
    setGeneratedResult(null);
    setError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: selectedProduct.name,
          userImageBase64: userImage,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate image');
      }

      const result = await response.json();
      setGeneratedResult(result.data.generatedImage);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-100">
        {/* Navigation Bar */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="font-bold text-xl text-gray-800">Tia Lorens</span>
              </div>
              <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
                <a href="#" className="hover:text-gray-800 transition-colors">Shop</a>
                <a href="#" className="hover:text-gray-800 transition-colors">Kontakt</a>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
              Virtual Try-On
              <span className="block bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                AI Tehnologija
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Isprobajte našu garderobu sa naprednom AI tehnologijom pre kupovine. 
              Jednostavno dodajte svoju sliku i vidite kako vam stoji bilo koji proizvod.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Virtual Try-On Section */}
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Kreiranje modela
                  </h2>
                </div>
                
                {/* Selected Product Display */}
                {selectedProduct && (
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 md:p-6 mb-8 border border-pink-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg">{selectedProduct.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{selectedProduct.category}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-gray-900">
                            {selectedProduct.price.toLocaleString()} RSD
                          </span>
                          {selectedProduct.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {selectedProduct.originalPrice.toLocaleString()} RSD
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Upload Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">1</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Dodajte svoju fotografiju</h3>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <div 
                    onClick={triggerFileInput}
                    className="relative group cursor-pointer"
                  >
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 md:p-12 text-center hover:border-pink-400 transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-pink-50 group-hover:to-purple-50">
                      {!userImage ? (
                        <div className="space-y-4">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-700 group-hover:text-gray-900">
                              Kliknite da dodate sliku
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              PNG, JPG do 10MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <img
                            src={userImage}
                            alt="Uploaded"
                            className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-2xl mx-auto shadow-lg"
                          />
                          <p className="text-sm font-medium text-gray-600">
                            Kliknite da promenite sliku
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                {userImage && selectedProduct && (
                  <div className="space-y-6 mt-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">2</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Generiši svoj model</h3>
                    </div>
                    
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full py-4 px-8 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold rounded-2xl text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isGenerating ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>Tia Lorens generiše tvoj model...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Isprobaj model</span>
                        </div>
                      )}
                    </button>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
                    <p><strong>Greška:</strong> {error}</p>
                  </div>
                )}
                
                {/* Generated Result */}
                {generatedResult && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">🎉 Vaš rezultat je spreman!</h3>
                    <img
                      src={generatedResult}
                      alt="Generated result"
                      className="w-full max-w-md mx-auto rounded-2xl shadow-lg"
                    />
                    <p className="text-center text-sm text-gray-600 mt-4">
                      Evo kako vam stoji <strong>{selectedProduct?.name}</strong>!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Products Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Naša kolekcija
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`group p-4 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                        selectedProduct?.id === product.id
                          ? 'bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 shadow-lg'
                          : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors overflow-hidden">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight">
                              {product.name}
                            </h3>
                            {selectedProduct?.id === product.id && (
                              <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg md:text-xl font-bold text-gray-900">
                                  {product.price.toLocaleString()} RSD
                                </span>
                                {product.originalPrice && (
                                  <span className="text-sm text-gray-500 line-through">
                                    {product.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {product.isOnSale && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                    Akcija
                                  </span>
                                )}
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  product.inStock 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {product.inStock ? 'Dostupno' : 'Rasprodato'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <span className="text-xs text-gray-500 font-medium">
                              {product.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {!selectedProduct && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <p className="text-sm text-blue-800 text-center">
                      👆 Kliknite na proizvod da počnete sa virtual try-on
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen AI Generation Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-8 p-8">
            <div className="relative">
              <div className="w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-pink-200 rounded-full animate-ping"></div>
                <div className="absolute inset-2 border-4 border-purple-200 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
                <div className="absolute inset-4 border-4 border-pink-400 rounded-full animate-spin"></div>
                <div className="absolute inset-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Tia Lorens generiše tvoj model
              </h2>
              <p className="text-lg text-gray-300 max-w-md mx-auto">
                AI tehnologija kreira personalizovan prikaz kako ti stoji {selectedProduct?.name}.
              </p>
              <div className="flex items-center justify-center space-x-2 text-pink-400">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
    </div>
      )}
    </>
  );
}
