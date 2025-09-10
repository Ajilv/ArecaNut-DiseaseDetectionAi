import React, { useState, useRef } from 'react';
import { Upload, Activity, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { analysisAPI } from '../../services/api';
import { SUPPORTED_IMAGE_TYPES, MAX_FILE_SIZE } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';

const AnalysisForm = ({ onAnalysisComplete }) => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, GIF, WebP)';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setImage(file);

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError('');
      setImage(file);

      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setError('Please select an image to analyze');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Form: Submitting file:', image.name);
      const result = await analysisAPI.analyze(image);
      console.log('Form: Analysis result:', result);
      onAnalysisComplete(result);

      // Reset form
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Form: Analysis error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card text-center py-12">
          <LoadingSpinner size="large" text="Analyzing your image..." />
          <p className="text-gray-600 mt-4">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">New Disease Analysis</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Medical Image *
              </label>

              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 max-w-full rounded-lg shadow-md border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{image?.name}</p>
                    <p>Size: {image ? (image.size / 1024 / 1024).toFixed(2) : 0} MB</p>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">
                      Drop your image here, or click to browse
                    </p>
                    <p className="text-gray-500">
                      Supports: JPEG, PNG, GIF, WebP (Max: 10MB)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!image || loading}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Activity className="w-5 h-5" />
                <span>Analyze Image</span>
              </button>

              {!image && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Please upload an image to proceed with analysis
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnalysisForm;