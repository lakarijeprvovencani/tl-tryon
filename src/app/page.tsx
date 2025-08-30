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
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
        setGeneratedResult(null);
        setError(null);
        setCurrentStep(2);
      };
      reader.onerror = () => {
        setError("Failed to read the image file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentStep(3);
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setUserImage(null);
    setSelectedProduct(null);
    setGeneratedResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      // Gemini API očekuje samo čist Base64 string, bez 'data:image/jpeg;base64,'
      // prefiksa koji FileReader dodaje. Ovde izdvajamo samo Base64 deo.
      const userImageBase64 = userImage.split(',')[1];

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: selectedProduct.name,
          userImageBase64: userImageBase64,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate image');
      }

      const result = await response.json();
      setGeneratedResult(result.data.generatedImage);
      setCurrentStep(4);

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
              <div className="flex items-center space-x-3">
                <img 
                  src="/assets/images/tia_logo.webp" 
                  alt="Tia Lorens" 
                  className="h-10 w-auto"
                />
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
          {/* Hero Section - Hide when showing result */}
          {currentStep !== 4 && (
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-6">
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Isprobaj pre kupovine
                </span>
              </h1>
              <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Naš AI ti omogućava da vidiš kako će garderoba izgledati baš na tebi. 
                Dodaj svoju fotografiju i obuci Tia Lorens.
              </p>
            </div>
          )}

          {/* Step-by-Step Mobile Flow */}
          <div className="max-w-lg mx-auto">
            
            {/* STEP 1: Upload Image */}
            {currentStep === 1 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">1</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Dodaj svoju fotografiju
                    </h2>
                    <p className="text-gray-600">
                      Upload-uj svoju sliku da počneš sa virtual try-on
                    </p>
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
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-pink-400 transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-pink-50 group-hover:to-purple-50">
                      <div className="space-y-4">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-gray-700 group-hover:text-gray-900">
                            Kliknite da dodate sliku
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            PNG, JPG do 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Select Product */}
            {currentStep === 2 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">2</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Odaberi proizvod iz kolekcije
                    </h2>
                    <p className="text-gray-600">
                      Klikni na proizvod koji želiš da isprobas
                    </p>
                  </div>

                  <div className="space-y-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="group p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base leading-tight">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-gray-900">
                                {product.price.toLocaleString()} RSD
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  {product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleStartOver}
                    className="w-full mt-6 py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                  >
                    ← Nazad na upload slike
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Preview */}
            {currentStep === 3 && selectedProduct && userImage && (
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">3</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Pregled pre kreiranja
                    </h2>
                    <p className="text-gray-600">
                      Proveri da li je sve u redu pre generisanja
                    </p>
                  </div>

                  {/* User Image */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tvoja fotografija:</h3>
                    <div className="bg-gray-100 rounded-2xl p-4 flex justify-center">
                      <img
                        src={userImage}
                        alt="Your photo"
                        className="w-32 h-32 object-cover rounded-xl shadow-lg"
                      />
                    </div>
                  </div>

                  {/* Selected Product */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Odabrani proizvod:</h3>
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{selectedProduct.name}</h4>
                          <p className="text-sm text-gray-600 mb-1">{selectedProduct.description}</p>
                          <span className="text-lg font-bold text-gray-900">
                            {selectedProduct.price.toLocaleString()} RSD
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full py-4 px-8 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold rounded-2xl text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Kreiraj model</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="w-full py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                    >
                      ← Promeni proizvod
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Result */}
            {currentStep === 4 && generatedResult && (
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-6 md:p-8">
                  {/* Generated Image */}
                  <div className="mb-8">
                    <div className="bg-gray-100 rounded-2xl p-4 flex justify-center">
                      <img
                        src={generatedResult}
                        alt="Generated result"
                        className="w-full max-w-sm rounded-xl shadow-lg"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => window.open('https://tialorens.rs/kontakt', '_blank')}
                      className="w-full py-4 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                    >
                      🛒 Poruči ovaj proizvod
                    </button>
                    
                    <button
                      onClick={handleStartOver}
                      className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300"
                    >
                      ✨ Isprobaj još nešto
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
                <p><strong>Greška:</strong> {error}</p>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* CLEAN Loading Animation - NO spinning circles */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-8 p-8">
            <div className="w-24 h-24 mx-auto">
              <div className="w-full h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Tia Lorens generiše tvoj model
              </h2>
              <p className="text-lg text-gray-300 max-w-md mx-auto">
                AI tehnologija kreira personalizovan prikaz kako ti stoji {selectedProduct?.name}.
              </p>
              
              {/* Clothing Animation */}
              <div className="flex items-center justify-center space-x-4 py-4">
                <div className="animate-bounce" style={{animationDelay: '0s'}}>👕</div>
                <div className="animate-bounce" style={{animationDelay: '0.2s'}}>👗</div>
                <div className="animate-bounce" style={{animationDelay: '0.4s'}}>👖</div>
                <div className="animate-bounce" style={{animationDelay: '0.6s'}}>👔</div>
                <div className="animate-bounce" style={{animationDelay: '0.8s'}}>🧥</div>
              </div>
              
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
