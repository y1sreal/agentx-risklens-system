import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiProduct, apiService, ProductSearchParams } from '../services/apiService';
import { AutoCompleteInput } from '../components/AutoCompleteInput';
import { PrismOnboarding } from '../components/PrismOnboarding';

export const ProductInput: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(true);
    const [product, setProduct] = useState<Partial<ApiProduct>>({
        name: '',
        description: '',
        technology: [],
        purpose: [],
        image_urls: [],
        product_url: ''
    });
    
    // Product list state
    const [existingProducts, setExistingProducts] = useState<ApiProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    
    // Suggestions state
    const [techSuggestions, setTechSuggestions] = useState<string[]>([]);
    const [purposeSuggestions, setPurposeSuggestions] = useState<string[]>([]);
    
    // Stats
    const [systemStats, setSystemStats] = useState<{
        total_products: number;
        total_incidents: number;
        total_mappings: number;
        products_with_images: number;
        human_validated_mappings: number;
    } | null>(null);

    const PRODUCTS_PER_PAGE = 12;

    // Load system stats
    useEffect(() => {
        const loadStats = async () => {
            try {
                const stats = await apiService.getSystemStats();
                setSystemStats(stats);
            } catch (error) {
                console.error('Error loading system stats:', error);
            }
        };
        loadStats();
    }, []);

    // Load suggestions
    useEffect(() => {
        const loadSuggestions = async () => {
            try {
                const [technologies, purposes] = await Promise.all([
                    apiService.getTechnologySuggestions(),
                    apiService.getPurposeSuggestions()
                ]);
                setTechSuggestions(technologies);
                setPurposeSuggestions(purposes);
            } catch (error) {
                console.error('Error loading suggestions:', error);
                // Fallback to default suggestions
                setTechSuggestions([
                    'Machine Learning', 'Natural Language Processing', 'Computer Vision',
                    'Deep Learning', 'Generative AI', 'Large Language Models'
                ]);
                setPurposeSuggestions([
                    'Content Generation', 'Image Recognition', 'Data Analysis',
                    'Automation', 'Customer Service', 'Healthcare', 'Education'
                ]);
            }
        };
        loadSuggestions();
    }, []);

    // Load products with search and pagination
    const loadProducts = useCallback(async (params: ProductSearchParams = {}) => {
        setIsLoadingProducts(true);
        try {
            const response = await apiService.getProducts({
                page: currentPage,
                limit: PRODUCTS_PER_PAGE,
                search: searchQuery || undefined,
                ...params
            });
            
            setExistingProducts(response.items);
            setTotalPages(response.total_pages);
            setTotalProducts(response.total);
        } catch (error) {
            console.error('Error loading products:', error);
            setExistingProducts([]);
        } finally {
            setIsLoadingProducts(false);
        }
    }, [currentPage, searchQuery]);

    // Load products on component mount and when dependencies change
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Search handler with debouncing
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            setCurrentPage(1); // Reset to first page on new search
            loadProducts();
        }, 300);

        return () => clearTimeout(delayedSearch);
    }, [searchQuery]);

    const handleProductSelect = (selectedProduct: ApiProduct) => {
        setSelectedProduct(selectedProduct);
        setProduct({
            name: selectedProduct.name,
            description: selectedProduct.description,
            technology: [...selectedProduct.technology],
            purpose: [...selectedProduct.purpose],
            image_urls: [...selectedProduct.image_urls],
            product_url: selectedProduct.product_url
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newProduct = await apiService.createProduct({
                name: product.name || '',
                description: product.description || '',
                technology: product.technology || [],
                purpose: product.purpose || [],
                image_urls: product.image_urls || [],
                product_url: product.product_url || '',
                pricing_model: '',
                user_count: ''
            });
            
            navigate(`/products/${newProduct.id}/incidents`);
        } catch (error) {
            console.error('Error creating product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const showEllipsis = totalPages > 7;
        
        if (showEllipsis) {
            // Show first page
            pages.push(1);
            
            // Show ellipsis if current page is far from start
            if (currentPage > 4) {
                pages.push('...');
            }
            
            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            // Show ellipsis if current page is far from end
            if (currentPage < totalPages - 3) {
                pages.push('...');
            }
            
            // Show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        } else {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        }

        return (
            <div className="flex justify-center items-center gap-2 mt-6">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                
                {pages.map((page, index) => (
                    <span key={index}>
                        {page === '...' ? (
                            <span className="px-3 py-2 text-sm font-medium text-gray-500">...</span>
                        ) : (
                            <button
                                onClick={() => handlePageChange(page as number)}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                    currentPage === page
                                        ? 'bg-indigo-600 text-white border border-indigo-600'
                                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        )}
                    </span>
                ))}
                
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            {showOnboarding && <PrismOnboarding onClose={() => setShowOnboarding(false)} />}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-lg font-medium text-gray-900">Creating Product...</p>
                        <p className="text-sm text-gray-500 mt-2">Please wait while we process your request</p>
                    </div>
                </div>
            )}
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* System Stats Header */}
                {systemStats && (
                    <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">RiskLens System Overview</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-indigo-600">{systemStats.total_products.toLocaleString()}</div>
                                <div className="text-sm text-gray-500">Products</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">{systemStats.total_incidents.toLocaleString()}</div>
                                <div className="text-sm text-gray-500">Incidents</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{systemStats.total_mappings.toLocaleString()}</div>
                                <div className="text-sm text-gray-500">Mappings</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">{systemStats.products_with_images.toLocaleString()}</div>
                                <div className="text-sm text-gray-500">With Images</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">{systemStats.human_validated_mappings.toLocaleString()}</div>
                                <div className="text-sm text-gray-500">Validated</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left side - Product Input Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Product</h1>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={product.name}
                                    onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={product.description}
                                        onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Describe your product..."
                                        required
                                    />
                            </div>

                            <AutoCompleteInput
                                label="Technologies"
                                value={product.technology || []}
                                setValue={(tech) => setProduct(prev => ({ ...prev, technology: tech }))}
                                suggestions={techSuggestions}
                                placeholder="Add a technology..."
                            />

                            <AutoCompleteInput
                                label="Purposes"
                                value={product.purpose || []}
                                setValue={(purpose) => setProduct(prev => ({ ...prev, purpose: purpose }))}
                                suggestions={purposeSuggestions}
                                placeholder="Add a purpose..."
                            />

                            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shadow-sm hover:shadow-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md ${
                                        loading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Creating...
                                        </div>
                                    ) : (
                                        'Create Product'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right side - Existing Products List with Search */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Available Products ({totalProducts.toLocaleString()})
                            </h2>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="mb-6">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="space-y-4 max-h-[700px] overflow-y-auto">
                            {isLoadingProducts ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : existingProducts.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    {searchQuery ? 'No products found matching your search.' : 'No products available.'}
                                </div>
                            ) : (
                                existingProducts.map((existingProduct) => (
                                <div
                                    key={existingProduct.id}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                                        selectedProduct?.id === existingProduct.id
                                                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                            : 'border-gray-200 hover:border-indigo-300'
                                    }`}
                                    onClick={() => handleProductSelect(existingProduct)}
                                >
                                    <div className="flex items-start gap-4">
                                            {/* Product Image */}
                                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {existingProduct.image_urls.length > 0 ? (
                                                    <img 
                                                        src={existingProduct.image_urls[0]} 
                                                        alt={existingProduct.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                                                {existingProduct.name}
                                            </h3>
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                {existingProduct.description}
                                            </p>
                                                
                                                {/* Technologies */}
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {existingProduct.technology.slice(0, 3).map((tech, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                                    {existingProduct.technology.length > 3 && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                            +{existingProduct.technology.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {/* Product URL Link */}
                                                {existingProduct.product_url && (
                                                    <a
                                                        href={existingProduct.product_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-indigo-600 hover:text-indigo-800"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        View Product →
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {renderPagination()}
                    </div>
                </div>
            </div>
        </div>
    );
}; 