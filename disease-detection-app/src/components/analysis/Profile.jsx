import React, { useState, useEffect, useRef } from 'react';
import { authAPI } from '../../services/api';
import { User, AlertCircle, Upload, Save, X } from 'lucide-react';
import { API_BASE_URL, SUPPORTED_IMAGE_TYPES, MAX_FILE_SIZE,MEDIA_BASE_URL } from '../../utils/constants';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    profile_picture: null,
    website: '',
    location: '',
    birth_date: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Profile: Fetching profile...');
        const response = await authAPI.getProfile();
        console.log('Profile: API response:', response);
        setProfile(response);
        setFormData({
          profile_picture: null,
          website: response.website || '',
          location: response.location || '',
          birth_date: response.birth_date || ''
        });
        const imageUrl = response.profile_picture ? `${MEDIA_BASE_URL}${response.profile_picture}` : null;
        console.log('Profile: Generated image URL:', imageUrl);
        setImagePreview(imageUrl);
      } catch (err) {
        console.error('Profile: Fetch error:', err.response?.data);
        setError(err.response?.data?.error || 'Failed to load profile. You may need to create a profile.');
        setIsEditing(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const validateFile = (file) => {
    if (!file) return null;
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
    if (!file) {
      console.log('Profile: No file selected');
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    console.log('Profile: Image selected:', file.name);
    setError('');
    setFormData((prev) => ({ ...prev, profile_picture: file }));

    const reader = new FileReader();
    reader.onload = () => {
      console.log('Profile: Image preview loaded');
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    console.log('Profile: Removing image');
    setFormData((prev) => ({ ...prev, profile_picture: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      if (formData.profile_picture) {
        data.append('profile_picture', formData.profile_picture);
      }
      data.append('website', formData.website || '');
      data.append('location', formData.location || '');
      data.append('birth_date', formData.birth_date || '');

      console.log('Profile: Submitting form data:', {
        profile_picture: formData.profile_picture?.name,
        website: formData.website,
        location: formData.location,
        birth_date: formData.birth_date
      });

      let response;
      if (profile) {
        console.log('Profile: Updating existing profile (PUT)');
        response = await authAPI.updateProfile(data);
      } else {
        console.log('Profile: Creating new profile (POST)');
        response = await authAPI.createProfile(data);
      }

      console.log('Profile: API response:', response);
      setProfile(response);
      setFormData({
        profile_picture: null,
        website: response.website || '',
        location: response.location || '',
        birth_date: response.birth_date || ''
      });
      const imageUrl = response.profile_picture ? `${API_BASE_URL}${response.profile_picture}` : null;
      console.log('Profile: Updated image URL:', imageUrl);
      setImagePreview(imageUrl);
      setIsEditing(false);
    } catch (err) {
      console.error('Profile: Submit error:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="card py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Profile </h2>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-6">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="max-h-32 max-w-full rounded-lg shadow-md border"
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
                    <p className="font-medium">{formData.profile_picture?.name || 'Current image'}</p>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-900">Upload profile picture</p>
                  <p className="text-xs text-gray-500">Supports: JPEG, PNG, GIF, WebP (Max: 10MB)</p>
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

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="input-field"
                placeholder="https://example.com"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter your location"
              />
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleInputChange}
                className="input-field"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <span>Cancel</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Profile Picture */}
            {profile?.profile_picture && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Profile Picture</h3>
                <img
                  src={`${MEDIA_BASE_URL}${profile.profile_picture}`}
                  alt="Profile"
                  className="max-h-32 max-w-full rounded-lg shadow-md border"
                  onError={(e) => {
                    console.error(`Failed to load profile picture: ${MEDIA_BASE_URL}${profile.profile_picture} - Error:`, e);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => console.log(`Profile: Image loaded successfully: ${MEDIA_BASE_URL}${profile.profile_picture}`)}
                />
              </div>
            )}

            {/* Website */}
            {profile?.website && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Website</h3>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {profile.website}
                </a>
              </div>
            )}

            {/* Location */}
            {profile?.location && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                <p className="text-gray-600">{profile.location}</p>
              </div>
            )}

            {/* Birth Date */}
            {profile?.birth_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Birth Date</h3>
                <p className="text-gray-600">{new Date(profile.birth_date).toLocaleDateString()}</p>
              </div>
            )}

            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;